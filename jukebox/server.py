from logging import getLogger
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import AsyncIterator

from quart import Quart, Response, jsonify, make_response, request, send_from_directory
from quart.logging import serving_handler

from jukebox import APP_ROOT, CONFIGS
from jukebox.db_models import Album, Artist, Track, create_tables, database
from jukebox.scan_files import scan_files

app = Quart(__name__)
handler = RotatingFileHandler(
    APP_ROOT / "jukebox.log",
    maxBytes=CONFIGS["logging"]["maxBytes"],
    backupCount=CONFIGS["logging"]["backupCount"],
)
handler.setFormatter(serving_handler.formatter)
serving_logger = getLogger("quart.serving")
serving_logger.addHandler(handler)


@app.route("/")
async def root() -> Response:
    return await send_from_directory(APP_ROOT / "jukebox" / "html", "root.html")


@app.route("/css/<path:path>")
async def send_css(path: str) -> Response:
    return await send_from_directory(APP_ROOT / "jukebox" / "css", path)


@app.route("/js/<path:path>")
async def send_js(path: str) -> Response:
    return await send_from_directory(APP_ROOT / "jukebox" / "js", path)


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
            tracks = Track.select()
        else:
            tracks = [Track.get(int(track_id))]
    return jsonify([track.to_json() for track in tracks])


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
    response.mimetype = "audio/flac"
    response.headers.add("Accept-Ranges", "bytes")
    if range_header:
        response.headers.add(
            "Content-Range", "bytes {0}-{1}/{2}".format(byte1, byte1 + length - 1, size)
        )
    return response


if __name__ == "__main__":
    db_file = APP_ROOT / "jukebox.db"
    if not db_file.exists():
        create_tables()
    scan_files()
    app.run(
        host="0.0.0.0",
        debug=CONFIGS["debug_mode"],
        use_reloader=CONFIGS["use_reloader"],
    )
