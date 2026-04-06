import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    conn = psycopg2.connect(
        host="127.0.0.1",
        database="soles_street_db",
        user="soles_user",
        password="soles123",
        cursor_factory=RealDictCursor
    )
    return conn