from flask import Blueprint, request, jsonify # type: ignore
from .db import get_db_connection

profile_bp = Blueprint("profile", __name__)

""" GET """
def get_profile_data(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # Datos principales del usuario
    cur.execute("""
        SELECT id, email, username, first_name, last_name, birth_date, biography, fame_rating, gender, sexual_preferences, latitude, longitude, completed_profile, active_account, oauth
        FROM users WHERE id = %s
    """, (user_id,))
    user = cur.fetchone()
    if not user:
        cur.close()
        conn.close()
        return jsonify({"success": False, "message": "User not found"}), 404

    # Obtener imagen principal (main_img)
    cur.execute("SELECT url FROM pictures WHERE user_id = %s AND is_profile_picture = TRUE LIMIT 1", (user_id,))
    main_img_row = cur.fetchone()
    main_img = main_img_row[0] if main_img_row else None

    # Obtener todas las imágenes
    cur.execute("SELECT url FROM pictures WHERE user_id = %s", (user_id,))
    images = [row[0] for row in cur.fetchall()]

    # Obtener tags
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
        "main_img": main_img,
        "images": images,
        "tags": tags,
    }

    cur.close()
    conn.close()
    return jsonify({"success": True, "profile": profile}), 200

""" PATCH """
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

