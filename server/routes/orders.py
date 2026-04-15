import json
import re
from datetime import datetime

import requests
from flask import Blueprint, jsonify, request

from extensions import limiter
from models.db import get_db_connection
from routes.mpesa import (
    ACCOUNT_REFERENCE,
    REQUEST_TIMEOUT,
    STK_PUSH_URL,
    TRANSACTION_DESCRIPTION,
    generate_password,
    get_access_token,
    get_config,
    missing_config,
    parse_json_response,
    validate_payment_safety,
)

orders_bp = Blueprint("orders", __name__)
payments_bp = Blueprint("payments", __name__)

PHONE_REGEX = re.compile(r"^(0\d{9}|254\d{9})$")
PAYMENT_METHODS = {"WhatsApp", "M-Pesa"}


def normalize_mpesa_phone(phone):
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 10 and digits.startswith("0"):
        return f"254{digits[1:]}"
    if len(digits) == 12 and digits.startswith("254"):
        return digits
    return digits


def parse_cart(data):
    raw_cart = data.get("cart", [])
    if not isinstance(raw_cart, list) or not raw_cart:
        return None, "Cart must contain at least one item."

    parsed_cart = []
    for item in raw_cart:
        if not isinstance(item, dict):
            return None, "Each cart item must be a valid object."

        product_id = str(item.get("id", "")).strip()
        name = str(item.get("name", "")).strip()

        try:
            price = int(item.get("price", 0))
            quantity = int(item.get("quantity", 0))
        except (TypeError, ValueError):
            return None, "Each cart item must include a valid price and quantity."

        if not product_id or not name:
            return None, "Each cart item must include an id and name."

        if price <= 0 or quantity <= 0:
            return None, "Each cart item must have a positive price and quantity."

        parsed_cart.append(
            {
                "id": product_id,
                "name": name,
                "price": price,
                "quantity": quantity,
                "size": item.get("size"),
            }
        )

    return parsed_cart, None


def parse_order_payload(data):
    customer_name = str(data.get("customerName", "")).strip()
    phone = normalize_mpesa_phone(data.get("phone"))
    payment_method = str(data.get("paymentMethod", "WhatsApp")).strip() or "WhatsApp"
    whatsapp_message = str(data.get("whatsappMessage", "")).strip()

    customer_name = customer_name or "WhatsApp Customer"

    if len(customer_name) > 120:
        return None, "Customer name is too long."

    if phone and not PHONE_REGEX.match(phone):
        return None, "Enter a valid Safaricom number like 07XXXXXXXX or 2547XXXXXXXX."

    if payment_method not in PAYMENT_METHODS:
        return None, "Choose a valid payment method."

    cart, cart_error = parse_cart(data)
    if cart_error:
        return None, cart_error

    total = sum(item["price"] * item["quantity"] for item in cart)
    if total <= 0:
        return None, "Order total must be greater than zero."

    return {
        "customer_name": customer_name,
        "phone": phone,
        "payment_method": payment_method,
        "whatsapp_message": whatsapp_message,
        "cart": cart,
        "total": total,
    }, None


@orders_bp.route("/", methods=["POST"], strict_slashes=False)
@limiter.limit("20 per minute")
def create_order():
    payload, error_message = parse_order_payload(request.get_json(silent=True) or {})
    if error_message:
        return jsonify({"message": error_message}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO orders (customer_name, phone, payment_method, total, whatsapp_message, status, items, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s)
        RETURNING *
        """,
        (
            payload["customer_name"],
            payload["phone"],
            payload["payment_method"],
            payload["total"],
            payload["whatsapp_message"],
            "pending",
            json.dumps(payload["cart"]),
            datetime.utcnow(),
        ),
    )
    order = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify(order), 201


@payments_bp.route("/mpesa", methods=["POST"])
@limiter.limit("10 per minute")
def initiate_mpesa_payment():
    data = request.get_json(silent=True) or {}
    phone = normalize_mpesa_phone(data.get("phone"))
    try:
        amount = int(data.get("amount", 0) or 0)
    except (TypeError, ValueError):
        return jsonify({"message": "Enter a valid payment amount."}), 400
    order_id = data.get("orderId")

    if not PHONE_REGEX.match(phone):
        return jsonify({"message": "Enter a valid Safaricom number like 07XXXXXXXX or 2547XXXXXXXX."}), 400

    if amount <= 0:
        return jsonify({"message": "Enter a valid payment amount."}), 400

    config = get_config()
    safety_error, safety_status = validate_payment_safety(config)
    if safety_error:
        return jsonify(safety_error), safety_status

    missing = missing_config(config)
    if missing:
        return jsonify({
            "message": "M-Pesa credentials are missing.",
            "missing": missing,
            "environment": config["env"],
        }), 500

    try:
        token, token_error = get_access_token(config)
    except requests.RequestException as exc:
        return jsonify({
            "message": "Failed to reach Safaricom OAuth endpoint.",
            "details": str(exc),
        }), 502

    if token_error:
        return jsonify({
            "message": token_error.get("error", "Failed to get M-Pesa access token."),
            "details": token_error.get("details"),
            "stage": token_error.get("stage"),
            "statusCode": token_error.get("status_code"),
        }), 502

    password, timestamp = generate_password(config["shortcode"], config["passkey"])

    payload = {
        "BusinessShortCode": config["shortcode"],
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone,
        "PartyB": config["shortcode"],
        "PhoneNumber": phone,
        "CallBackURL": config["callback_url"],
        "AccountReference": ACCOUNT_REFERENCE,
        "TransactionDesc": TRANSACTION_DESCRIPTION,
    }
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.post(
            STK_PUSH_URL,
            json=payload,
            headers=headers,
            timeout=REQUEST_TIMEOUT,
        )
    except requests.RequestException as exc:
        return jsonify({
            "message": "Failed to reach Safaricom STK push endpoint.",
            "details": str(exc),
        }), 502

    response_payload, parse_error = parse_json_response(response)
    if response_payload is None:
        return jsonify({
            "message": "Safaricom STK push response was not valid JSON.",
            "details": parse_error,
            "statusCode": response.status_code,
        }), 502

    checkout_request_id = response_payload.get("CheckoutRequestID")
    customer_message = response_payload.get("CustomerMessage") or response_payload.get("ResponseDescription") or "M-Pesa request submitted."

    if order_id and checkout_request_id:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE orders
            SET phone = %s,
                payment_method = %s,
                status = %s,
                mpesa_reference = %s,
                updated_at = %s
            WHERE id = %s
            RETURNING id
            """,
            (phone, "M-Pesa", "payment_pending", checkout_request_id, datetime.utcnow(), order_id),
        )
        conn.commit()
        cursor.close()
        conn.close()

    return jsonify(
        {
            "status": "pending" if response.ok else "failed",
            "environment": config["env"],
            "shortcode": config["shortcode"],
            "checkoutRequestId": checkout_request_id,
            "merchantRequestId": response_payload.get("MerchantRequestID"),
            "responseCode": response_payload.get("ResponseCode"),
            "message": customer_message,
            "raw": response_payload,
        }
    ), response.status_code