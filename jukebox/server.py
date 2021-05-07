import asyncio
import json
from datetime import datetime, timedelta
from functools import partial, wraps
from io import BytesIO
from logging import getLogger
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import AsyncIterator, Type, Union

import jwt
from peewee import DoesNotExist, IntegrityError, fn
from quart import (
    Quart,
    Response,
    jsonify,
    make_response,
    request,
    send_file,
    send_from_directory,
)
from quart.logging import serving_handler

from jukebox import APP_ROOT, CONFIGS
from jukebox.db_models import (
    Album,
    AlbumArtist,
    Artist,
    LovedAlbum,
    LovedArtist,
    LovedTrack,
    Playlist,
    Track,
    User,
    create_tables,
    database,
)
from jukebox.scan_files import check_config_file, get_artist_images, scan_files

check_config_file()


app = Quart(__name__)


def token_required(f):
    @wraps(f)
    async def verify(*args, **kwargs):
        invalid_msg = {
            "message": "Invalid token. Registeration and / or authentication required.",
            "authenticated": False,
        }
        expired_msg = {
            "message": "Expired token. Reauthentication required.",
            "authenticated": False,
        }

        try:
            token = request.cookies["jwttoken"]
            jwt.decode(token, CONFIGS["secret_key"], algorithms=["HS256"])
            return await f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return Response(
                response=json.dumps(expired_msg),
                headers={"Location": "/login", "Content-Type": "application/json"},
                status=307,
            )
        except (jwt.InvalidTokenError, Exception):
            return Response(
                response=json.dumps(invalid_msg),
                headers={"Location": "/login", "Content-Type": "application/json"},
                status=307,
            )

    return verify


if CONFIGS["logging"]["enabled"]:
    handler = RotatingFileHandler(
        APP_ROOT / "jukebox.log",
        maxBytes=CONFIGS["logging"]["maxBytes"],
        backupCount=CONFIGS["logging"]["backupCount"],
    )
    handler.setFormatter(serving_handler.formatter)
    serving_logger = getLogger("quart.serving")
    serving_logger.addHandler(handler)


@app.before_serving
async def get_images() -> None:
    await asyncio.get_running_loop().run_in_executor(None, scan_files)
    # asyncio.create_task(get_artist_images())


@app.route("/")
@app.route("/page/<path:_>")
@token_required
async def root(_: str = None) -> Response:
    return await send_from_directory(APP_ROOT / "frontend" / "dist", "index.html")


@app.route("/<path:path>")
async def send_dist(path: str) -> Response:
    return await send_from_directory(APP_ROOT / "frontend" / "dist", path)


@app.route("/login")
async def login_page() -> Response:
    return await send_from_directory(APP_ROOT / "frontend" / "dist", "index.html")


@app.route("/login", methods=["POST"])
async def login_authenticate() -> Response:
    # noinspection PyUnresolvedReferences
    data = await request.get_data()
    data = json.loads(data.decode("utf-8"))
    user = User.authenticate(**data)

    if not user:
        return jsonify(
            {"message": "Invalid credentials", "authenticated": False},
        )

    token = jwt.encode(
        {
            "sub": user.username,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(minutes=30),
        },
        CONFIGS["secret_key"],
        algorithm="HS256",
    )
    resp = jsonify({"message": "Authenticated", "user": user.to_json()})
    resp.set_cookie(
        "jwttoken",
        token,
        expires=datetime.utcnow() + timedelta(days=7),
        secure=CONFIGS["ssl"],
        samesite="Strict",
        httponly=True,
    )
    return resp


@app.route("/task/get_artist_images")
@token_required
async def get_images() -> str:
    asyncio.create_task(get_artist_images())
    return "Success"


@app.route("/task/scan_files")
@token_required
async def update_files() -> str:
    loop = asyncio.get_running_loop()
    loop.run_in_executor(None, scan_files)
    return "Success"


@app.route("/artists")
@token_required
async def get_artists() -> Response:
    with database.atomic():
        artists = Artist.select().order_by(fn.Lower(Artist.name))
        return jsonify([artist.to_json() for artist in artists])


@app.route("/artists/<int:artist_id>")
@token_required
async def get_artist(artist_id: int) -> Response:
    with database.atomic():
        artist = Artist.get(artist_id)
        return jsonify(artist.to_json())


@app.route("/artists/<int:artist_id>/image")
@token_required
async def get_artist_image(artist_id: int) -> Response:
    with database.atomic():
        artist = Artist.get(artist_id)
        if len(artist.images) > 0 and not artist.images[0].not_found:
            image = BytesIO(artist.images[0].small)
            return await send_file(image, mimetype="image/jpg")
        else:
            return await send_file(
                APP_ROOT / "frontend" / "dist" / "assets" / "generic_artist.png",
                mimetype="image/png",
            )


@app.route("/artists/<int:artist_id>/albums")
@token_required
async def get_artist_albums(artist_id: int) -> Response:
    with database.atomic():
        albums = (
            Album.select()
            .join(AlbumArtist)
            .where(AlbumArtist.artist_id == artist_id)
            .order_by(fn.Lower(Album.title))
        )
        return jsonify([album.to_json() for album in albums])


@app.route("/artists/<int:artist_id>/tracks")
@token_required
async def get_artist_tracks(artist_id: int) -> Response:
    with database.atomic():
        albums = (
            Track.select()
            .join(Artist)
            .switch(Track)
            .join(Album)
            .where(Artist.artist_id == artist_id)
            .order_by(
                fn.Lower(Artist.name),
                fn.Lower(Album.title),
                Track.disc_number,
                Track.track_number,
            )
        )
        return jsonify([album.to_json() for album in albums])


@app.route("/albums")
@token_required
async def get_albums() -> Response:
    with database.atomic():
        albums = Album.select().order_by(fn.Lower(Album.title))
        return jsonify([album.to_json() for album in albums])


@app.route("/albums/<int:album_id>")
@token_required
async def get_album(album_id: int = None) -> Response:
    with database.atomic():
        album = Album.get(album_id)
        return jsonify(album.to_json())


@app.route("/albums/<int:album_id>/image")
@token_required
async def get_album_image(album_id: int) -> Response:
    with database.atomic():
        album = Album.get(album_id)
        album_art_file = Path(album.album_art_path)
        if album_art_file.exists():
            return await send_file(album.album_art_path)
        else:
            return await send_file(
                APP_ROOT / "frontend" / "dist" / "assets" / "generic_album.png",
                mimetype="image/png",
            )


@app.route("/albums/<int:album_id>/tracks")
@token_required
async def get_albums_tracks(album_id: int) -> Response:
    with database.atomic():
        tracks = (
            Track.select()
            .distinct()
            .join(Album)
            .where(Album.album_id == album_id)
            .order_by(Track.disc_number, Track.track_number)
        )
        return jsonify([track.to_json() for track in tracks])


@app.route("/tracks")
@token_required
async def get_tracks() -> Response:
    with database.atomic():
        tracks = (
            Track.select()
            .distinct()
            .join(Artist)
            .switch(Track)
            .join(Album)
            .order_by(
                fn.Lower(Artist.name),
                fn.Lower(Album.title),
                Track.disc_number,
                Track.track_number,
            )
        )
    return jsonify([track.to_json() for track in tracks])


@app.route("/tracks/<int:track_id>")
@token_required
async def get_track(track_id: int) -> Response:
    with database.atomic():
        track = Track.get(int(track_id))
        return jsonify([track.to_json()])


@app.route("/tracks/<int:track_id>/image")
async def get_track_image(track_id: int) -> Response:
    with database.atomic():
        track = Track.get(track_id)
        album_art_file = Path(track.album.album_art_path)
        if album_art_file.exists():
            return await send_file(track.album.album_art_path)
        else:
            return await send_file(
                APP_ROOT / "frontend" / "dist" / "assets" / "generic_album.png",
                mimetype="image/png",
            )


@app.route("/genres")
@token_required
async def get_genres() -> Response:
    with database.atomic():
        genres = Track.select(Track.genre).distinct().order_by(fn.Lower(Track.genre))
        return jsonify(genres)


@app.route("/genres/<string:genre>")
@token_required
async def get_tracks_by_genre(genre: str) -> Response:
    with database.atomic():
        tracks = [
            Track.select().where(Track.genre == genre).order_by(fn.Lower(Track.title))
        ]
        return jsonify([track.to_json() for track in tracks])


@app.route("/playlists/<int:user_id>")
@token_required
async def get_playlist_names(user_id: int) -> Response:
    with database.atomic():
        playlists = (
            Playlist.select(Playlist.playlist_name)
            .distinct()
            .where(Playlist.user == user_id)
            .order_by(fn.Lower(Playlist.playlist_name))
        )
        return jsonify([playlist.playlist_name for playlist in playlists])


@app.route("/playlists/<int:user_id>/<string:playlist_name>", methods=["GET"])
@token_required
async def get_playlist_tracks(user_id: int, playlist_name: str) -> Response:
    with database.atomic():
        tracks = (
            Track.select()
            .join(Playlist)
            .where(Playlist.playlist_name == playlist_name, Playlist.user == user_id)
            .order_by(Playlist.order)
        )
        return jsonify([track.to_json() for track in tracks])


@app.route("/playlists/<int:user_id>/<string:playlist_name>", methods=["DELETE"])
@token_required
async def delete_track_from_playlist(user_id: int, playlist_name: str) -> Response:
    with database.atomic():
        query = Playlist.delete().where(
            Playlist.user == user_id, Playlist.playlist_name == playlist_name
        )
        query.execute()
        playlists = (
            Playlist.select(Playlist.playlist_name)
            .distinct()
            .where(Playlist.user == user_id)
            .order_by(fn.Lower(Playlist.playlist_name))
        )
        return jsonify([playlist.playlist_name for playlist in playlists])


@app.route(
    "/playlists/<int:user_id>/<string:old_playlist_name>/<string:new_playlist_name>"
)
@token_required
async def rename_playlist(
    user_id: int, old_playlist_name: str, new_playlist_name: str
) -> Response:
    with database.atomic():
        playlists = Playlist.select().where(
            Playlist.user == user_id, Playlist.playlist_name == old_playlist_name
        )
        for playlist in playlists:
            playlist.playlist_name = new_playlist_name
        Playlist.bulk_update(playlists, fields=[Playlist.playlist_name])
        playlists = (
            Playlist.select(Playlist.playlist_name)
            .distinct()
            .where(Playlist.user == user_id)
            .order_by(fn.Lower(Playlist.playlist_name))
        )
        return jsonify([playlist.playlist_name for playlist in playlists])


@app.route(
    "/playlists/<string:playlist_name>/<int:track_id>/<int:user_id>",
    methods=["PUT"],
)
@token_required
async def alter_playlists(playlist_name: str, track_id: int, user_id: int) -> str:
    with database.atomic():
        try:
            result = (
                Playlist.select(fn.MAX(Playlist.order).alias("order"))
                .where(
                    Playlist.playlist_name == playlist_name,
                    Playlist.user == user_id,
                )
                .group_by(Playlist.playlist_name, Playlist.user)
            )
            if result:
                order = result[0].order + 1
            else:
                order = 1
            Playlist.create(
                playlist_name=playlist_name,
                track=track_id,
                user=user_id,
                order=order,
            )
        except IntegrityError:
            return "Already exists"
        return "Success"


@app.route(
    "/playlists/<string:playlist_name>/<int:track_id>/<int:user_id>",
    methods=["DELETE"],
)
@token_required
async def delete_from_playlist(playlist_name: str, track_id: int, user_id: int) -> str:
    with database.atomic():
        result = Playlist.select().where(
            Playlist.playlist_name == playlist_name,
            Playlist.user == user_id,
            Playlist.track == track_id,
        )
        if result:
            order = result[0].order
        else:
            order = 1
        query = Playlist.delete().where(
            Playlist.playlist_name == playlist_name,
            Playlist.user == user_id,
            Playlist.track == track_id,
        )
        query.execute()
        tracks = Playlist.select().where(
            Playlist.playlist_name == playlist_name,
            Playlist.user == user_id,
            Playlist.order > order,
        )
        for track in tracks:
            track.order -= 1
        if tracks:
            Playlist.bulk_update(tracks, fields=[Playlist.order])
        return "Success"


def get_love_table(
    love_type: str,
) -> Union[str, Type[LovedTrack], Type[LovedAlbum], Type[LovedArtist]]:
    if love_type == "track":
        return LovedTrack
    elif love_type == "album":
        return LovedAlbum
    elif love_type == "artist":
        return LovedArtist
    else:
        raise TypeError(f"Not a recognised love type [{love_type}]")


@app.route("/love/<string:love_type>/<int:user_id>", methods=["GET"])
@token_required
async def get_loved(love_type: str, user_id: int) -> Response:
    try:
        table = get_love_table(love_type)
    except TypeError as err:
        return Response({"error": str(err)})
    with database.atomic():
        loved_items = table.select().where(table.user_id == user_id)
        if isinstance(table, LovedTrack):
            return jsonify([loved.track for loved in loved_items])
        if isinstance(table, LovedAlbum):
            return jsonify([loved.album for loved in loved_items])
        if isinstance(table, LovedArtist):
            return jsonify([loved.artist for loved in loved_items])


@app.route("/love/<string:love_type>/<int:user_id>/<int:loved_id>", methods=["PUT"])
@token_required
async def love(love_type: str, user_id: int, loved_id: int) -> str:
    try:
        table = get_love_table(love_type)
    except TypeError as err:
        return str(err)
    with database.atomic():
        try:
            table_call = partial(table.create, user=user_id)
            if isinstance(table, LovedTrack):
                table_call(track=loved_id)
            if isinstance(table, LovedAlbum):
                table_call(album=loved_id)
            if isinstance(table, LovedArtist):
                table_call(artist=loved_id)
            return "Success"
        except IntegrityError:
            return "Already Exists"


@app.route("/love/<string:love_type>/<int:user_id>/<int:loved_id>", methods=["DELETE"])
@token_required
async def unlove(love_type: str, user_id: int, loved_id: int) -> str:
    try:
        table = get_love_table(love_type)
    except TypeError as err:
        return str(err)
    with database.atomic():
        partial_query = partial(table.delete().where, table.user == user_id)
        if isinstance(table, LovedTrack):
            query = partial_query(table.track == loved_id)
        if isinstance(table, LovedAlbum):
            query = partial_query(table.album == loved_id)
        if isinstance(table, LovedArtist):
            query = partial_query(table.artist == loved_id)
        query.execute()
        return "Success"


@app.route("/users")
@token_required
async def get_users() -> Response:
    with database.atomic():
        users = User.select()
        return jsonify([user.to_json() for user in users])


@app.route("/users/<int:user_id>")
@token_required
async def get_user_by_id(user_id: int) -> Response:
    with database.atomic():
        try:
            user = User.get(user_id=user_id)
        except DoesNotExist:
            return jsonify(
                {
                    "error": "User does not exist",
                    "user_id": None,
                    "username": None,
                }
            )
        return jsonify({"error": None, **user.to_json()})


@app.route("/users/<string:username>", methods=["GET"])
@token_required
async def get_user_by_username(username: str) -> Response:
    with database.atomic():
        try:
            user = User.get(username=username)
            return jsonify({"error": None, **user.to_json()})
        except IntegrityError:
            return jsonify(
                {"error": "Already Exists", "user_id": None, "username": None}
            )


# @app.route("/users/<string:username>", methods=["PUT"])
# @token_required
# async def create_user(username: str) -> Response:
#     with database.atomic():
#         try:
#             user = User.get(username=username)
#         except DoesNotExist:
#             return jsonify(
#                 {
#                     "error": None,
#                     "user_id": User.create(username=username).user_id,
#                     "username": username,
#                 }
#             )
#         return jsonify({"error": None, **user.to_json()})


@app.route("/stream/<int:track_id>")
@token_required
async def stream(track_id: int) -> Response:
    with database.atomic():
        track = Track.get(track_id)
        song_file = Path(track.file_path)
    range_header = request.headers.get("Range", None)
    size = track.size
    length, byte1, byte2 = 0, 0, None

    if range_header:
        byte1, byte2 = range_header.replace("bytes=", "").split("-")
        if byte1:
            byte1 = int(byte1)
        if byte2:
            byte2 = int(byte2)
        length = size - byte1
        if byte2:
            length = byte2 + 1 - byte1

    async def async_generator() -> AsyncIterator[bytes]:
        with song_file.open("rb") as play_file:
            play_file.seek(byte1)
            chunk = play_file.read(length)
            while chunk:
                yield chunk
                chunk = play_file.read(length)
                if byte2 and play_file.tell() >= byte2:
                    yield chunk[: byte2 - play_file.tell()]
                    break

    response = await make_response(async_generator())
    response.timeout = None
    response.mimetype = track.mimetype
    response.headers.add("Accept-Ranges", "bytes")
    if range_header:
        response.headers.add(
            "Content-Range", f"bytes {byte1}-{byte1 + length - 1}/{size}"
        )
    return response


@app.route("/get/<int:track_id>")
@app.route("/get/<int:track_id>/<int:range_start>")
@app.route("/get/<int:track_id>/<int:range_start>/<int:range_end>")
@token_required
async def get(
    track_id: int, range_start: int = None, range_end: int = None
) -> Response:
    with database.atomic():
        track = Track.get(track_id)
        song_file = Path(track.file_path)
    if range_start is not None:
        size = track.size
        length = size - range_start
        if range_end is not None:
            length = range_end + 1 - range_start
        with song_file.open("rb") as play_file:
            play_file.seek(range_start)
            chunk = play_file.read(length)

            return Response(
                chunk,
                headers={
                    "Content-Type": track.mimetype,
                    "Accept-Ranges": "bytes",
                    "Content-Range": f"bytes {range_start}-{range_start + length - 1}/"
                    f"{size}",
                },
            )
    return await send_file(song_file)


if __name__ == "__main__":
    db_file = APP_ROOT / "jukebox.db"
    if not db_file.exists():
        create_tables()
    app.run(
        host=CONFIGS["host"],
        port=CONFIGS["port"],
        debug=CONFIGS["debug_mode"],
        use_reloader=CONFIGS["use_reloader"],
    )
