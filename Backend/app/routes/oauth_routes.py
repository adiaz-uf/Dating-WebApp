from flask import Blueprint, redirect, request, session, jsonify # type: ignore
from app.services.oauth_service import get_google_authorization_url, handle_google_callback
from app.services.oauth_service import get_intra42_authorization_url, handle_intra42_callback
from app.Utils.get_base_url import get_frontend_base_url

oauth_bp = Blueprint("oauth", __name__)

@oauth_bp.route("/google")
def google_login():
    authorization_url, state = get_google_authorization_url()
    session["oauth_state"] = state
    return redirect(authorization_url)

@oauth_bp.route("/google/callback")
def google_callback():
    success, message = handle_google_callback(request.url, session.get("oauth_state"))
    if success:
        frontend_url = get_frontend_base_url()
        user_id = session.get("user_id")
        # Redirect to login with userId as query param so frontend can store it
        return redirect(f"{frontend_url}/?userId={user_id}")
    else:
        return jsonify({"success": False, "message": message}), 400

# INTRA42 OAUTH
@oauth_bp.route("/intra42")
def intra42_login():
    authorization_url, state = get_intra42_authorization_url()
    session["oauth_state"] = state
    return redirect(authorization_url)

@oauth_bp.route("/intra42/callback")
def intra42_callback():
    success, message = handle_intra42_callback(request.url, session.get("oauth_state"))
    if success:
        frontend_url = get_frontend_base_url()
        user_id = session.get("user_id")
        return redirect(f"{frontend_url}/?userId={user_id}")
    else:
        return jsonify({"success": False, "message": message}), 400