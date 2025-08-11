from flask import Blueprint, request, jsonify, session # type: ignore
from .db import get_db_connection

profile_bp = Blueprint("profile", __name__)

# GET /profile
def get_profile_data(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # Main user Data
    cur.execute("""
        SELECT id, email, username, 
        first_name, last_name, birth_date,  
        biography, fame_rating, gender, 
        sexual_preferences, latitude, longitude, 
        completed_profile, active_account, oauth, 
        last_active
        FROM users WHERE id = %s
    """, (user_id,))
    user = cur.fetchone()
    if not user:
        cur.close()
        conn.close()
        return jsonify({"success": False, "message": "User not found"}), 404

    # search if user was liked by viewer
    viewer_id = session.get("user_id")
    liked = False
    if viewer_id and str(viewer_id) != str(user_id):
        cur.execute("""
            SELECT 1 FROM likes WHERE liker_id = %s AND liked_id = %s
        """, (viewer_id, user_id))
        liked = cur.fetchone() is not None

    # search if user was disliked by viewer
    viewer_id = session.get("user_id")
    disliked = False
    if viewer_id and str(viewer_id) != str(user_id):
        cur.execute("""
            SELECT 1 FROM dislikes WHERE disliker_id = %s AND disliked_id = %s
        """, (viewer_id, user_id))
        disliked = cur.fetchone() is not None

    # Profile picture
    cur.execute("SELECT url FROM pictures WHERE user_id = %s AND is_profile_picture = TRUE LIMIT 1", (user_id,))
    main_img_row = cur.fetchone()
    main_img = main_img_row[0] if main_img_row else None

    # other pictures
    cur.execute("SELECT url FROM pictures WHERE user_id = %s", (user_id,))
    images = [row[0] for row in cur.fetchall()]

    # tags
    cur.execute("""
        SELECT t.name FROM tags t
        JOIN user_tags ut ON ut.tag_id = t.id
        WHERE ut.user_id = %s
    """, (user_id,))
    tags = [row[0] for row in cur.fetchall()]

    profile = {
        "id": user[0],
        "email": user[1],
        "username": user[2],
        "first_name": user[3],
        "last_name": user[4],
        "birth_date": user[5],
        "biography": user[6],
        "fame_rating": user[7],
        "gender": user[8],
        "sexual_preferences": user[9],
        "latitude": user[10],
        "longitude": user[11],
        "completed_profile": user[12],
        "active_account": user[13],
        "oauth": user[14],
        "last_active": user[15],
        "main_img": main_img,
        "images": images,
        "tags": tags,
        "liked": liked,
        "disliked": disliked
    }

    cur.close()
    conn.close()
    return jsonify({"success": True, "profile": profile}), 200

# PATCH /profile
def update_profile_data(user_id, data):
    allowed_fields = {
        "first_name",
        "last_name",
        "email",
        "biography",
        "birth_date",
        "gender",
        "sexual_preferences",
        "completed_profile"
    }

    fields_to_update = []
    values = []

    for field in allowed_fields:
        if field in data:
            fields_to_update.append(f"{field} = %s")
            values.append(data[field])

    if not fields_to_update:
        return jsonify({"success": False, "message": "No fields to update"}), 400

    values.append(user_id)  # for WHERE id = %s

    query = f"""
        UPDATE users SET {', '.join(fields_to_update)}
        WHERE id = %s
    """

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(query, values)
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({"success": True, "message": "Profile updated"}), 200


def reverse_geocode(latitude, longitude):
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&zoom=10"
        headers = {"User-Agent": "YourAppName/1.0 (your@email.com)"}
        response = request.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        city = data.get("address", {}).get("city") or \
               data.get("address", {}).get("town") or \
               data.get("address", {}).get("village") or \
               data.get("address", {}).get("municipality") or \
               data.get("address", {}).get("county")
        return city
    except Exception as e:
        print(f"Reverse geocoding failed: {e}")
        return None


def updateUserLocation(user_id, latitude, longitude):
    conn = get_db_connection()
    cur = conn.cursor()

    city = reverse_geocode(latitude, longitude)

    try:
        cur.execute("""
            UPDATE users
            SET latitude = %s, 
            longitude = %s,
            city = %s,
            location_last_updated = NOW()
            WHERE id = %s
        """, (latitude, longitude, city, user_id))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({"success": True, "message": "Location updated"}), 200


def update_last_active(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(""" 
            UPDATE users SET last_active = NOW() WHERE id = %s 
        """, (user_id,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()
    return jsonify({"success": True, "message": "Activity state updated"}), 200
