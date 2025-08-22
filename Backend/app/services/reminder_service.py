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
        elif notif_type == "dislike":
            message = f"{sender_name} disliked your profile"
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

def get_user_reminders(session_user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT n.id, n.type, n.sender_id, n.content, n.created_at, n.is_read,
                   u.first_name, u.username,
                   p.url as avatar
            FROM notifications n
            LEFT JOIN users u ON n.sender_id = u.id
            LEFT JOIN pictures p ON p.user_id = u.id AND p.is_profile_picture = TRUE
            WHERE n.user_id = %s
            ORDER BY n.created_at DESC
            LIMIT 20
        """, (session_user_id,))

        reminders = []
        for row in cur.fetchall():
            (id, notif_type, sender_id, content, created_at, is_read, first_name, username, avatar) = row
            sender_name = first_name or username or "Someone"
            reminders.append({
                "id": id,
                "type": notif_type,
                "sender_id": sender_id,
                "content": content,
                "created_at": created_at.isoformat() if created_at else None,
                "is_read": is_read,
                "avatar": avatar,
                "sender_name": sender_name
            })

        return jsonify({"success": True, "reminder": reminders}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()

def mark_notification_as_read(user_id, notif_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = %s AND user_id = %s
        """, (notif_id, user_id))
        conn.commit()
        return jsonify({"success": True, "message": "Notification marked as read"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()

def mark_all_notifications_as_read(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = %s AND is_read = FALSE
        """, (user_id,))
        conn.commit()
        return jsonify({"success": True, "message": "All notifications marked as read"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()