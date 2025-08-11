from flask import Blueprint, request, jsonify, session # type: ignore

from app.services.user_service import get_suggested_users_data, set_user_liked, set_user_viewed, set_user_not_liked, set_user_disliked, set_user_not_disliked

users_bp = Blueprint("users", __name__)

@users_bp.route("/", methods=["GET"])
def get_suggested_users():
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    return get_suggested_users_data(session_user_id)

@users_bp.route("/profile-viewed", methods=["POST", "OPTIONS"])
def set_viewed_profile():
    if request.method == "OPTIONS":
        # CORS preflight
        response = jsonify({"success": True})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST,OPTIONS")
        return response, 200

    viewer_user = session.get("user_id")
    if not viewer_user:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    data = request.get_json()
    viewed_id = data.get("viewed_id")
    if not viewed_id:
        return jsonify({"success": False, "message": "Viewed user not found"}), 400

    return set_user_viewed(viewer_user, viewed_id)

@users_bp.route("/profile-liked", methods=["POST", "OPTIONS"])
def set_liked_profile():
    if request.method == "OPTIONS":
        # CORS preflight
        response = jsonify({"success": True})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST,OPTIONS")
        return response, 200

    liker_user = session.get("user_id")
    if not liker_user:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    data = request.get_json()
    liked_id = data.get("liked_id")
    if not liked_id:
        return jsonify({"success": False, "message": "liked user not found"}), 400

    return set_user_liked(liker_user, liked_id)

@users_bp.route("/profile-not-liked", methods=["POST", "OPTIONS"])
def set_not_liked_profile():
    if request.method == "OPTIONS":
        # CORS preflight
        response = jsonify({"success": True})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST,OPTIONS")
        return response, 200

    liker_user = session.get("user_id")
    if not liker_user:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    data = request.get_json()
    liked_id = data.get("liked_id")
    if not liked_id:
        return jsonify({"success": False, "message": "liked user not found"}), 400

    return set_user_not_liked(liker_user, liked_id)


@users_bp.route("/profile-disliked", methods=["POST", "OPTIONS"])
def set_disliked_profile():
    if request.method == "OPTIONS":
        response = jsonify({"success": True})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST,OPTIONS")
        return response, 200

    disliker_user = session.get("user_id")
    if not disliker_user:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    data = request.get_json()
    disliked_id = data.get("disliked_id")
    if not disliked_id:
        return jsonify({"success": False, "message": "disliked user not found"}), 400

    return set_user_disliked(disliker_user, disliked_id)
@users_bp.route("/profile-not-disliked", methods=["POST", "OPTIONS"])
def set_not_disliked_profile():
    if request.method == "OPTIONS":
        response = jsonify({"success": True})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST,OPTIONS")
        return response, 200

    disliker_user = session.get("user_id")
    if not disliker_user:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    data = request.get_json()
    disliked_id = data.get("disliked_id")
    if not disliked_id:
        return jsonify({"success": False, "message": "disliked user not found"}), 400

    return set_user_not_disliked(disliker_user, disliked_id)
