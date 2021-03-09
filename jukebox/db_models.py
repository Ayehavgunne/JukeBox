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
