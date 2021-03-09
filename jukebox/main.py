from pathlib import Path

import json5
import music_tag
from music_tag import AudioFile
from peewee import IntegrityError

from jukebox import APP_ROOT
from jukebox.db_models import Album, Artist, Track, database

CONFIG_FILE = APP_ROOT / "jukebox.json5"

if not CONFIG_FILE.exists():
    CONFIG_FILE.touch()
    defaults = {
        "library_paths": [],
        "extensions": [".mp3", ".flac", ".m4a", ".aac"],
        "exclude_paths": [],
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
        self.file_path = metadata.filename.as_posix()
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
        self._metadata = metadata
        self._file = file


def main() -> None:
    database.connect()
    configs = json5.loads(CONFIG_FILE.read_text())

    if not configs["library_paths"]:
        print("error: no library folders defined")
        return

    music_folders = configs["library_paths"]
    extensions = configs["extensions"]
    songs = []
    existing_files = [track.file_path for track in Track.select()]
    for music_folder in music_folders:
        for song_file in [
            file for file in Path(music_folder).rglob("*") if file.suffix in extensions
        ]:
            if song_file.as_posix() in existing_files:
                continue
            if configs["exclude_paths"]:
                for exclusion in configs["exclude_paths"]:
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
                if (
                    song.album_artist
                    and song.artist.lower() != song.album_artist.lower()
                ):
                    album_artist = Artist.create(name=song.album_artist)
                else:
                    album_artist = artist
            except IntegrityError:
                album_artist = Artist.get(name=song.album_artist)
            try:
                album = Album.create(
                    title=song.album,
                    artist=album_artist,
                    total_tracks=song.total_tracks,
                    disc=song.disc_number,
                    total_discs=song.total_discs,
                    year=song.year,
                )
            except IntegrityError:
                album = Album.get(title=song.album)
            try:
                Track.create(
                    title=song.title,
                    album=album,
                    artist=artist,
                    album_artist=album_artist,
                    track_number=song.track_number,
                    disc_number=song.disc_number,
                    genre=song.genre,
                    length=song.duration,
                    file_path=song.file_path,
                )
            except IntegrityError:
                pass
    print(len(songs))
    database.close()


if __name__ == "__main__":
    main()
