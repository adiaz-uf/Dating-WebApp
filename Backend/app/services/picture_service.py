from flask import current_app # type: ignore
import os
from werkzeug.utils import secure_filename # type: ignore
from .db import get_db_connection
from ..Utils.get_base_url import get_backend_base_url

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file, user_id):
    if not file:
        return None
    
    filename = secure_filename(file.filename)
    # Ensure unique filename
    base, ext = os.path.splitext(filename)
    counter = 1
    while os.path.exists(os.path.join('/uploads', filename)):
        filename = f"{base}_{counter}{ext}"
        counter += 1
    
    file_path = os.path.join('/uploads', filename)
    file.save(file_path)
    base_url = get_backend_base_url()
    return f"{base_url}/uploads/{filename}"

def update_profile_picture(user_id, file):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get current profile picture URL if exists
        cur.execute("""
            SELECT url FROM pictures 
            WHERE user_id = %s AND is_profile_picture = TRUE
        """, (user_id,))
        result = cur.fetchone()
        old_profile_url = result[0] if result else None

        # Delete old profile picture if exists
        if old_profile_url:
            # Delete from filesystem
            old_filename = old_profile_url.split('/')[-1]
            old_file_path = os.path.join('/uploads', old_filename)
            if os.path.exists(old_file_path):
                os.remove(old_file_path)
            
            # Delete from database
            cur.execute("""
                DELETE FROM pictures 
                WHERE user_id = %s AND is_profile_picture = TRUE
            """, (user_id,))

        # Save new file and get URL
        file_url = save_file(file, user_id)
        if not file_url:
            raise Exception("Error saving file")

        # Insert new profile picture
        cur.execute("""
            INSERT INTO pictures (user_id, url, is_profile_picture)
            VALUES (%s, %s, TRUE)
        """, (user_id, file_url))

        conn.commit()
        cur.close()
        conn.close()

        return file_url

    except Exception as e:
        if conn:
            conn.rollback()
            cur.close()
            conn.close()
        raise e

def upload_user_picture(user_id, file):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Check if user already has 4 non-profile pictures
        cur.execute("""
            SELECT COUNT(*) FROM pictures 
            WHERE user_id = %s AND is_profile_picture = FALSE
        """, (user_id,))
        count = cur.fetchone()[0]
        if count >= 4:
            raise Exception("Maximum number of additional pictures reached (4). Profile picture doesn't count towards this limit.")

        # Save file and get URL
        file_url = save_file(file, user_id)
        if not file_url:
            raise Exception("Error saving file")

        # Insert picture
        cur.execute("""
            INSERT INTO pictures (user_id, url, is_profile_picture)
            VALUES (%s, %s, FALSE)
        """, (user_id, file_url))

        conn.commit()
        cur.close()
        conn.close()

        return file_url

    except Exception as e:
        if conn:
            conn.rollback()
            cur.close()
            conn.close()
        raise e

def delete_user_picture(user_id, filename):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get picture info and verify ownership
        base_url = get_backend_base_url()
        full_url = f"{base_url}/uploads/{filename}"
        
        cur.execute("""
            SELECT id FROM pictures 
            WHERE url = %s AND user_id = %s AND is_profile_picture = FALSE
        """, (full_url, user_id))
        result = cur.fetchone()
        
        if not result:
            raise Exception("Picture not found or not authorized")

        # Delete file from filesystem
        file_path = os.path.join('/uploads', filename)
        if os.path.exists(file_path):
            os.remove(file_path)

        # Delete from database
        cur.execute("DELETE FROM pictures WHERE id = %s", (result[0],))
        conn.commit()

        cur.close()
        conn.close()

    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
            cur.close()
            conn.close()
        raise e
