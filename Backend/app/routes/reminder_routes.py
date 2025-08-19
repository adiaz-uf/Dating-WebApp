from flask import Blueprint, session, jsonify # type: ignore

from app.services.reminder_service import save_user_reminder #, get_user_reminders

reminder_bp = Blueprint("reminder", __name__)

@reminder_bp.route("/", methods=["POST"])
def post_reminder(reminder_id, sender_id , reciever_id, content):
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    if not content:
        return jsonify({"success": False, "message": "Reminder content required"}), 400
    
    if not sender_id or not reciever_id:
        return jsonify({"success": False, "message": "Reminder parameters required"}), 400
    return save_user_reminder(str(reminder_id), sender_id , reciever_id, content)


""" @reminder_bp.route("/", methods=["GET"])
def get_all_reminders():
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    return get_user_reminders(session_user_id) """
