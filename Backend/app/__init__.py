from flask import Flask, send_from_directory # type: ignore
from dotenv import load_dotenv # type: ignore
from flask_cors import CORS # type: ignore
from flask_socketio import SocketIO # type: ignore
import os

from .routes.auth_routes import auth_bp
from .routes.oauth_routes import oauth_bp
from .routes.profile_routes import profile_bp
from .routes.picture_routes import picture_bp
from .routes.tag_routes import tag_bp
from .routes.user_routes import users_bp
from .routes.chat_routes import chats_bp
from .routes.reminder_routes import reminder_bp

socketio = SocketIO(cors_allowed_origins="*") 

def create_app():
    load_dotenv()
    app = Flask(__name__)
    
    # serve files from /uploads
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory('/uploads', filename)
    
    # serve audio files from /chats/audio/
    @app.route('/chats/audio/<path:filename>')
    def audio_file(filename):
        audio_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads', 'audio')
        return send_from_directory(audio_folder, filename)

    app.secret_key = os.getenv("SECRET_KEY", "dev_secret_key_change_this")
    # Enable CORS for all routes, allowing credentials (cookies, etc.)
    CORS(app, supports_credentials=True)

    app.config["DEBUG"]

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(oauth_bp, url_prefix="/oauth")
    app.register_blueprint(profile_bp, url_prefix="/profile")
    app.register_blueprint(picture_bp, url_prefix="/pictures")
    app.register_blueprint(tag_bp, url_prefix="/tag")
    app.register_blueprint(users_bp, url_prefix="/users", strict_slashes=False)
    app.register_blueprint(chats_bp, url_prefix="/chats")
    app.register_blueprint(reminder_bp, url_prefix="/reminder")

    socketio.init_app(app, cors_allowed_origins="*")

    return app