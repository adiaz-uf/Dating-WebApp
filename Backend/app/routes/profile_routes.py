
from flask import Blueprint, session, jsonify, request # type: ignore
from app.services.profile_service import get_profile_data, update_profile_data
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
