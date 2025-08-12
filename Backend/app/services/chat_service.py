from flask import Blueprint, jsonify # type: ignore
from .db import get_db_connection

chats_bp = Blueprint("chats", __name__)

def get_user_chats_data(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT
                c.id AS chat_id,
                c.created_at,
                u.id AS other_user_id,
                u.username AS other_username,
                u.first_name AS other_first_name,
                u.last_name AS other_last_name,
                u.last_active AS other_last_active,
                (
                    SELECT url FROM pictures
                    WHERE user_id = u.id AND is_profile_picture = TRUE
                    ORDER BY uploaded_at DESC LIMIT 1
                ) AS other_avatar,
                m.content AS last_message,
                m.sent_at AS last_message_at
            FROM chats c
            JOIN chat_members cm ON c.id = cm.chat_id
            JOIN chat_members cm2 ON c.id = cm2.chat_id AND cm2.user_id != %s
            JOIN users u ON cm2.user_id = u.id
            LEFT JOIN LATERAL (
                SELECT content, sent_at
                FROM messages
                WHERE chat_id = c.id
                ORDER BY sent_at DESC
                LIMIT 1
            ) m ON true
            WHERE cm.user_id = %s
            ORDER BY m.sent_at DESC NULLS LAST, c.created_at DESC;
        """, (user_id, user_id))
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        chats = [dict(zip(columns, row)) for row in rows]
        return jsonify({"success": True, "chats": chats}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()

def post_message_to_chat(chat_id, user_id, content):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # check user in chat
        cur.execute("""
            SELECT 1 FROM chat_members WHERE chat_id = %s AND user_id = %s
        """, (chat_id, user_id))
        if not cur.fetchone():
            return jsonify({"success": False, "message": "User not in chat"}), 403
        
        # Insert message
        cur.execute("""
            INSERT INTO messages (chat_id, sender_id, content)
            VALUES (%s, %s, %s)
            RETURNING id, sent_at
        """, (chat_id, user_id, content))
        msg_id, sent_at = cur.fetchone()
        conn.commit()
        return jsonify({
            "success": True,
            "message": "Message sent",
            "msg_id": msg_id,
            "sent_at": sent_at
        }), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()

def get_chat_messages(chat_id, user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # check user in chat
        cur.execute("""
            SELECT 1 FROM chat_members WHERE chat_id = %s AND user_id = %s
        """, (chat_id, user_id))
        if not cur.fetchone():
            return jsonify({"success": False, "message": "User not in chat"}), 403
        
        # get all messages
        cur.execute("""
            SELECT m.id, m.sender_id, m.content, m.sent_at
            FROM messages m
            WHERE m.chat_id = %s
            ORDER BY m.sent_at ASC
        """, (chat_id,))
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        messages = [dict(zip(columns, row)) for row in rows]
        return jsonify({"success": True, "messages": messages}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()