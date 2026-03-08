"""
Database connection and initialization for HMR.
Uses psycopg2 with a connection pool.
"""
import os
import time
import psycopg2
from psycopg2 import pool

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "postgres"),
    "port": os.getenv("DB_PORT", "5432"),
    "user": os.getenv("DB_USER", "hmr"),
    "password": os.getenv("DB_PASSWORD", "hmr_secret"),
    "database": os.getenv("DB_NAME", "hmr_db"),
}

# Connection pool (initialized lazily)
_pool = None


def get_pool():
    global _pool
    if _pool is None:
        _pool = psycopg2.pool.SimpleConnectionPool(1, 10, **DB_CONFIG)
    return _pool


def get_connection():
    """Get a connection from the pool."""
    return get_pool().getconn()


def release_connection(conn):
    """Return a connection to the pool."""
    get_pool().putconn(conn)


def init_db():
    """
    Create tables if they don't exist.
    Retries connection up to 10 times (postgres might not be ready yet).
    """
    for attempt in range(10):
        try:
            conn = get_connection()
            cur = conn.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    full_name VARCHAR(100) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'user' NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS signatures (
                    id          SERIAL PRIMARY KEY,
                    full_name   VARCHAR(100) NOT NULL,
                    job_title   VARCHAR(100) NOT NULL,
                    email       VARCHAR(255) NOT NULL,
                    mobile_phone VARCHAR(20),
                    extension   VARCHAR(20),
                    created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
            cur.close()
            release_connection(conn)
            print("✅ Database initialized successfully")
            return
        except psycopg2.OperationalError as e:
            print(f"⏳ Waiting for database (attempt {attempt + 1}/10)... {e}")
            time.sleep(2)

    raise Exception("❌ Could not connect to database after 10 attempts")
