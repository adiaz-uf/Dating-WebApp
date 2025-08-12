
from flask_socketio import emit, join_room, leave_room # type: ignore
from flask import session # type: ignore
from ..services.chat_service import post_message_to_chat

def register_chat_socket(socketio):
    @socketio.on('join')
    def on_join(data):
        room = data['chat_id']
        join_room(room)
        emit('status', {'msg': f"{data['username']} joined the chat."}, room=room)

    @socketio.on('leave')
    def on_leave(data):
        room = data['chat_id']
        leave_room(room)
        emit('status', {'msg': f"{data['username']} left the chat."}, room=room)

    @socketio.on('send_message')
    def handle_send_message(data):
        chat_id = data.get('chat_id')
        user_id = data.get('user_id') or session.get('user_id')
        content = data.get('content')
        if not (chat_id and user_id and content):
            emit('error', {'msg': 'Missing chat_id, user_id, or content'})
            return
        # POST message into DB
        resp, status = post_message_to_chat(chat_id, user_id, content)
        if status == 201:
            emit('receive_message', {
                'chat_id': chat_id,
                'user_id': user_id,
                'content': content,
                'msg_id': resp.json.get('msg_id'),
                'sent_at': resp.json.get('sent_at')
            }, room=chat_id)
        else:
            emit('error', {'msg': resp.json.get('message', 'Error sending message')})