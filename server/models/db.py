import os

import psycopg2
from psycopg2.extras import RealDictCursor


def get_db_config():
    config = {
        "host": os.getenv("DB_HOST", "127.0.0.1").strip(),
        "database": os.getenv("DB_NAME", "").strip(),
        "user": os.getenv("DB_USER", "").strip(),
        "password": os.getenv("DB_PASSWORD", "").strip(),
        "cursor_factory": RealDictCursor,
    }

    missing = [name for name, value in config.items() if name != "cursor_factory" and not value]
    if missing:
        joined = ", ".join(sorted(f"DB_{name.upper()}" for name in missing))
        raise RuntimeError(f"Database configuration is incomplete. Set: {joined}.")

    return config


def get_db_connection():
    return psycopg2.connect(**get_db_config())
