from flask import Blueprint, jsonify # type: ignore

from .db import get_db_connection

reminder_bp = Blueprint("reminder", __name__)


def save_user_reminder(user_id, sender_id, notif_type, content=None):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Get sender name
        cur.execute("SELECT username, first_name FROM users WHERE id = %s", (sender_id,))
        row = cur.fetchone()
        if row:
            username, first_name = row
            sender_name = first_name or username
        else:
            sender_name = "Someone"

        # Get sender profile picture
        cur.execute("""
            SELECT url FROM pictures
            WHERE user_id = %s AND is_profile_picture = TRUE
            ORDER BY uploaded_at DESC LIMIT 1
        """, (sender_id,))
        avatar_row = cur.fetchone()
        avatar_url = avatar_row[0] if avatar_row else None

        # Build reminder message
        if notif_type == "like":
            message = f"{sender_name} liked your profile"
        elif notif_type == "view":
            message = f"{sender_name} viewed your profile"
        elif notif_type == "message":
            message = f"New message from {sender_name}"
        elif notif_type == "match":
            message = f"You matched with {sender_name}"
        elif notif_type == "unlike":
            message = f"{sender_name} unliked you"
        else:
            message = content or "New notification"

        cur.execute("""
            INSERT INTO notifications (user_id, sender_id, type, content)
            VALUES (%s, %s, %s, %s)
            RETURNING id, created_at
        """, (user_id, sender_id, notif_type, message))

        notif_id, created_at = cur.fetchone()
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Notification created",
            "notif_id": notif_id,
            "user_id": user_id,
            "sender_id": sender_id,
            "sender_name": sender_name,
            "type": notif_type,
            "content": message,
            "created_at": created_at.isoformat(),
            "is_read": False,
            "avatar": avatar_url
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()