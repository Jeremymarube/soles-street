import json
import re
from datetime import datetime

import requests
from flask import Blueprint, jsonify, request

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


def normalize_mpesa_phone(phone):
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 10 and digits.startswith("0"):
        return f"254{digits[1:]}"
    if len(digits) == 12 and digits.startswith("254"):
        return digits
    return digits


@orders_bp.route("/", methods=["POST"])
def create_order():
    data = request.get_json() or {}
    cart = data.get("cart", [])
    total = sum((item.get("price", 0) * item.get("quantity", 1)) for item in cart)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO orders (customer_name, phone, payment_method, total, whatsapp_message, status, items, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s)
        RETURNING *
        """,
        (
            data.get("customerName"),
            data.get("phone"),
            data.get("paymentMethod", "WhatsApp"),
            total,
            data.get("whatsappMessage"),
            "pending",
            json.dumps(cart),
            datetime.utcnow(),
        ),
    )
    order = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify(order), 201


@payments_bp.route("/mpesa", methods=["POST"])
def initiate_mpesa_payment():
    data = request.get_json() or {}
    phone = normalize_mpesa_phone(data.get("phone"))
    amount = int(data.get("amount", 0) or 0)
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
