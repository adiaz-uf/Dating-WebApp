from .db import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash # type: ignore

def register_user(username, email, password, first_name, last_name):
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Search for already existing username
    cur.execute("SELECT id FROM user WHERE username = %s", 
                (username))
    
    if cur.fetchone():
        cur.close()
        conn.close()
        return False, "User already exists"

    # Create new user
    hashed_password = generate_password_hash(password)
    cur.execute(" INSERT INTO user (username, email, password, first_name, last_name)VALUES (%s, %s, %s)",
                (username, email, hashed_password, first_name, last_name,))

    conn.commit()
    cur.close()
    conn.close()
    return True, "User registered"

def login_user(username, password):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT password FROM user WHERE username = %s", 
                (username,))
    
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return False, "User does not exist"
    
    stored_password_hash = row[0]
    if not check_password_hash(stored_password_hash, password):
        return False, "Incorrect password"

    return True, "Login successful"