from flask import Blueprint, request, jsonify, session, send_from_directory # type: ignore
import os
import uuid
from werkzeug.utils import secure_filename

from app.services.chat_service import get_user_chats_data, post_message_to_chat, get_chat_messages, save_audio_message

chats_bp = Blueprint("chats", __name__)

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads', 'audio')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    print(f"Created audio upload directory: {UPLOAD_FOLDER}")

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

# POST /chats/<chat_id>/audio
@chats_bp.route("/<chat_id>/audio", methods=["POST"])
def post_audio_message(chat_id):
    print(f"Received audio upload request for chat_id: {chat_id}")  # Debug log
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    print(f"Request files: {list(request.files.keys())}")  # Debug log
    if 'audio' not in request.files:
        return jsonify({"success": False, "message": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({"success": False, "message": "No audio file selected"}), 400
    
    # Generate unique filename
    filename = f"{uuid.uuid4().hex}.webm"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    try:
        print(f"Saving audio file to: {filepath}")  # Debug log
        audio_file.save(filepath)
        audio_url = f"/chats/audio/{filename}"
        print(f"Audio URL generated: {audio_url}")  # Debug log
        return save_audio_message(str(chat_id), session_user_id, audio_url)
    except Exception as e:
        print(f"Error saving audio: {str(e)}")  # Debug log
        return jsonify({"success": False, "message": f"Error saving audio: {str(e)}"}), 500

# GET /chats/<chat_id>/messages
@chats_bp.route("/<chat_id>/messages", methods=["GET"])
def get_messages(chat_id):
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    return get_chat_messages(str(chat_id), session_user_id)

# Serve audio files
@chats_bp.route("/audio/<filename>", methods=["GET"])
def serve_audio(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)