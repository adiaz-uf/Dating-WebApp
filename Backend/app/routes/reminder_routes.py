from flask import Blueprint, session, jsonify, request # type: ignore

from app.services.reminder_service import get_user_reminders, mark_notification_as_read, mark_all_notifications_as_read


reminder_bp = Blueprint("reminder", __name__)


@reminder_bp.route("/", methods=["GET"])
def get_all_reminders():
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    return get_user_reminders(session_user_id)

@reminder_bp.route("/mark_read/<int:notif_id>", methods=["POST"])
def mark_notification_read(notif_id):
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    return mark_notification_as_read(session_user_id, notif_id)

@reminder_bp.route("/mark_all_read", methods=["POST"])
def mark_all_notifications_read():
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    return mark_all_notifications_as_read(session_user_id)
