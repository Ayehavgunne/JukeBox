from logging import getLogger
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import AsyncIterator

from peewee import fn
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
from jukebox.db_models import Album, Artist, Playlist, Track, create_tables, database
from jukebox.scan_files import check_config_file, scan_files

check_config_file()

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


# @app.route("/")
# async def root() -> Response:
#     return await send_from_directory(APP_ROOT / "jukebox" / "html", "root.html")


@app.route("/")
@app.route("/page/genres")
@app.route("/page/artists")
@app.route("/page/albums")
@app.route("/page/tracks")
@app.route("/page/now_playing")
@app.route("/page/profile/<string:_>")
@app.route("/page/playlist/<string:_>")
async def root(_: str = None) -> Response:
    return await send_from_directory(APP_ROOT / "frontend" / "www", "index.html")


# @app.route("/css/<path:path>")
# async def send_css(path: str) -> Response:
#     return await send_from_directory(APP_ROOT / "jukebox" / "css", path)
#
#
# @app.route("/js/<path:path>")
# async def send_js(path: str) -> Response:
#     return await send_from_directory(APP_ROOT / "jukebox" / "js", path)


@app.route("/assets/<path:path>")
async def send_assets(path: str) -> Response:
    return await send_from_directory(APP_ROOT / "frontend" / "www" / "assets", path)


@app.route("/build/<path:path>")
async def send_build(path: str) -> Response:
    return await send_from_directory(APP_ROOT / "frontend" / "www" / "build", path)


@app.route("/artists")
@app.route("/artists/<int:artist_id>")
async def get_artists(artist_id: int = None) -> Response:
    with database.atomic():
        if artist_id is None:
            artists = Artist.select()
        else:
            artists = [Artist.get(artist_id)]
        return jsonify([artist.to_json() for artist in artists])


@app.route("/albums")
@app.route("/albums/<int:album_id>")
async def get_albums(album_id: int = None) -> Response:
    with database.atomic():
        if album_id is None:
            albums = Album.select()
        else:
            albums = [Album.get(album_id)]
        return jsonify([album.to_json() for album in albums])


@app.route("/tracks/")
@app.route("/tracks/<int:track_id>")
async def get_tracks(track_id: int = None) -> Response:
    with database.atomic():
        if track_id is None:
            tracks = (
                Track.select()
                .distinct()
                .join(Album)
                .join(Artist)
                .order_by(
                    fn.Lower(Artist.name),
                    fn.Lower(Album.title),
                    Album.disc_number,
                    Track.track_number,
                )
            )
        else:
            tracks = [Track.get(int(track_id))]
    return jsonify([track.to_json() for track in tracks])


@app.route("/genres/")
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


@app.route("/playlists/")
@app.route("/playlists/<string:playlist_name>")
async def get_playlists(playlist_name: str = None) -> Response:
    with database.atomic():
        if playlist_name is None:
            playlists = (
                Playlist.select(Playlist.playlist_name)
                .distinct()
                .order_by(fn.Lower(Playlist.playlist_name))
            )
            return jsonify([playlist.playlist_name for playlist in playlists])
        else:
            playlists = Playlist.select().where(Playlist.playlist_name == playlist_name)
            return jsonify([playlist.to_json() for playlist in playlists])


@app.route("/play/<int:track_id>")
async def play(track_id: int) -> Response:
    with database.atomic():
        track = Track.get(track_id)
        song_file = Path(track.file_path)
    range_header = request.headers.get("Range", None)
    size = song_file.stat().st_size
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
    response.mimetype = f"audio/{song_file.suffix.replace('.', '')}"
    response.headers.add("Accept-Ranges", "bytes")
    if range_header:
        response.headers.add(
            "Content-Range", f"bytes {byte1}-{byte1 + length - 1}/{size}"
        )
    return response


@app.route("/duration/<int:track_id>")
async def duration(track_id: int) -> str:
    with database.atomic():
        track = Track.get(track_id)
    return str(track.length)


@app.route("/bytes/<int:track_id>")
async def bytes_length(track_id: int) -> str:
    with database.atomic():
        track = Track.get(track_id)
        song_file = Path(track.file_path)
    return str(song_file.stat().st_size)


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
        size = song_file.stat().st_size
        length = size - range_start
        if range_end is not None:
            length = range_end + 1 - range_start
        with song_file.open("rb") as play_file:
            play_file.seek(range_start)
            chunk = play_file.read(length)
            return Response(
                chunk,
                headers={
                    "Content-Type": f"audio/{song_file.suffix.replace('.', '')}",
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
    scan_files()
    app.run(
        host=CONFIGS["host"],
        port=CONFIGS["port"],
        debug=CONFIGS["debug_mode"],
        use_reloader=CONFIGS["use_reloader"],
    )
