import os
from requests_oauthlib import OAuth2Session # type: ignore
from flask import session # type: ignore
from .db import get_db_connection
from ..Utils.get_base_url import get_backend_base_url

# CONFIG
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_AUTHORIZATION_BASE_URL = os.getenv("GOOGLE_AUTHORIZATION_BASE_URL")
GOOGLE_TOKEN_URL = os.getenv("GOOGLE_TOKEN_URL")
GOOGLE_USERINFO_URL = os.getenv("GOOGLE_USERINFO_URL")

INTRA42_CLIENT_ID = os.getenv("INTRA42_CLIENT_ID")
INTRA42_CLIENT_SECRET = os.getenv("INTRA42_CLIENT_SECRET")
INTRA42_AUTHORIZATION_BASE_URL = os.getenv("INTRA42_AUTHORIZATION_BASE_URL")
INTRA42_TOKEN_URL = os.getenv("INTRA42_TOKEN_URL")
INTRA42_USERINFO_URL = os.getenv("INTRA42_USERINFO_URL")


### ---- GOOGLE ----

def get_google_authorization_url():
    redirect_url = f"{get_backend_base_url()}{os.getenv("GOOGLE_REDIRECT_URI")}"
    google = OAuth2Session(
        GOOGLE_CLIENT_ID,
        redirect_uri=redirect_url,
        scope=["profile", "email"]
    )
    authorization_url, state = google.authorization_url(GOOGLE_AUTHORIZATION_BASE_URL, access_type="offline", prompt="select_account")
    return authorization_url, state


def handle_google_callback(authorization_response, state):
    redirect_url = f"{get_backend_base_url()}{os.getenv("GOOGLE_REDIRECT_URI")}"
    google = OAuth2Session(
        GOOGLE_CLIENT_ID,
        state=state,
        redirect_uri=redirect_url
    )
    token = google.fetch_token(
        GOOGLE_TOKEN_URL,
        client_secret=GOOGLE_CLIENT_SECRET,
        authorization_response=authorization_response
    )

    resp = google.get(GOOGLE_USERINFO_URL)
    if resp.status_code != 200:
        return False, "Failed to fetch user info"

    info = resp.json()
    email = info["email"]
    username = email.split("@")[0]
    first_name = info.get("given_name")
    last_name = info.get("family_name")

    # Insert or update user
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE email = %s;", (email,))
    row = cur.fetchone()
    if row:
        user_id = row[0]
    else:
        cur.execute("""
            INSERT INTO users (email, username, first_name, last_name, oauth, active_account)
            VALUES (%s, %s, %s, %s, TRUE, TRUE)
            RETURNING id;
        """, (email, username, first_name, last_name))
        user_id = cur.fetchone()[0]

    conn.commit()
    cur.close()
    conn.close()
    session["user_id"] = str(user_id)
    return True, "Google login successful"

### ---- INTRA42 ----

def get_intra42_authorization_url():
    redirect_url = f"{get_backend_base_url()}{os.getenv("INTRA42_REDIRECT_URI")}"
    intra42 = OAuth2Session(
        INTRA42_CLIENT_ID,
        redirect_uri=redirect_url
    )
    authorization_url, state = intra42.authorization_url(INTRA42_AUTHORIZATION_BASE_URL)
    return authorization_url, state


def handle_intra42_callback(authorization_response, state):
    redirect_url = f"{get_backend_base_url()}{os.getenv("INTRA42_REDIRECT_URI")}"
    intra42 = OAuth2Session(
        INTRA42_CLIENT_ID,
        state=state,
        redirect_uri=redirect_url
    )
    token = intra42.fetch_token(
        INTRA42_TOKEN_URL,
        client_secret=INTRA42_CLIENT_SECRET,
        authorization_response=authorization_response
    )

    resp = intra42.get(INTRA42_USERINFO_URL)
    if resp.status_code != 200:
        return False, "Failed to fetch user info"

    profile = resp.json()
    email = profile["email"]
    username = profile["login"]
    first_name = profile.get("first_name")
    last_name = profile.get("last_name")

    # Insert or update user
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE email = %s;", (email,))
    row = cur.fetchone()
    if row:
        user_id = row[0]
    else:
        cur.execute("""
            INSERT INTO users (email, username, first_name, last_name, oauth, active_account)
            VALUES (%s, %s, %s, %s, TRUE, TRUE)
            RETURNING id;
        """, (email, username, first_name, last_name))
        user_id = cur.fetchone()[0]
        
    conn.commit()
    cur.close()
    conn.close()
    session["user_id"] = str(user_id)
    return True, "Intra42 login successful"
