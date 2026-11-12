import duckdb
from .config import settings

class DatabaseManager:
    def __init__(self):
        self._con = None

    def get_connection(self):
        if self._con is None:
            self._con = duckdb.connect()
            self._con.execute("PRAGMA threads=4;")
            self._con.execute("PRAGMA memory_limit='2GB';")
        return self._con

db_manager = DatabaseManager()

def get_db():
    return db_manager.get_connection()

