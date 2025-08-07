from flask import Blueprint, request, jsonify, session # type: ignoregs

from app.services.user_service import get_suggested_users_data

users_bp = Blueprint("users", __name__)

@users_bp.route("/", methods=["GET"])
def get_suggested_users():
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    return get_suggested_users_data(session_user_id)