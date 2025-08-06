from flask import Blueprint, jsonify # type: ignore
from .db import get_db_connection

tag_bp = Blueprint("tag", __name__)

# PATCH
def add_or_update_tag(user_id, tag_name, index):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Elimina el prefijo # si existe
        clean_tag_name = tag_name.lstrip('#').strip()
        # Add to tags if not exists
        cur.execute("SELECT id FROM tags WHERE name = %s", (clean_tag_name,))
        tag = cur.fetchone()

        if tag:
            tag_id = tag[0]
        else:
            cur.execute("INSERT INTO tags (name) VALUES (%s) RETURNING id", (clean_tag_name,))
            tag_id = cur.fetchone()[0]


        # Check if user already has a tag at this index
        cur.execute("""
            SELECT tag_id FROM user_tags WHERE user_id = %s AND index = %s
        """, (user_id, index))
        existing = cur.fetchone()

        # Count how many tags the user has
        cur.execute("SELECT COUNT(*) FROM user_tags WHERE user_id = %s", (user_id,))
        tag_count = cur.fetchone()[0]
        if not existing and tag_count >= 5:
            return jsonify({"success": False, "message": "Maximum 5 tags allowed"}), 400

        if existing:
            # Update the tag at this index
            cur.execute("""
                UPDATE user_tags SET tag_id = %s WHERE user_id = %s AND index = %s
            """, (tag_id, user_id, index))
            conn.commit()
            return jsonify({"success": True, "message": "Tag replaced"}), 200
        else:
            # Insert new tag at this index
            cur.execute("""
                INSERT INTO user_tags (user_id, tag_id, index)
                VALUES (%s, %s, %s)
            """, (user_id, tag_id, index))
            conn.commit()
            return jsonify({"success": True, "message": "Tag added"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

    finally:
        cur.close()
        conn.close()
# GET
def suggest_tags(query):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        clean_query = query.lstrip('#').strip()
        cur.execute("""
            SELECT name FROM tags
            WHERE name ILIKE %s
            ORDER BY name ASC
            LIMIT 5
        """, (clean_query + '%',))
        tags = [row[0] for row in cur.fetchall()]
        return jsonify({"success": True, "tags": tags}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()
    

    
