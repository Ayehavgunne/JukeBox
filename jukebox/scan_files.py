import asyncio
import mimetypes
import os
import sys
from functools import partial
from pathlib import Path

import aiohttp
import discogs_client
import json5
import music_tag
from music_tag import AudioFile
from peewee import IntegrityError, OperationalError

from jukebox import APP_ROOT, CONFIG_FILE, CONFIGS, __version__
from jukebox.db_models import (
    Album,
    AlbumArtist,
    AlbumDisc,
    Artist,
    ArtistImage,
    ArtistInfoMismatches,
    Track,
    create_tables,
    database,
)

mimetypes.add_type("audio/flac", ".flac")


def check_config_file() -> None:
    if not CONFIG_FILE.exists():
        CONFIG_FILE.touch()
        defaults = {
            "library_paths": [],
            "extensions": [".mp3", ".flac", ".m4a", ".aac"],
            "exclude_paths": [],
            "host": "127.0.0.1",
            "port": 5000,
            "secret_key": str(os.urandom(16)),
            "ssl": False,
            "debug_mode": False,
            "use_reloader": False,
            "logging": {
                "enabled": True,
                "maxBytes": 10000000,
                "backupCount": 5,
            },
            "discogs": {
                "consumer_key": "",
                "consumer_secret": "",
                "user_token": "",
            },
        }
        CONFIG_FILE.write_text(
            json5.dumps(
                defaults,
                indent=4,
            )
        )


def get_metadata(file: Path) -> AudioFile:
    return music_tag.load_file(file)


class MusicFile:
    def __init__(self, file: Path):
        metadata = get_metadata(file)
        mimetype = mimetypes.guess_type(file)[0] or ""
        self.file_path = file.as_posix()
        self.duration = metadata["#length"].value
        self.artist = metadata["artist"].value
        self.album_artist = metadata["albumartist"].value
        self.title = metadata["title"].value
        self.album = metadata["album"].value
        self.track_number = metadata["tracknumber"].value
        self.total_tracks = metadata["totaltracks"].value
        self.disc_number = metadata["discnumber"].value
        self.total_discs = metadata["discnumber"].value
        self.year = metadata["year"].value
        self.genre = metadata["genre"].value
        self.compilation = metadata["compilation"].value
        self.mimetype = mimetype
        self.codec = metadata["#codec"].value
        self.bitrate = metadata["#bitrate"].value
        self.album_art_path = (
            f"{'/'.join(file.parts[:-1]).replace('/', '', 1)}/artwork.jpeg"
        )
        self._metadata = metadata
        self._file = file

    @property
    def size(self) -> int:
        return self._file.stat().st_size


def scan_files() -> None:
    database.connect()

    if not CONFIGS["library_paths"]:
        print("error: no library folders defined")
        sys.exit(1)

    music_folders = CONFIGS["library_paths"]
    extensions = CONFIGS["extensions"]
    songs = []
    existing_files = [track.file_path for track in Track.select()]
    # remove tracks that no longer exist in the file system
    for music_folder in music_folders:
        for song_file in [
            file for file in Path(music_folder).rglob("*") if file.suffix in extensions
        ]:
            if song_file.as_posix() in existing_files:
                continue
            if CONFIGS["exclude_paths"]:
                for exclusion in CONFIGS["exclude_paths"]:
                    if exclusion not in song_file.as_posix():
                        songs.append(MusicFile(song_file))
            else:
                songs.append(MusicFile(song_file))
    for song in songs:
        if song.artist and song.title and song.album:
            try:
                with database.atomic():
                    artist = Artist.create(name=song.artist)
            except IntegrityError:
                artist = Artist.get(name=song.artist)
            try:
                album = Album.create(
                    title=song.album,
                    total_discs=song.total_discs,
                    year=song.year,
                    album_art_path=song.album_art_path,
                )
            except IntegrityError:
                album = Album.get(title=song.album)
            try:
                AlbumArtist.create(
                    album=album,
                    artist=artist,
                )
            except IntegrityError:
                pass
            try:
                album_disc = AlbumDisc.create(
                    album=album,
                    total_tracks=song.total_tracks,
                    disc_number=song.disc_number,
                )
            except IntegrityError:
                album_disc = AlbumDisc.get(album=album)
            try:
                Track.create(
                    title=song.title,
                    album=album,
                    album_disc=album_disc,
                    artist=artist,
                    track_number=song.track_number,
                    disc_number=song.disc_number,
                    compilation=song.compilation,
                    length=song.duration,
                    mimetype=song.mimetype,
                    bitrate=song.bitrate,
                    codec=song.codec,
                    size=song.size,
                    file_path=song.file_path,
                )
            except IntegrityError:
                pass
    print(len(songs), "new files")
    database.close()


async def get_artist_images() -> None:
    print("getting artist images")
    try:
        database.connect()
    except OperationalError as err:
        print(err)
    artists = Artist.select()
    api_client = discogs_client.Client(
        f"JukeBox/{__version__}",
        user_token=CONFIGS["discogs"]["user_token"],
    )
    loop = asyncio.get_running_loop()
    for artist in artists:
        artist_info = None
        if artist.api_id is None:
            if artist_info is None:
                artist_info = await loop.run_in_executor(
                    None, partial(api_client.search, artist.name, type="artist")
                )

                if len(artist_info):
                    artist_info = artist_info[0]
                    if artist_info.name.lower() == artist.name.lower():
                        audio_db_artist_id = artist_info.id
                        artist.api_id = audio_db_artist_id
                    else:
                        try:
                            ArtistInfoMismatches.create(
                                artist_id=artist.artist_id,
                                artist_name=artist.name,
                                found_api_id=artist_info.id,
                                found_name=artist_info.name,
                            )
                        except IntegrityError:
                            pass
                else:
                    artist_info = None
                    artist.api_id = 0
                artist.save()
        if len(artist.images) == 0 or not artist.images[0].not_found:
            if artist_info is None:
                if artist.api_id:
                    artist_info = await loop.run_in_executor(
                        None, api_client.artist, str(artist.api_id)
                    )
                else:
                    artist_info = await loop.run_in_executor(
                        None, partial(api_client.search, artist.name, type="artist")
                    )
                    if len(artist_info):
                        artist_info = artist_info[0]
                    else:
                        artist_info = None
            if (
                artist_info
                and artist_info.images
                and artist_info.name.lower() == artist.name.lower()
            ):
                async with aiohttp.ClientSession() as session:
                    async with session.get(artist_info.images[0]["uri150"]) as response:
                        image = await response.read()
                        if image is not None:
                            ArtistImage.create(
                                artist=artist,
                                small=image,
                            )
                            continue
            ArtistImage.create(
                artist=artist,
                not_found=True,
            )
        await asyncio.sleep(0.1)
    print("done getting artist images")
    database.close()


if __name__ == "__main__":
    db_file = APP_ROOT / "jukebox.db"
    if not db_file.exists():
        create_tables()
    scan_files()
    asyncio.run(get_artist_images())
