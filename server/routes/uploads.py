import os
import cloudinary
import cloudinary.uploader
from flask import Blueprint, jsonify, request
from extensions import limiter
from routes.admin import require_admin_request

uploads_bp = Blueprint("uploads", __name__)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@uploads_bp.route("/", methods=["POST"], strict_slashes=False)
@limiter.limit("10 per minute")
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
    if not (file.mimetype or "").startswith("image/"):
        return jsonify({"message": "Uploaded file must be an image."}), 400
    result = cloudinary.uploader.upload(file, folder="soles-street", resource_type="image")
    return jsonify({"imageUrl": result["secure_url"]}), 201
