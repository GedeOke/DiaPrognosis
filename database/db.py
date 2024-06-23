import sqlite3

DB_NAME = 'database/history.db'

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            sender TEXT NOT NULL CHECK(sender IN ('user', 'Dian')),
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    cursor.execute('''
        INSERT OR IGNORE INTO users (username, password)
        VALUES ('Diaprognosis', 'diaprognosispassword')
    ''')
    
    conn.commit()
    conn.close()


def insert_user(username, password):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO users (username, password)
            VALUES (?, ?)
        ''', (username, password))
        conn.commit()
    except sqlite3.IntegrityError:
        print("Username already exists.")
    conn.close()

def get_user(username):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT id, username, password FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()
    return user

def get_user_id(username):
    user = get_user(username)
    return user[0] if user else None

def insert_message(username, message, sender):
    user_id = get_user_id(username)
    if user_id:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO messages (user_id, message, sender)
            VALUES (?, ?, ?)
        ''', (user_id, message, sender))
        conn.commit()
        conn.close()
    else:
        print("User does not exist.")

def get_messages_by_user(username):
    user_id = get_user_id(username)
    if user_id:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT m.id, u.username, m.message, m.timestamp, m.sender
            FROM messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.user_id = ?
            ORDER BY m.timestamp
        ''', (user_id,))
        messages = cursor.fetchall()
        conn.close()
        return messages
    else:
        return []



