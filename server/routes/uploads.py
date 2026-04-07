import os
from uuid import uuid4

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from routes.admin import require_admin_request

uploads_bp = Blueprint("uploads", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@uploads_bp.route("/", methods=["POST"])
def upload_image():
    auth_error = require_admin_request()
    if auth_error:
        return auth_error

    if "image" not in request.files:
        return jsonify({"message": "No image file selected."}), 400

    file = request.files["image"]

    if not file or file.filename == "":
        return jsonify({"message": "No image file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({"message": "Only PNG, JPG, JPEG, WEBP, and GIF files are allowed."}), 400

    filename = secure_filename(file.filename)
    extension = filename.rsplit(".", 1)[1].lower()
    stored_name = f"{uuid4().hex}.{extension}"
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file.save(os.path.join(upload_dir, stored_name))

    return jsonify({"imageUrl": f"http://127.0.0.1:5000/static/uploads/{stored_name}"}), 201
