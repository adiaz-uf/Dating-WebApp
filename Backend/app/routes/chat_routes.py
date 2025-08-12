from flask import Blueprint, request, jsonify, session # type: ignore

from app.services.chat_service import get_user_chats_data, post_message_to_chat, get_chat_messages

chats_bp = Blueprint("chats", __name__)

@chats_bp.route("/", methods=["GET"])
def get_user_chats():
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    return get_user_chats_data(session_user_id)


# POST /chats/<chat_id>/messages
@chats_bp.route("/<int:chat_id>/messages", methods=["POST"])
def post_message(chat_id):
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    data = request.get_json()
    content = data.get("content")
    if not content:
        return jsonify({"success": False, "message": "Message content required"}), 400
    return post_message_to_chat(str(chat_id), session_user_id, content)

# GET /chats/<chat_id>/messages
@chats_bp.route("/<chat_id>/messages", methods=["GET"])
def get_messages(chat_id):
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    return get_chat_messages(str(chat_id), session_user_id)