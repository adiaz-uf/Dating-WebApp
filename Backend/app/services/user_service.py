from flask import Blueprint, jsonify # type: ignore
from .db import get_db_connection

users_bp = Blueprint("users", __name__)

def advanced_search_users(user_id, filters):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Get logged-in user coordinates
        cur.execute("SELECT latitude, longitude FROM users WHERE id = %s", (user_id,))
        user_row = cur.fetchone()
        user_lat, user_lon = user_row if user_row else (None, None)
  
        conditions = [
            "u.id != %s",           
            "u.active_account = TRUE",
            "u.completed_profile = TRUE"
        ]

        # --- Filters ---
        # Age
        age_min, age_max = filters.get("ageRange", [18, 99])
        if age_min is not None and age_max is not None:
            conditions.append("EXTRACT(YEAR FROM AGE(u.birth_date)) BETWEEN %s AND %s")

        # Fame
        fame_min, fame_max = filters.get("fameRating", [0, 100])
        if fame_min is not None and fame_max is not None:
            conditions.append("u.fame_rating BETWEEN %s AND %s")

        # Distance filter
        location = filters.get("location")
        select_distance = ''
        if location and user_lat is not None and user_lon is not None:
            try:
                max_distance = float(location)
                # Add distance column
                select_distance = """,
                    (6371 * acos(least(1,
                        cos(radians(%s)) * cos(radians(u.latitude)) *
                        cos(radians(u.longitude) - radians(%s)) +
                        sin(radians(%s)) * sin(radians(u.latitude))
                    ))) AS distance_km
                """
                # WHERE distance
                conditions.append("""(
                    6371 * acos(least(1,
                        cos(radians(%s)) * cos(radians(u.latitude)) *
                        cos(radians(u.longitude) - radians(%s)) +
                        sin(radians(%s)) * sin(radians(u.latitude))
                    ))
                ) <= %s""")
                distance_params = [user_lat, user_lon, user_lat, user_lat, user_lon, user_lat, max_distance]
            except ValueError:
                distance_params = []
        else:
            distance_params = []
       
        # Tags
        tags = filters.get("tags", [])
        tag_params = []
        if tags and isinstance(tags, list) and tags[0]:
            tag_placeholders = ','.join(['%s'] * len(tags))
            conditions.append(f"""u.id IN (
                SELECT ut.user_id
                FROM user_tags ut
                JOIN tags t ON ut.tag_id = t.id
                WHERE LOWER(t.name) IN ({tag_placeholders})
            )""")
            tag_params = [t.lower() for t in tags if t]

        # --- Build SQL ---
        sql = f"""
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
                {select_distance}
            FROM users u
            WHERE {' AND '.join(conditions)}
        """
  
        # Sorting
        sort_by = filters.get("sortBy", "location")
        sort_order = filters.get("sortOrder", "asc")
        order_map = {
            "age": "u.birth_date",
            "location": "distance_km" if location else "u.city",
            "fame_rating": "u.fame_rating",
            "tags": """array_length(
                ARRAY(SELECT t.name FROM user_tags ut JOIN tags t ON ut.tag_id = t.id WHERE ut.user_id = u.id),
                1
            )"""
        }
        order_field = order_map.get(sort_by, "u.city")
        sql += f" ORDER BY {order_field} {'ASC' if sort_order == 'asc' else 'DESC'} LIMIT 50"
    
        # --- Params ---
        params = []
        # First: distance params for SELECT clause (if exists)
        if distance_params:
            params.extend(distance_params[:3])
        
        # Second: WHERE clause params in order
        params.append(user_id)               
        if age_min is not None and age_max is not None:
            params.extend([age_min, age_max])   # age
        if fame_min is not None and fame_max is not None:
            params.extend([fame_min, fame_max]) # fame
        if distance_params:
            params.extend(distance_params[3:])  # distance
        if tag_params:
            params.extend(tag_params)           # tags
        
        # Execute
        cur.execute(sql, tuple(params))
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        users = [dict(zip(columns, row)) for row in rows]
        return jsonify({"success": True, "users": users}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()



# GET suggested users based on location, tags, sexuality, etc
def get_suggested_users_data(user_id):
    """
    Return suggested users based on location, sexual orientation, 
    shared tags and fame rating.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    result = None
    code = None
    try:
        # Get actual user's data
        cur.execute("""
            SELECT gender, sexual_preferences, city, latitude, longitude
            FROM users WHERE id = %s
        """, (user_id,))
        user = cur.fetchone()
        if not user:
            result = jsonify({"success": False, "message": "User not found"})
            code = 404
            return result, code
        gender, sexual_pref, user_city, user_lat, user_lon = user

        # Determinate genders to show based on sexual orietation
        genders_to_show = []
        if not sexual_pref or sexual_pref.lower() == 'bisexual':
            genders_to_show = ['male', 'female', 'non-binary']
        elif sexual_pref.lower() == 'heterosexual':
            if gender and gender.lower() == 'male':
                genders_to_show = ['female']
            elif gender and gender.lower() == 'female':
                genders_to_show = ['male']
            else:
                genders_to_show = ['male', 'female', 'non-binary']
        elif sexual_pref.lower() == 'homosexual':
            if gender and gender.lower() == 'male':
                genders_to_show = ['male']
            elif gender and gender.lower() == 'female':
                genders_to_show = ['female']
            else:
                genders_to_show = ['male', 'female', 'non-binary']
        else:
            genders_to_show = ['male', 'female', 'non-binary']

        # Suggestions Query
        
        # 1. Prioritys: same city, then distance, tags and fame
        # 2. Only active users and completed profile
        # 3. Only compatible genders
        # 4. Discard blocked users
        if user_lat is None or user_lon is None:
            cur.execute(f"""
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
                    ) AS tags,
                    NULL AS distance_km,
                    (
                        SELECT COUNT(*) FROM user_tags ut1
                        JOIN user_tags ut2 ON ut1.tag_id = ut2.tag_id
                        WHERE ut1.user_id = u.id AND ut2.user_id = %s
                    ) AS shared_tags
                FROM users u
                WHERE u.active_account = TRUE
                    AND u.completed_profile = TRUE
                    AND u.id != %s
                    AND (LOWER(u.gender) = ANY(%s))
                    AND u.id NOT IN (
                            SELECT blocked_id FROM blocks WHERE blocker_id = %s
                    )
                ORDER BY 
                    (u.city = %s) DESC,
                    shared_tags DESC,
                    u.fame_rating DESC
                LIMIT 50
            """,
            (
                user_id, user_id, genders_to_show, user_id,
            ))
        else:
            cur.execute(f"""
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
                    ) AS tags,
                    ( 2 * 6371 * asin(
                        sqrt(
                            POWER(sin(radians(u.latitude - %s) / 2), 2) +
                            cos(radians(%s)) * cos(radians(u.latitude)) *
                            POWER(sin(radians(u.longitude - %s) / 2), 2)
                        )
                    ) ) AS distance_km,
                    (
                        SELECT COUNT(*) FROM user_tags ut1
                        JOIN user_tags ut2 ON ut1.tag_id = ut2.tag_id
                        WHERE ut1.user_id = u.id AND ut2.user_id = %s
                    ) AS shared_tags
                FROM users u
                WHERE u.active_account = TRUE
                    AND u.completed_profile = TRUE
                    AND u.id != %s
                    AND (LOWER(u.gender) = ANY(%s))
                    AND u.id NOT IN (
                            SELECT blocked_id FROM blocks WHERE blocker_id = %s
                    )
                ORDER BY 
                    distance_km ASC,
                    shared_tags DESC,
                    u.fame_rating DESC
                LIMIT 50
            """,
            (
                user_lat, user_lat, user_lon, user_id, user_id, genders_to_show, user_id,
            ))

        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        users = [dict(zip(columns, row)) for row in rows]
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()
    return jsonify({"success": True, "users": users}), 200


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

        # Delete chat between users if exists
        cur.execute("""
            SELECT c.id FROM chats c
            JOIN chat_members cm1 ON c.id = cm1.chat_id AND cm1.user_id = %s
            JOIN chat_members cm2 ON c.id = cm2.chat_id AND cm2.user_id = %s
        """, (liker_user, liked_user))
        chat = cur.fetchone()
        if chat:
            chat_id = chat[0]
            cur.execute("DELETE FROM messages WHERE chat_id = %s", (chat_id,))
            cur.execute("DELETE FROM chat_members WHERE chat_id = %s", (chat_id,))
            cur.execute("DELETE FROM chats WHERE id = %s", (chat_id,))

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


# POST /block
def set_user_blocked(blocker_user, blocked_user):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT id FROM blocks WHERE blocker_id = %s AND blocked_id = %s
        """, (blocker_user, blocked_user,))
        existing = cur.fetchone()
        if not existing:
            cur.execute("""
                INSERT INTO blocks (blocker_id, blocked_id)
                VALUES (%s, %s)
            """, (blocker_user, blocked_user,))
            
        conn.commit()
        set_user_not_liked(blocker_user, blocked_user)
        
        return jsonify({"success": True, "message": "Profile block added"}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()