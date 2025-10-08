import os
import time
import random
import requests
import psycopg2 # type: ignore
import bcrypt # type: ignore
from faker import Faker # type: ignore
from datetime import datetime
from dotenv import load_dotenv # type: ignore
import math

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("POSTGRES_HOST"),
    "port": os.getenv("POSTGRES_PORT"),
    "database": os.getenv("POSTGRES_DB"),
    "user": os.getenv("POSTGRES_USER"),
    "password": os.getenv("POSTGRES_PASSWORD"),
}

TAGS = ['music', 'travel', 'fitness', 'reading', 'cooking', 'gym', 'code', 'football', 'pets']
GENDERS = ['male', 'female', 'non-binary']
PREFERENCES = ['heterosexual', 'homosexual', 'bisexual']

fake = Faker()

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode()

def random_coords():
    lat = round(random.uniform(36.0, 43.8), 6)
    lon = round(random.uniform(-9.5, 3.3), 6)
    return lat, lon


def insert_static_tags(cur):
    cur.executemany("INSERT INTO tags (name) VALUES (%s) ON CONFLICT DO NOTHING;", [(tag,) for tag in TAGS])

def insert_users_and_data(cur, count=500):
    
    for i in range(count):
        while True:
            email = fake.unique.email()
            username = fake.user_name()
            first_name = fake.first_name()
            last_name = fake.last_name()
            password = hash_password("password123")
            birth_date = fake.date_of_birth(minimum_age=18, maximum_age=50)
            biography = fake.sentence(nb_words=10)
            fame_rating = random.randint(0, 100)
            gender = random.choice(GENDERS)
            sexual_pref = random.choice(PREFERENCES)
            lat, lon = random_coords()
            now = datetime.now()

            try:
                print(f"👤 {i+1}/{count} → {first_name} ({username})")
                cur.execute("""
                    INSERT INTO users (
                        email, username, first_name, last_name, password, birth_date,
                        biography, fame_rating, gender, sexual_preferences,
                        latitude, longitude, location_last_updated,
                        completed_profile, active_account, oauth
                    ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,true,true,false)
                    RETURNING id;
                """, (
                    email, username, first_name, last_name, password, birth_date,
                    biography, fame_rating, gender, sexual_pref,
                    lat, lon, now,
                ))
                user_id = cur.fetchone()[0]
                break  # success, exit retry loop
            except psycopg2.errors.UniqueViolation as e:
                print(f"⚠️ Username/email duplicate, retrying...")
                cur.connection.rollback()
                continue
            except Exception as e:
                print(f"❌ Error inserting user: {e}")
                cur.connection.rollback()
                continue

        img_id = random.randint(1, 70)
        image_url = f"https://i.pravatar.cc/300?img={img_id}"
        cur.execute("INSERT INTO pictures (user_id, url, is_profile_picture) VALUES (%s, %s, true);", (user_id, image_url))

        user_tags = random.sample(TAGS, random.randint(2, 4))
        for idx, tag in enumerate(user_tags):
            cur.execute("""
                INSERT INTO user_tags (user_id, tag_id, index)
                VALUES (
                    %s,
                    (SELECT id FROM tags WHERE name = %s),
                    %s
                )
                ON CONFLICT DO NOTHING;
            """, (user_id, tag, idx))


def main():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cur = conn.cursor()

        print("📌 Insert tags...")
        insert_static_tags(cur)

        print("👥 Generating users...")
        insert_users_and_data(cur, count=30)

        cur.close()
        conn.close()
        print("✅ Users generated correctly.")
    except Exception as e:
        print("❌ Error:", e)

if __name__ == "__main__":
    main()
