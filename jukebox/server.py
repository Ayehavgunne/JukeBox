import asyncio
import json
from functools import wraps
from io import BytesIO
from logging import getLogger
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import AsyncIterator

from jwt import decode, exceptions
from peewee import DoesNotExist, IntegrityError, fn
from quart import (
    Quart,
    Response,
    g,
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


def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        authorization = request.headers.get("authorization", None)
        if not authorization:
            return (
                json.dumps({"error": "no authorization token provided"}),
                401,
                {"Content-type": "application/json"},
            )

        try:
            token = authorization.split(" ")[1]
            resp = decode(token, None, verify=False, algorithms=["HS256"])
            g.user = resp["sub"]
        except exceptions.DecodeError:
            return (
                json.dumps({"error": "invalid authorization token"}),
                401,
                {"Content-type": "application/json"},
            )

        return f(*args, **kwargs)

    return wrap


app = Quart(__name__)
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
async def root(_: str = None) -> Response:
    return await send_from_directory(APP_ROOT / "frontend" / "dist", "index.html")


@app.route("/<path:path>")
async def send_dist(path: str) -> Response:
    return await send_from_directory(APP_ROOT / "frontend" / "dist", path)


@app.route("/task/get_artist_images")
async def get_images() -> str:
    asyncio.create_task(get_artist_images())
    return "Success"


@app.route("/task/scan_files")
async def update_files() -> str:
    loop = asyncio.get_running_loop()
    loop.run_in_executor(None, scan_files)
    return "Success"


@app.route("/artists")
@app.route("/artists/<int:artist_id>")
async def get_artists(artist_id: int = None) -> Response:
    with database.atomic():
        if artist_id is None:
            artists = Artist.select().order_by(fn.Lower(Artist.name))
        else:
            artists = [Artist.get(artist_id)]
        return jsonify([artist.to_json() for artist in artists])


@app.route("/artists/<int:artist_id>/image")
async def get_artist_image(artist_id: int) -> Response:
    with database.atomic():
        artist = Artist.get(artist_id)
        if len(artist.images) > 0 and not artist.images[0].not_found:
            image = BytesIO(artist.images[0].small)
            return await send_file(image, mimetype="image/jpg")
        else:
            return await send_file(
                APP_ROOT / "frontend" / "www" / "assets" / "generic_artist.png",
                mimetype="image/png",
            )


@app.route("/artists/<int:artist_id>/albums")
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
@app.route("/albums/<int:album_id>")
async def get_albums(album_id: int = None) -> Response:
    with database.atomic():
        if album_id is None:
            albums = Album.select().order_by(fn.Lower(Album.title))
        else:
            albums = [Album.get(album_id)]
        return jsonify([album.to_json() for album in albums])


@app.route("/albums/<int:album_id>/image")
async def get_album_image(album_id: int) -> Response:
    with database.atomic():
        album = Album.get(album_id)
        album_art_file = Path(album.album_art_path)
        if album_art_file.exists():
            return await send_file(album.album_art_path)
        else:
            return await send_file(
                APP_ROOT / "frontend" / "www" / "assets" / "generic_album.png",
                mimetype="image/png",
            )


@app.route("/albums/<int:album_id>/tracks")
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
@app.route("/tracks/<int:track_id>")
async def get_tracks(track_id: int = None) -> Response:
    with database.atomic():
        if track_id is None:
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
        else:
            tracks = [Track.get(int(track_id))]
    return jsonify([track.to_json() for track in tracks])


@app.route("/tracks/<int:track_id>/image")
async def get_track_image(track_id: int) -> Response:
    with database.atomic():
        track = Track.get(track_id)
        album_art_file = Path(track.album.album_art_path)
        if album_art_file.exists():
            return await send_file(track.album.album_art_path)
        else:
            return await send_file(
                APP_ROOT / "frontend" / "www" / "assets" / "generic_album.png",
                mimetype="image/png",
            )


@app.route("/genres")
@app.route("/genres/<string:genre>")
async def get_genres(genre: str = None) -> Response:
    with database.atomic():
        if genre is None:
            genres = (
                Track.select(Track.genre).distinct().order_by(fn.Lower(Track.genre))
            )
            return jsonify(genres)
        else:
            tracks = [
                Track.select()
                .where(Track.genre == genre)
                .order_by(fn.Lower(Track.title))
            ]
            return jsonify([track.to_json() for track in tracks])


@app.route("/playlists/<int:user_id>")
@app.route("/playlists/<int:user_id>/<string:playlist_name>", methods=["GET", "DELETE"])
async def playlist_calls(user_id: int, playlist_name: str = None) -> Response:
    with database.atomic():
        if request.method == "DELETE":
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
        if playlist_name is None:
            playlists = (
                Playlist.select(Playlist.playlist_name)
                .distinct()
                .where(Playlist.user == user_id)
                .order_by(fn.Lower(Playlist.playlist_name))
            )
            return jsonify([playlist.playlist_name for playlist in playlists])
        else:
            tracks = (
                Track.select()
                .join(Playlist)
                .where(
                    Playlist.playlist_name == playlist_name, Playlist.user == user_id
                )
                .order_by(Playlist.order)
            )
            return jsonify([track.to_json() for track in tracks])


@app.route(
    "/playlists/<int:user_id>/<string:old_playlist_name>/<string:new_playlist_name>"
)
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
    methods=["PUT", "DELETE"],
)
async def alter_playlists(playlist_name: str, track_id: int, user_id: int) -> str:
    with database.atomic():
        if request.method == "PUT":
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
        elif request.method == "DELETE":
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


# noinspection DuplicatedCode
@app.route("/love/track/<int:user_id>/<int:track_id>", methods=["PUT", "DELETE"])
async def love_track(user_id: int, track_id: int) -> str:
    with database.atomic():
        if request.method == "PUT":
            try:
                LovedTrack.create(user=user_id, track=track_id)
            except IntegrityError:
                return "Already Exists"
        elif request.method == "DELETE":
            query = LovedTrack.delete().where(
                LovedTrack.user == user_id, LovedTrack.track == track_id
            )
            query.execute()


# noinspection DuplicatedCode
@app.route("/love/album/<int:user_id>/<int:album_id>", methods=["PUT", "DELETE"])
async def love_album(user_id: int, album_id: int) -> str:
    with database.atomic():
        if request.method == "PUT":
            try:
                LovedAlbum.create(user=user_id, album=album_id)
            except IntegrityError:
                return "Already Exists"
        elif request.method == "DELETE":
            query = LovedAlbum.delete().where(
                LovedAlbum.user == user_id, LovedAlbum.album == album_id
            )
            query.execute()


# noinspection DuplicatedCode
@app.route("/love/artist/<int:user_id>/<int:artist_id>", methods=["PUT", "DELETE"])
async def love_artist(user_id: int, artist_id: int) -> str:
    with database.atomic():
        if request.method == "PUT":
            try:
                LovedArtist.create(user=user_id, artist=artist_id)
            except IntegrityError:
                return "Already Exists"
        elif request.method == "DELETE":
            query = LovedArtist.delete().where(
                LovedArtist.user == user_id, LovedArtist.artist == artist_id
            )
            query.execute()


@app.route("/users")
@app.route("/users/<int:user_id>")
@app.route("/users/<string:username>", methods=["GET", "PUT"])
async def get_users(user_id: int = None, username: str = None) -> Response:
    with database.atomic():
        if user_id is None and username is None:
            users = User.select()
            return jsonify([user.to_json() for user in users])
        elif user_id is None:
            if request.method == "PUT":
                try:
                    return jsonify(
                        {
                            "error": None,
                            "user_id": User.create(username=username).user_id,
                            "username": username,
                        }
                    )
                except IntegrityError:
                    return jsonify(
                        {"error": "Already Exists", "user_id": None, "username": None}
                    )
            else:
                try:
                    user = User.get(username=username)
                except DoesNotExist as err:
                    print(err)
                    return jsonify(
                        {
                            "error": None,
                            "user_id": User.create(username=username).user_id,
                            "username": username,
                        }
                    )
                return jsonify({"error": None, **user.to_json()})
        else:
            try:
                user = User.get(user_id=user_id)
            except DoesNotExist as err:
                print(err)
                return jsonify(
                    {
                        "error": "User does not exist",
                        "user_id": None,
                        "username": username,
                    }
                )
            return jsonify({"error": None, **user.to_json()})


@app.route("/stream/<int:track_id>")
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
