import re
from pathlib import Path

from quart import Quart, Response, make_response, request, send_from_directory

from jukebox import APP_ROOT

app = Quart(__name__)


@app.route("/")
async def root() -> str:
    return (APP_ROOT / "jukebox" / "html" / "root.html").read_text()


@app.route("/js/<path:path>")
async def send_js(path) -> Response:
    return await send_from_directory(APP_ROOT / "jukebox" / "js", path)


@app.route("/play")
async def play() -> Response:
    song_file = Path("/Volumes/Music/Clark/Totems Flair/Growls Garden.flac")
    range_header = request.headers.get("Range", None)
    size = song_file.stat().st_size
    length, byte1, byte2 = 0, 0, None

    if range_header:
        m = re.search("(\d+)-(\d*)", range_header)
        g = m.groups()
        if g[0]:
            byte1 = int(g[0])
        if g[1]:
            byte2 = int(g[1])
        length = size - byte1
        if byte2:
            length = byte2 + 1 - byte1

    async def async_generator() -> bytes:
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


app.run(host="0.0.0.0")
