import os

import psycopg2
from psycopg2.extras import RealDictCursor

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "database": os.getenv("DB_NAME", "soles_street_db"),
    "user": os.getenv("DB_USER", "soles_user"),
    "password": os.getenv("DB_PASSWORD", "soles123"),
    "cursor_factory": RealDictCursor,
}


def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)
