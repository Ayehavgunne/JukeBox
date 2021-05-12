import json

from werkzeug.security import generate_password_hash

from jukebox.db_models import User


def create_pass(password):
    return generate_password_hash(password, method="sha256")


def create_user():
    username = ""
    password = ""
    User.create(
        username=username,
        password=create_pass(password),
        settings=json.dumps(User.default_settings()),
    )


if __name__ == "__main__":
    create_user()
