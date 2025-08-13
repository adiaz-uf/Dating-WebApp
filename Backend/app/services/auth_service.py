import os
import uuid
import smtplib
from email.mime.text import MIMEText
from werkzeug.security import generate_password_hash, check_password_hash # type: ignore

from .db import get_db_connection
from ..Utils.get_base_url import get_backend_base_url, get_frontend_base_url

def send_confirmation_email(email, token):
    smtp_host = os.getenv("EMAIL_HOST")
    smtp_port = int(os.getenv("EMAIL_PORT", 587))
    smtp_user = os.getenv("EMAIL_USER")
    smtp_password = os.getenv("EMAIL_PASSWORD")

    mail_from = os.getenv("MAIL_FROM_ADDRESS")
    mail_from_name = os.getenv("MAIL_FROM_NAME")
    base_url = get_frontend_base_url()
    confirm_link_base = os.getenv("CONFIRM_ACCOUNT_LINK")

    # build link
    link = f"{base_url}{confirm_link_base}{token}"

    # build message
    message = MIMEText(
        f"Welcome to {mail_from_name}!\n\n"
        f"Please confirm your account by clicking this link:\n{link}"
    )
    message['Subject'] = "Confirm your account"
    message['From'] = f"{mail_from_name} <{mail_from}>"
    message['To'] = email

    # send mail
    with smtplib.SMTP(smtp_host, smtp_port) as smtp:
        smtp.starttls()
        smtp.login(smtp_user, smtp_password)
        smtp.send_message(message)


def send_reset_email(email, token):
    smtp_host = os.getenv("EMAIL_HOST")
    smtp_port = int(os.getenv("EMAIL_PORT", 587))
    smtp_user = os.getenv("EMAIL_USER")
    smtp_password = os.getenv("EMAIL_PASSWORD")

    mail_from = os.getenv("MAIL_FROM_ADDRESS")
    mail_from_name = os.getenv("MAIL_FROM_NAME")
    base_url = get_frontend_base_url()
    reset_link_base = os.getenv("RESET_PASSWORD_LINK")

    # build link
    link = f"{base_url}{reset_link_base}{token}"

    # build message
    message = MIMEText(
        f"Hello {mail_from_name}!\n\n"
        f"Please change your password by clicking this link:\n{link}"
    )
    message['Subject'] = "Change your password"
    message['From'] = f"{mail_from_name} <{mail_from}>"
    message['To'] = email

    # send mail
    with smtplib.SMTP(smtp_host, smtp_port) as smtp:
        smtp.starttls()
        smtp.login(smtp_user, smtp_password)
        smtp.send_message(message)

def reset_password_confirm(password, token):
    new_password = password

    if not token or not new_password:
        return False, "Missing data"

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE confirm_token = %s", (token,))
    user = cur.fetchone()
    if not user:
        cur.close()
        conn.close()
        return False, "Invalid or expired token"

    hashed_password = generate_password_hash(new_password)
    cur.execute("UPDATE users SET password = %s, confirm_token = NULL WHERE id = %s",
                (hashed_password, user[0]))

    conn.commit()
    cur.close()
    conn.close()

    return True, "Password updated successfully"

def reset_password(email):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return False, "Email does not exists"
    
    reset_token = str(uuid.uuid4())
    cur.execute(""" UPDATE "users" SET confirm_token = %s WHERE email = %s """, 
        (reset_token, email,))

    conn.commit()
    cur.close()
    conn.close()

    send_reset_email(email, reset_token)

    return True, "Password changed, you can now log in."


def confirm_email(token):
    if not token:
        return False, "Token missing"

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE confirm_token = %s", (token,))
    row = cur.fetchone()
    if not row:
        # Check if the token was already used and the account is already confirmed
        cur.execute("SELECT active_account FROM users WHERE confirm_token IS NULL AND active_account = TRUE")
        already_confirmed = cur.fetchone()
        cur.close()
        conn.close()
        if already_confirmed:
            return False, "Account already confirmed. You can now log in."
        return False, "Invalid or expired token"

    user_id = row[0]

    cur.execute("""
        UPDATE "users"
        SET active_account = TRUE, confirm_token = NULL
        WHERE id = %s
    """, (user_id,))

    conn.commit()
    cur.close()
    conn.close()

    return True, "Account confirmed. You can now log in."


def register_user(username, password, email, first_name, last_name):
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Search for already existing username
    cur.execute("SELECT id FROM users WHERE username = %s", 
                (username,))
    
    if cur.fetchone():
        cur.close()
        conn.close()
        return False, "User already exists"
    
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))

    if cur.fetchone():
        cur.close()
        conn.close()
        return False, "Email already exists"

    # Create new user
    hashed_password = generate_password_hash(password)
    confirm_token = str(uuid.uuid4())
    cur.execute(" INSERT INTO users (username, email, password, first_name, last_name, confirm_token) " \
                " VALUES (%s, %s, %s, %s, %s, %s)",
                (username, email, hashed_password, first_name, last_name, confirm_token,))

    conn.commit()
    cur.close()
    conn.close()

    send_confirmation_email(email, confirm_token)

    return True, "User registered, please confirm your account"


def login_user(username, password):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT password, active_account, id 
        FROM "users" WHERE username = %s
    """, (username,))

    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return False, "User does not exist"

    stored_password_hash, active_account, user_id = row

    if not check_password_hash(stored_password_hash, password):
        return False, "Incorrect username or password"
    
    if not active_account:
        return False, "Account not verified"


    # Return a user object with id (for session)
    class User:
        def __init__(self, id):
            self.id = id
    return True, User(user_id)