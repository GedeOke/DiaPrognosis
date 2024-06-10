import sqlite3
from datetime import datetime

DB_NAME = 'database/database.db'

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def insert_message(user, message):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO messages (user, message)
        VALUES (?, ?)
    ''', (user, message))
    conn.commit()
    conn.close()

def get_all_messages():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM messages ORDER BY timestamp')
    messages = cursor.fetchall()
    conn.close()
    return messages

def get_messages_by_user(user):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM messages WHERE user = ? ORDER BY timestamp', (user,))
    messages = cursor.fetchall()
    conn.close()
    return messages
