from flask import Blueprint, jsonify # type: ignore
from .db import get_db_connection

users_bp = Blueprint("users", __name__)

def get_suggested_users_data(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT 
                u.id,
                u.username,
                u.birth_date,
                u.latitude,
                u.longitude,
                u.biography,
                u.fame_rating,
                (
                    SELECT url 
                    FROM pictures 
                    WHERE user_id = u.id AND is_profile_picture = TRUE 
                    ORDER BY uploaded_at DESC 
                    LIMIT 1
                ) AS main_img,
                ARRAY(
                    SELECT t.name
                    FROM user_tags ut
                    JOIN tags t ON ut.tag_id = t.id
                    WHERE ut.user_id = u.id
                    ORDER BY ut.index
                ) AS tags
            FROM users u
            WHERE u.active_account = TRUE 
              AND u.completed_profile = TRUE
              AND u.id != %s
        """, (user_id,))

        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]

        users = [dict(zip(columns, row)) for row in rows]

        return jsonify({"success": True, "users": users}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        cur.close()
        conn.close()