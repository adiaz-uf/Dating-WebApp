from flask import Blueprint # type: ignore

home_bp = Blueprint('home', __name__)

@home_bp.route('/')
def home():
    return "Hola mundooo"
