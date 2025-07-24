import psycopg2 # type: ignore
import os

def get_db_connection():
    conn = psycopg2.connect(
        dbname=os.getenv("POSTGRESQL_DATABASE"),
        user=os.getenv("POSTGRESQL_USER"),
        password=os.getenv("POSTGRESQL_PASSWORD"),
        host=os.getenv("POSTGRESQL_HOST"),
        port=os.getenv("POSTGRESQL_PORT")
    )
    return conn