from flask import Blueprint, request, jsonify, session # type: ignore
from app.services.auth_service import register_user, login_user, confirm_email, reset_password, reset_password_confirm

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")
    first_name = data.get("first_name")
    last_name = data.get("last")
    success, message = register_user(username, password, email, first_name, last_name)
    return jsonify({"success": success, "message": message}), 200 if success else 400

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    success, result = login_user(username, password)
    if success:
        session["user_id"] = result.id
        return jsonify({"success": True, "message": "Logged in"}), 200
    else:
        # result contains the error message from login_user
        message = result
        if message == "Account not verified":
            return jsonify({"success": False, "message": "Account not confirmed"}), 401
        return jsonify({"success": False, "message": "Invalid credentials"}), 401


@auth_bp.route("/email/callback", methods=["GET"])
def confirm_email_route():
    token = request.args.get("token")
    success, message = confirm_email(token)
    return jsonify({"success": success, "message": message}), 200 if success else 400

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password_route():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
    success, message = reset_password(email)
    return jsonify({"success": success, "message": message}), 200 if success else 400

@auth_bp.route("/reset-password-confirm", methods=["POST"])
def reset_password_confirm_route():
    data = request.get_json()
    password = data.get("new_password")
    token = data.get("token")

    if not token or not password:
        return jsonify({"success": False, "message": "Missing token or password"}), 400

    success, message = reset_password_confirm(password, token)
    return jsonify({"success": success, "message": message}), 200 if success else 400

