import hashlib
import os
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request, session
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import limiter

admin_bp = Blueprint("admin", __name__)


def get_admin_credentials():
    password_hash = os.getenv("ADMIN_PASSWORD_HASH", "").strip()
    password_hash_file = os.getenv("ADMIN_PASSWORD_HASH_FILE", "").strip()

    if password_hash_file:
        path = Path(password_hash_file)
        if path.exists():
            password_hash = path.read_text(encoding="utf-8").strip()

    return {
        "username": os.getenv("ADMIN_USERNAME", "").strip(),
        "password_hash": password_hash,
    }


def get_admin_password_fingerprint(password_hash):
    return hashlib.sha256(password_hash.encode("utf-8")).hexdigest()


def is_admin_authenticated():
    credentials = get_admin_credentials()
    session_username = (session.get("admin_username") or "").strip()
    session_fingerprint = (session.get("admin_password_fingerprint") or "").strip()
    current_fingerprint = (
        get_admin_password_fingerprint(credentials["password_hash"]) if credentials["password_hash"] else ""
    )
    return bool(
        credentials["username"]
        and credentials["password_hash"]
        and session_username == credentials["username"]
        and session_fingerprint == current_fingerprint
    )


def validate_admin_username(username):
    if not username:
        return "Admin username is required."
    if len(username) > 120:
        return "Admin username is too long."
    return None


def validate_admin_password(password):
    if len(password) < 12:
        return "Admin password must be at least 12 characters long."
    if password.lower() == password or password.upper() == password:
        return "Admin password must include both uppercase and lowercase letters."
    if not any(character.isdigit() for character in password):
        return "Admin password must include at least one number."
    if password.isalnum():
        return "Admin password must include at least one special character."
    return None


def persist_admin_password_hash(password_hash):
    password_hash_file = os.getenv("ADMIN_PASSWORD_HASH_FILE", "").strip()
    if not password_hash_file:
        return False

    path = Path(password_hash_file)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(password_hash, encoding="utf-8")
    return True


def issue_admin_session(credentials):
    session.clear()
    session["admin_username"] = credentials["username"]
    session["admin_password_fingerprint"] = get_admin_password_fingerprint(credentials["password_hash"])
    session.permanent = True


def get_admin_reset_serializer():
    secret = os.getenv("ADMIN_PASSWORD_RESET_SECRET", "").strip() or current_app.secret_key
    return URLSafeTimedSerializer(secret_key=secret, salt="admin-password-reset")


def build_admin_reset_token(username):
    return get_admin_reset_serializer().dumps({"username": username})


def verify_admin_reset_token(token, max_age_seconds):
    try:
        payload = get_admin_reset_serializer().loads(token, max_age=max_age_seconds)
    except SignatureExpired:
        return None, "The reset token has expired."
    except BadSignature:
        return None, "The reset token is invalid."

    return payload, None


def require_admin_request():
    credentials = get_admin_credentials()
    if not credentials["username"] or not credentials["password_hash"]:
        return jsonify({"message": "Admin protection is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD_HASH on the server."}), 500

    if not is_admin_authenticated():
        session.clear()
        return jsonify({"message": "Unauthorized admin action."}), 401

    return None


@admin_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute; 20 per hour")
def admin_login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    credentials = get_admin_credentials()

    if not credentials["username"] or not credentials["password_hash"]:
        return jsonify({"message": "Admin protection is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD_HASH on the server."}), 500

    username_error = validate_admin_username(username)
    if username_error:
        return jsonify({"message": username_error}), 400

    if not password:
        return jsonify({"message": "Admin password is required."}), 400

    if username != credentials["username"] or not check_password_hash(credentials["password_hash"], password):
        session.clear()
        return jsonify({"message": "Invalid admin username or password."}), 401

    issue_admin_session(credentials)
    current_app.logger.info("Admin login successful for %s", credentials["username"])

    return jsonify({"message": "Admin login successful.", "username": credentials["username"]})


@admin_bp.route("/logout", methods=["POST"])
def admin_logout():
    username = (session.get("admin_username") or "").strip()
    session.clear()
    if username:
        current_app.logger.info("Admin logout successful for %s", username)
    return jsonify({"message": "Admin logout successful."})


@admin_bp.route("/session", methods=["GET"])
def admin_session_status():
    credentials = get_admin_credentials()
    configured = bool(credentials["username"] and credentials["password_hash"])

    if configured and is_admin_authenticated():
        return jsonify({"authenticated": True, "username": credentials["username"]})

    session.clear()
    return jsonify({"authenticated": False, "username": None, "configured": configured})


@admin_bp.route("/password/change", methods=["POST"])
@limiter.limit("5 per hour")
def admin_change_password():
    auth_error = require_admin_request()
    if auth_error:
        return auth_error

    if not os.getenv("ADMIN_PASSWORD_HASH_FILE", "").strip():
        return jsonify({
            "message": "Admin password changes require ADMIN_PASSWORD_HASH_FILE so the new hash can be stored safely.",
        }), 501

    data = request.get_json(silent=True) or {}
    current_password = (data.get("currentPassword") or "").strip()
    new_password = (data.get("newPassword") or "").strip()
    credentials = get_admin_credentials()

    if not current_password:
        return jsonify({"message": "Current password is required."}), 400

    password_error = validate_admin_password(new_password)
    if password_error:
        return jsonify({"message": password_error}), 400

    if not check_password_hash(credentials["password_hash"], current_password):
        return jsonify({"message": "Current admin password is incorrect."}), 401

    new_password_hash = generate_password_hash(new_password)
    persist_admin_password_hash(new_password_hash)
    updated_credentials = {**credentials, "password_hash": new_password_hash}
    issue_admin_session(updated_credentials)
    current_app.logger.warning("Admin password changed for %s", credentials["username"])

    return jsonify({"message": "Admin password updated successfully."})


@admin_bp.route("/password-reset/request", methods=["POST"])
@limiter.limit("3 per hour")
def admin_password_reset_request():
    credentials = get_admin_credentials()
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    response = {
        "message": "If that admin account exists and reset is enabled, a reset token has been generated.",
        "resetEnabled": False,
    }

    if not credentials["username"] or not credentials["password_hash"]:
        return jsonify(response), 200

    if username != credentials["username"]:
        current_app.logger.warning("Admin password reset requested for unknown username.")
        return jsonify(response), 200

    if not os.getenv("ADMIN_PASSWORD_HASH_FILE", "").strip():
        current_app.logger.warning("Admin password reset requested but ADMIN_PASSWORD_HASH_FILE is not configured.")
        return jsonify(response), 200

    token_ttl_minutes = max(int(os.getenv("ADMIN_PASSWORD_RESET_TTL_MINUTES", "15") or 15), 1)
    reset_token = build_admin_reset_token(credentials["username"])
    allow_token_exposure = current_app.debug or os.getenv("ADMIN_PASSWORD_RESET_LOG_TOKEN", "false").strip().lower() == "true"

    if allow_token_exposure:
        current_app.logger.warning(
            "Admin password reset token issued for %s. Token valid for %s minutes. Token=%s",
            credentials["username"],
            token_ttl_minutes,
            reset_token,
        )
    else:
        current_app.logger.warning(
            "Admin password reset requested for %s but token delivery is not configured. Enable ADMIN_PASSWORD_RESET_LOG_TOKEN only for controlled recovery flows.",
            credentials["username"],
        )

    response["resetEnabled"] = True
    if current_app.debug:
        response["resetToken"] = reset_token
        response["expiresInMinutes"] = token_ttl_minutes

    return jsonify(response), 200


@admin_bp.route("/password-reset/confirm", methods=["POST"])
@limiter.limit("3 per hour")
def admin_password_reset_confirm():
    credentials = get_admin_credentials()
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    token = (data.get("token") or "").strip()
    new_password = (data.get("newPassword") or "").strip()

    if not credentials["username"] or not credentials["password_hash"]:
        return jsonify({"message": "Admin protection is not configured."}), 500

    if not os.getenv("ADMIN_PASSWORD_HASH_FILE", "").strip():
        return jsonify({
            "message": "Admin password resets require ADMIN_PASSWORD_HASH_FILE so the new hash can be stored safely.",
        }), 501

    if username != credentials["username"]:
        return jsonify({"message": "Invalid reset token or username."}), 401

    if not token:
        return jsonify({"message": "Reset token is required."}), 400

    password_error = validate_admin_password(new_password)
    if password_error:
        return jsonify({"message": password_error}), 400

    token_ttl_minutes = max(int(os.getenv("ADMIN_PASSWORD_RESET_TTL_MINUTES", "15") or 15), 1)
    payload, token_error = verify_admin_reset_token(token, token_ttl_minutes * 60)
    if token_error or not payload or payload.get("username") != credentials["username"]:
        return jsonify({"message": token_error or "Invalid reset token or username."}), 401

    new_password_hash = generate_password_hash(new_password)
    persist_admin_password_hash(new_password_hash)
    session.clear()
    current_app.logger.warning("Admin password reset completed for %s", credentials["username"])

    return jsonify({"message": "Admin password reset successfully. Sign in with the new password."})
