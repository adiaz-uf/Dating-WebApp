from flask import Blueprint, request, jsonify, session # type: ignore

from app.services.tag_service import add_or_update_tag, suggest_tags, replace_all_tags

tag_bp = Blueprint("tag", __name__)

# GET /tag/suggest?query=...
@tag_bp.route("/suggest", methods=["GET"])
def tag_suggest():
    query = request.args.get("query", "").strip().lower()
    if not query:
        return jsonify({"success": True, "tags": []}), 200
    return suggest_tags(query)

# POST /tag
@tag_bp.route("/", methods=["POST", "OPTIONS"])
def add_tag():
    if request.method == "OPTIONS":
        return '', 200
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    data = request.get_json()

    if not data or "value" not in data or "index" not in data:
        return jsonify({"success": False, "message": "Missing 'name' or 'index' in request"}), 400

    tag_name = data["value"].strip().lower()
    tag_index = data["index"]

    return add_or_update_tag(session_user_id, tag_name, tag_index)

# POST /tag/replace
@tag_bp.route("/replace", methods=["POST", "OPTIONS"])
def replace_tags():
    if request.method == "OPTIONS":
        return '', 200
    session_user_id = session.get("user_id")
    if not session_user_id:
        return jsonify({"success": False, "message": "Not authenticated"}), 401

    data = request.get_json()
    tags = data.get("tags", [])
    if not isinstance(tags, list):
        return jsonify({"success": False, "message": "Tags must be a list"}), 400
    return replace_all_tags(session_user_id, tags)