from flask import Blueprint, request, jsonify, session # type: ignore
from app.services.picture_service import allowed_file, update_profile_picture, upload_user_picture, delete_user_picture
from app.Utils.check_uuid import is_valid_uuid

picture_bp = Blueprint("picture", __name__)

# POST 
@picture_bp.route('/profile-picture', methods=['POST', 'OPTIONS'])
def upload_profile_picture():
    if request.method == 'OPTIONS':
        return '', 200
        
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"success": False, "message": "File type not allowed"}), 400

    try:
        file_url = update_profile_picture(session_user_id, file)
        return jsonify({
            "success": True,
            "message": "Profile picture updated successfully",
            "url": file_url
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# POST
@picture_bp.route('/', methods=['POST', 'OPTIONS'])
def upload_picture():
    if request.method == 'OPTIONS':
        return '', 200
        
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"success": False, "message": "File type not allowed"}), 400

    try:
        file_url = upload_user_picture(session_user_id, file)
        return jsonify({
            "success": True,
            "message": "Picture uploaded successfully",
            "url": file_url
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# DELETE
@picture_bp.route('/<filename>', methods=['DELETE', 'OPTIONS'])
def delete_picture(filename):
    if request.method == 'OPTIONS':
        return '', 200
        
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    try:
        delete_user_picture(session_user_id, filename)
        return jsonify({
            "success": True,
            "message": "Picture deleted successfully"
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
