from typing import Dict, Union

from peewee import (
    SQL,
    AutoField,
    CharField,
    CompositeKey,
    FloatField,
    ForeignKeyField,
    IntegerField,
    Model,
    SqliteDatabase,
)

from jukebox import APP_ROOT

database = SqliteDatabase((APP_ROOT / "jukebox.db").as_posix())


class BaseModel(Model):
    class Meta:
        database = database
        legacy_table_names = False


class Artist(BaseModel):
    artist_id = AutoField(primary_key=True)
    name = CharField()

    class Meta:
        database = database
        legacy_table_names = False
        order_by = ("name",)
        constraints = [SQL('UNIQUE ("name" COLLATE NOCASE)')]

    def to_json(self) -> Dict[str, Union[str, int]]:
        return {
            "artist_id": self.artist_id,
            "name": self.name,
        }


class Album(BaseModel):
    album_id = AutoField(primary_key=True)
    title = CharField()
    artist = ForeignKeyField(Artist, backref="albums")
    total_tracks = IntegerField(null=True)
    disc = IntegerField(null=True)
    total_discs = IntegerField(null=True)
    year = IntegerField(null=True)

    class Meta:
        database = database
        legacy_table_names = False
        indexes = ((("title", "artist", "disc"), True),)
        order_by = ("artist", "title")

    def to_json(self) -> Dict[str, Union[str, int]]:
        return {
            "album_id": self.album_id,
            "title": self.title,
            "artist": self.artist.name,
            "total_tracks": self.total_tracks,
            "disc": self.disc,
            "total_discs": self.total_discs,
            "year": self.year,
        }


class Track(BaseModel):
    track_id = AutoField(primary_key=True)
    title = CharField()
    album = ForeignKeyField(Album, backref="tracks")
    artist = ForeignKeyField(Artist, backref="tracks")
    album_artist = ForeignKeyField(Artist)
    track_number = IntegerField(null=True)
    disc_number = IntegerField(null=True)
    genre = CharField(null=True)
    length = FloatField()
    file_path = CharField()

    class Meta:
        database = database
        legacy_table_names = False
        indexes = ((("title", "album", "file_path"), True),)
        order_by = ("artist", "album", "title")

    def to_json(self) -> Dict[str, Union[str, int]]:
        return {
            "track_id": self.track_id,
            "title": self.title,
            "album": self.album.title,
            "artist": self.artist.name,
            "track_number": self.track_number,
            "genre": self.genre,
            "disk_number": self.disc_number,
        }


class Playlist(BaseModel):
    playlist_name = CharField()
    track = ForeignKeyField(Track, backref="playlists")

    class Meta:
        database = database
        legacy_table_names = False
        primary_key = CompositeKey("playlist_name", "track")


def create_tables() -> None:
    with database:
        database.create_tables([Artist, Album, Track, Playlist])


if __name__ == "__main__":
    create_tables()
