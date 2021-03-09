from pathlib import Path

import json5
from peewee import IntegrityError
from tinytag import TinyTag

from jukebox import APP_ROOT, db_models

CONFIG_FILE = APP_ROOT / "jukebox.json5"

if not CONFIG_FILE.exists():
    CONFIG_FILE.touch()
    defaults = {
        "library_paths": "",
        "extensions": [],
        "exclude_paths": [],
    }
    CONFIG_FILE.write_text(
        json5.dumps(
            defaults,
            indent=4,
        )
    )


def get_metadata(file: Path) -> TinyTag:
    return TinyTag.get(file)


class MusicFile:
    def __init__(self, file: Path):
        self.file = file
        self.metadata = get_metadata(file)


def main() -> None:
    db_models.db.connect()
    configs = json5.loads(CONFIG_FILE.read_text())

    if not configs["library_paths"]:
        print("error: no library folders defined")
        return

    music_folders = configs["library_paths"]
    extensions = configs["extensions"]
    songs = []
    for music_folder in music_folders:
        for song_file in [
            file for file in Path(music_folder).rglob("*") if file.suffix in extensions
        ]:
            if configs["exclude_paths"]:
                for exclusion in configs["exclude_paths"]:
                    if exclusion not in song_file.as_posix():
                        songs.append(MusicFile(song_file))
            else:
                songs.append(MusicFile(song_file))
    for song in songs:
        if song.metadata.artist and song.metadata.title and song.metadata.album:
            try:
                with db_models.db.atomic():
                    artist = db_models.Artist.create(name=song.metadata.artist)
            except IntegrityError:
                artist = db_models.Artist.get(name=song.metadata.artist)
            try:
                if (
                    song.metadata.albumartist
                    and song.metadata.artist.lower()
                    != song.metadata.albumartist.lower()
                ):
                    album_artist = db_models.Artist.create(
                        name=song.metadata.albumartist
                    )
                else:
                    album_artist = artist
            except IntegrityError:
                album_artist = db_models.Artist.get(name=song.metadata.albumartist)
            try:
                album = db_models.Album.create(
                    title=song.metadata.album,
                    artist=album_artist,
                    tracks=song.metadata.track_total,
                    disc=song.metadata.disc,
                    discs=song.metadata.disc_total,
                    year=song.metadata.year,
                )
            except IntegrityError:
                album = db_models.Album.get(title=song.metadata.album)
            try:
                db_models.Track.create(
                    title=song.metadata.title,
                    album=album,
                    artist=artist,
                    album_artist=album_artist,
                    track_number=song.metadata.track,
                    disc_number=song.metadata.disc,
                    genre=song.metadata.genre,
                    length=song.metadata.duration,
                    file_path=song.file.as_posix(),
                )
            except IntegrityError:
                pass
    print(len(songs))
    db_models.db.close()


if __name__ == "__main__":
    main()
