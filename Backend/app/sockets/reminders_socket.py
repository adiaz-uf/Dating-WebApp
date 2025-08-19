from flask import session  # type: ignore
from flask_socketio import emit, join_room, disconnect  # type: ignore

from ..services.reminder_service import save_user_reminder

def register_reminder_socket(socketio):

    def validate_reminder_data(data, require_content=False):
        to_id = data.get("to")
        from_id = data.get("from") or session.get("user_id")
        notif_type = data.get("type")
        content = data.get("content")

        if not (to_id and from_id and notif_type):
            return None, None, None, None, {"success": False, "message": "Missing to, from or type"}

        if require_content and not content:
            return None, None, None, None, {"success": False, "message": "Missing content"}

        return to_id, from_id, notif_type, content, None

    @socketio.on("register_reminder")
    def on_register_reminder(data):
        user_id = data.get("user_id") or session.get("user_id")
        if not user_id:
            emit("error", {"success": False, "message": "Missing user_id"})
            disconnect()
            return
        join_room(user_id)
        emit("status", {"success": True, "message": f"User {user_id} joined notifications."})

    @socketio.on("send_reminder")
    def handle_send_reminder(data):
        to_id, from_id, notif_type, content, error = validate_reminder_data(data)
        if error:
            emit("error", error)
            return

        resp, status = save_user_reminder(to_id, from_id, notif_type, content)
        if status == 201:
            notif_json = resp.json
            emit("receive_reminder", notif_json, room=to_id)
        else:
            emit("error", {"success": False, "message": resp.json.get("message", "Error creating notification")})

    @socketio.on("disconnect")
    def on_disconnect():
        uid = session.get("user_id")

