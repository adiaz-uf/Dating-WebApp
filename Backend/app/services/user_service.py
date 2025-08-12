from flask import Blueprint, jsonify # type: ignore
from .db import get_db_connection

users_bp = Blueprint("users", __name__)

# GET /users
def get_suggested_users_data(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT 
                u.id,
                u.username,
                u.city,
                u.first_name,
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

# POST /profile-viewed
def set_user_viewed(viewer_user, viewed_user):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT id FROM profile_views WHERE viewer_id = %s AND viewed_id = %s
        """, (viewer_user, viewed_user,))
        existing = cur.fetchone()
        if existing:
            # Update the viewed_at timestamp
            cur.execute("""
                UPDATE profile_views SET viewed_at = NOW() WHERE id = %s
            """, (existing[0],))
            conn.commit()
            return jsonify({"success": True, "message": "Profile View timestamp updated"}), 200
        else:
            cur.execute("""
                INSERT INTO profile_views (viewer_id, viewed_id)
                VALUES (%s, %s)
            """, (viewer_user, viewed_user,))
            conn.commit()
            return jsonify({"success": True, "message": "Profile View added"}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()

# POST /profile-liked
def set_user_liked(liker_user, liked_user):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Check if a dislike exists
        cur.execute("""
            SELECT id FROM dislikes WHERE disliker_id = %s AND disliked_id = %s
        """, (liker_user, liked_user,))
        dislike_existed = cur.fetchone() is not None
        # Remove dislike if exists
        cur.execute("""
            DELETE FROM dislikes WHERE disliker_id = %s AND disliked_id = %s
        """, (liker_user, liked_user,))
        # Add like
        cur.execute("""
            INSERT INTO likes (liker_id, liked_id)
            VALUES (%s, %s)
        """, (liker_user, liked_user,))

        # Fame rating logic
        if dislike_existed:
            # +2 for removing dislike, +2 for like
            cur.execute("""
                UPDATE users SET fame_rating = LEAST(fame_rating + 4, 100) WHERE id = %s
            """, (liked_user,))
        else:
            # Only +2 for like
            cur.execute("""
                UPDATE users SET fame_rating = LEAST(fame_rating + 2, 100) WHERE id = %s
            """, (liked_user,))

        # Check if users matched
        cur.execute("""
            SELECT id FROM likes WHERE liker_id = %s AND liked_id = %s
        """, (liked_user, liker_user))
        match = cur.fetchone()
        if match:
            # Check if users already got a chat
            cur.execute("""
                SELECT c.id FROM chats c
                JOIN chat_members cm1 ON c.id = cm1.chat_id AND cm1.user_id = %s
                JOIN chat_members cm2 ON c.id = cm2.chat_id AND cm2.user_id = %s
            """, (liker_user, liked_user))
            chat = cur.fetchone()
            if not chat:
                # Create chat between them
                cur.execute("INSERT INTO chats DEFAULT VALUES RETURNING id")
                chat_id = cur.fetchone()[0]
                cur.execute("INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s), (%s, %s)",
                            (chat_id, liker_user, chat_id, liked_user))
                conn.commit()
                return jsonify({"success": True, "message": "Like added", "match": True}), 201
            else:
                conn.commit()
                return jsonify({"success": True, "message": "Like added", "match": False}), 201
        conn.commit()
        return jsonify({"success": True, "message": "Like added", "match": False}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()

# POST /profile-not-liked
def set_user_not_liked(liker_user, liked_user):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            DELETE FROM likes WHERE liker_id = %s AND liked_id = %s
        """, (liker_user, liked_user,))
        # Fame rating -2, min 0
        cur.execute("""
            UPDATE users SET fame_rating = GREATEST(fame_rating - 2, 0) WHERE id = %s
        """, (liked_user,))
        conn.commit()
        return jsonify({"success": True, "message": "Like removed and fame_rating decreased"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()

# POST /profile-disliked
def set_user_disliked(disliker_user, disliked_user):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Check if like exists
        cur.execute("""
            SELECT id FROM likes WHERE liker_id = %s AND liked_id = %s
        """, (disliker_user, disliked_user,))
        like_existed = cur.fetchone() is not None
        # Remove like if exists
        cur.execute("""
            DELETE FROM likes WHERE liker_id = %s AND liked_id = %s
        """, (disliker_user, disliked_user,))
        # Add dislike
        cur.execute("""
            INSERT INTO dislikes (disliker_id, disliked_id)
            VALUES (%s, %s)
        """, (disliker_user, disliked_user,))

        # Delete chat between users if exists
        cur.execute("""
            SELECT c.id FROM chats c
            JOIN chat_members cm1 ON c.id = cm1.chat_id AND cm1.user_id = %s
            JOIN chat_members cm2 ON c.id = cm2.chat_id AND cm2.user_id = %s
        """, (disliker_user, disliked_user))
        chat = cur.fetchone()
        if chat:
            chat_id = chat[0]
            cur.execute("DELETE FROM messages WHERE chat_id = %s", (chat_id,))
            cur.execute("DELETE FROM chat_members WHERE chat_id = %s", (chat_id,))
            cur.execute("DELETE FROM chats WHERE id = %s", (chat_id,))

        # Fame rating logic
        if like_existed:
            # -2 for removing like, -2 for dislike
            cur.execute("""
                UPDATE users SET fame_rating = GREATEST(fame_rating - 4, 0) WHERE id = %s
            """, (disliked_user,))
        else:
            # Only -2 for dislike
            cur.execute("""
                UPDATE users SET fame_rating = GREATEST(fame_rating - 2, 0) WHERE id = %s
            """, (disliked_user,))
        conn.commit()
        return jsonify({"success": True, "message": "Dislike added, like removed if existed, chat deleted if existed, and fame_rating decreased accordingly"}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# POST /profile-not-disliked
def set_user_not_disliked(disliker_user, disliked_user):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            DELETE FROM dislikes WHERE disliker_id = %s AND disliked_id = %s
        """, (disliker_user, disliked_user,))
        # Fame rating +2, max 100
        cur.execute("""
            UPDATE users SET fame_rating = LEAST(fame_rating + 2, 100) WHERE id = %s
        """, (disliked_user,))
        conn.commit()
        return jsonify({"success": True, "message": "Dislike removed and fame_rating increased"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()