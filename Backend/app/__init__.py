from flask import Flask # type: ignore
from dotenv import load_dotenv # type: ignore
import os

from .routes.home_routes import home_bp
from .routes.auth_routes import auth_bp

def create_app():
    load_dotenv()
    app = Flask(__name__)

    app.config["DEBUG"] = True # TODO: hot-reload

    app.register_blueprint(home_bp)
    app.register_blueprint(auth_bp, url_prefix="/auth")


    return app