from app import create_app, socketio
from app.sockets import chat_socket
from app.sockets import reminders_socket
import eventlet # type: ignore
import eventlet.wsgi # type: ignore

app = create_app()

# Register sockets
chat_socket.register_chat_socket(socketio)
reminders_socket.register_reminder_socket(socketio)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=3001, debug=True)
