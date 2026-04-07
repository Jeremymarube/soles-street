import os

from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash

admin_bp = Blueprint("admin", __name__)


def get_admin_credentials():
    return {
        "username": os.getenv("ADMIN_USERNAME", "").strip(),
        "password_hash": os.getenv("ADMIN_PASSWORD_HASH", "").strip(),
    }


def is_admin_authenticated():
    credentials = get_admin_credentials()
    session_username = (session.get("admin_username") or "").strip()
    return bool(credentials["username"] and credentials["password_hash"] and session_username == credentials["username"])


def require_admin_request():
    credentials = get_admin_credentials()
    if not credentials["username"] or not credentials["password_hash"]:
        return jsonify({"message": "Admin protection is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD_HASH on the server."}), 500

    if not is_admin_authenticated():
        session.clear()
        return jsonify({"message": "Unauthorized admin action."}), 401

    return None


@admin_bp.route("/login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    credentials = get_admin_credentials()

    if not credentials["username"] or not credentials["password_hash"]:
        return jsonify({"message": "Admin protection is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD_HASH on the server."}), 500

    if username != credentials["username"] or not check_password_hash(credentials["password_hash"], password):
        session.clear()
        return jsonify({"message": "Invalid admin username or password."}), 401

    session.clear()
    session["admin_username"] = credentials["username"]
    session.permanent = True

    return jsonify({"message": "Admin login successful.", "username": credentials["username"]})


@admin_bp.route("/logout", methods=["POST"])
def admin_logout():
    session.clear()
    return jsonify({"message": "Admin logout successful."})


@admin_bp.route("/session", methods=["GET"])
def admin_session_status():
    credentials = get_admin_credentials()
    configured = bool(credentials["username"] and credentials["password_hash"])

    if configured and is_admin_authenticated():
        return jsonify({"authenticated": True, "username": credentials["username"]})

    session.clear()
    return jsonify({"authenticated": False, "username": None, "configured": configured})
