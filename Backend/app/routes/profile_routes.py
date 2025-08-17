from flask import Blueprint, session, jsonify, request # type: ignore
from app.services.profile_service import get_exists_chat_with, get_is_liked_by_user, get_profile_data, get_user_recieved_likes, get_user_recieved_views, update_last_active, update_profile_data, updateUserLocation
from app.Utils.check_uuid import is_valid_uuid

profile_bp = Blueprint("profile", __name__)

# GET /profile
@profile_bp.route("/", methods=["GET"])
def get_own_profile():
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    return get_profile_data(session_user_id)

# GET /profile/:user_id
@profile_bp.route("/<user_id>", methods=["GET"])
def get_profile(user_id):
    if not is_valid_uuid(user_id):
        return jsonify({"success": False, "message": "Invalid user ID format"}), 400
    return get_profile_data(user_id)

# POST /profile
@profile_bp.route("/", methods=["POST", "OPTIONS"])
def update_own_profile():
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    data = request.get_json()
    return update_profile_data(session_user_id, data)

# POST /profile/location
@profile_bp.route("/location", methods=["POST"])
def updateLocation():
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    data = request.get_json()
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if latitude is None or longitude is None:
        return jsonify({"success": False, "message": "Latitude and longitude are required"}), 400
    
    return updateUserLocation(session_user_id, latitude, longitude)


# POST /profile/ping
@profile_bp.route("/ping", methods=["POST", "OPTIONS"])
def update_activity():
    if request.method == "OPTIONS":
        return '', 200
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    return update_last_active(session_user_id)


# GET /profile/likes
@profile_bp.route("/likes", methods=["GET"])
def get_recieved_likes():
   
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    return get_user_recieved_likes(session_user_id)

# GET /profile/views
@profile_bp.route("/views", methods=["GET"])
def get_recieved_views():
   
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    return get_user_recieved_views(session_user_id)

# GET /profile/liked-by/<user_id>
@profile_bp.route("/liked-by/<user_id>", methods=["GET"])
def get_liked_by_user(user_id):
   
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    return get_is_liked_by_user(session_user_id, user_id)


# GET /profile/chat-with/<user_id>
@profile_bp.route("/chat-with/<user_id>", methods=["GET"])
def get_chat_with(user_id):
   
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    return get_exists_chat_with(session_user_id, user_id)