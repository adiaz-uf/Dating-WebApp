from flask import Flask, send_from_directory # type: ignore
from dotenv import load_dotenv # type: ignore
from flask_cors import CORS # type: ignore
import os

from .routes.home_routes import home_bp
from .routes.auth_routes import auth_bp
from .routes.oauth_routes import oauth_bp
from .routes.profile_routes import profile_bp
from .routes.picture_routes import picture_bp

def create_app():
    load_dotenv()
    app = Flask(__name__)
    
    # Configurar la ruta para servir archivos de uploads
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory('/uploads', filename)
    app.secret_key = os.getenv("SECRET_KEY", "dev_secret_key_change_this")
    CORS(app, supports_credentials=True)

    # Configure upload folder for pictures
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    app.config["DEBUG"] = True # TODO: hot-reload

    app.register_blueprint(home_bp)
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(oauth_bp, url_prefix="/oauth")
    app.register_blueprint(profile_bp, url_prefix="/profile")
    app.register_blueprint(picture_bp, url_prefix="/pictures")

    return app