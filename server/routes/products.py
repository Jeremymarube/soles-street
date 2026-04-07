import json
import re
from datetime import datetime

from flask import Blueprint, jsonify, request

from models.db import get_db_connection
from routes.admin import require_admin_request

products_bp = Blueprint("products", __name__)
PRODUCT_ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def normalize_product(row):
    row["featured"] = bool(row.get("featured"))
    row["in_stock"] = bool(row.get("in_stock"))
    row["sizes"] = row.get("sizes") or []
    return row


def parse_product_payload(data):
    name = str(data.get("name", "")).strip()
    product_id = str(data.get("id", "")).strip()
    image = str(data.get("image", "")).strip()
    brand = str(data.get("brand", "")).strip()
    category = str(data.get("category", "")).strip()
    badge = str(data.get("badge", "")).strip() or None
    description = str(data.get("description", "")).strip()

    if not name:
        return None, "Product name is required."
    if not product_id:
        return None, "Product id is required."
    if not PRODUCT_ID_PATTERN.match(product_id):
        return None, "Product id must use lowercase letters, numbers, and hyphens only."
    if not image:
        return None, "Product image is required."
    if not brand:
        return None, "Brand is required."
    if not category:
        return None, "Category is required."

    try:
        price = int(data.get("price", 0))
    except (TypeError, ValueError):
        return None, "Price must be a valid whole number."

    if price <= 0:
        return None, "Price must be greater than zero."

    raw_sizes = data.get("sizes", [])
    if not isinstance(raw_sizes, list):
        return None, "Sizes must be a list of numbers."

    sizes = []
    for size in raw_sizes:
        try:
            parsed = int(size)
        except (TypeError, ValueError):
            return None, "Each shoe size must be a valid number."
        sizes.append(parsed)

    if not sizes:
        return None, "At least one shoe size is required."

    return {
        "id": product_id,
        "name": name,
        "price": price,
        "image": image,
        "brand": brand,
        "category": category,
        "badge": badge,
        "featured": bool(data.get("featured", False)),
        "description": description,
        "sizes": sizes,
        "in_stock": bool(data.get("in_stock", True)),
    }, None


@products_bp.route("/", methods=["GET"])
def get_products():
    search = request.args.get("search", "").strip().lower()
    category = request.args.get("category", "All")
    brand = request.args.get("brand", "All")
    featured = request.args.get("featured")

    query = "SELECT * FROM products WHERE 1=1"
    params = []

    if category and category != "All":
        query += " AND category = %s"
        params.append(category)

    if brand and brand != "All":
        query += " AND brand = %s"
        params.append(brand)

    if featured in {"true", "false"}:
        query += " AND featured = %s"
        params.append(featured == "true")

    if search:
        query += " AND (LOWER(name) LIKE %s OR LOWER(brand) LIKE %s OR LOWER(category) LIKE %s)"
        like_value = f"%{search}%"
        params.extend([like_value, like_value, like_value])

    query += " ORDER BY COALESCE(updated_at, CURRENT_TIMESTAMP) DESC, name ASC"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    products = [normalize_product(product) for product in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(products)


@products_bp.route("/<product_id>", methods=["GET"])
def get_product(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    cursor.close()
    conn.close()

    if not product:
        return jsonify({"message": "Product not found"}), 404

    return jsonify(normalize_product(product))


@products_bp.route("/", methods=["POST"])
def create_product():
    auth_error = require_admin_request()
    if auth_error:
        return auth_error

    payload, error_message = parse_product_payload(request.get_json() or {})
    if error_message:
        return jsonify({"message": error_message}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO products (id, name, price, image, brand, category, badge, featured, description, sizes, in_stock)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s)
        RETURNING *
        """,
        (
            payload["id"],
            payload["name"],
            payload["price"],
            payload["image"],
            payload["brand"],
            payload["category"],
            payload["badge"],
            payload["featured"],
            payload["description"],
            json.dumps(payload["sizes"]),
            payload["in_stock"],
        ),
    )
    product = normalize_product(cursor.fetchone())
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify(product), 201


@products_bp.route("/<product_id>", methods=["PUT"])
def update_product(product_id):
    auth_error = require_admin_request()
    if auth_error:
        return auth_error

    payload, error_message = parse_product_payload({**(request.get_json() or {}), "id": product_id})
    if error_message:
        return jsonify({"message": error_message}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE products
        SET name = %s,
            price = %s,
            image = %s,
            brand = %s,
            category = %s,
            badge = %s,
            featured = %s,
            description = %s,
            sizes = %s::jsonb,
            in_stock = %s,
            updated_at = %s
        WHERE id = %s
        RETURNING *
        """,
        (
            payload["name"],
            payload["price"],
            payload["image"],
            payload["brand"],
            payload["category"],
            payload["badge"],
            payload["featured"],
            payload["description"],
            json.dumps(payload["sizes"]),
            payload["in_stock"],
            datetime.utcnow(),
            product_id,
        ),
    )
    product = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()

    if not product:
        return jsonify({"message": "Product not found"}), 404

    return jsonify(normalize_product(product))


@products_bp.route("/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    auth_error = require_admin_request()
    if auth_error:
        return auth_error

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = %s RETURNING id", (product_id,))
    deleted = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()

    if not deleted:
        return jsonify({"message": "Product not found"}), 404

    return jsonify({"message": "Product deleted", "id": product_id})
