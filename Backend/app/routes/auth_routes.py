from flask import Blueprint, request, jsonify
from app.services.auth_service import register_user, login_user

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    success, message = register_user(username, password)
    return jsonify({"success": success, "message": message}), 200 if success else 400

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    success, message = login_user(username, password)
    return jsonify({"success": success, "message": message}), 200 if success else 401
