import base64
import os
from datetime import datetime

import requests
from flask import Blueprint, jsonify, request

mpesa_bp = Blueprint('mpesa', __name__)

MPESA_ENV = os.getenv('MPESA_ENV', 'sandbox').strip().lower()
BASE_URL = 'https://api.safaricom.co.ke' if MPESA_ENV == 'production' else 'https://sandbox.safaricom.co.ke'
OAUTH_URL = f'{BASE_URL}/oauth/v1/generate?grant_type=client_credentials'
STK_PUSH_URL = f'{BASE_URL}/mpesa/stkpush/v1/processrequest'
REQUEST_TIMEOUT = 30
ACCOUNT_REFERENCE = 'SOLESTREET'
TRANSACTION_DESCRIPTION = 'Sneaker Order'


def get_config():
    return {
        'env': MPESA_ENV,
        'consumer_key': os.getenv('MPESA_CONSUMER_KEY', '').strip(),
        'consumer_secret': os.getenv('MPESA_CONSUMER_SECRET', '').strip(),
        'shortcode': os.getenv('MPESA_SHORTCODE', '').strip(),
        'passkey': os.getenv('MPESA_PASSKEY', '').strip(),
        'callback_url': os.getenv('MPESA_CALLBACK_URL', '').strip(),
        'stk_enabled': os.getenv('MPESA_STK_ENABLED', 'false').strip().lower() == 'true',
        'live_confirmed': os.getenv('MPESA_CONFIRM_LIVE_RECEIVER', 'false').strip().lower() == 'true',
    }


def missing_config(config):
    required = {
        'consumer_key': 'MPESA_CONSUMER_KEY',
        'consumer_secret': 'MPESA_CONSUMER_SECRET',
        'shortcode': 'MPESA_SHORTCODE',
        'passkey': 'MPESA_PASSKEY',
        'callback_url': 'MPESA_CALLBACK_URL',
    }
    return [env_name for key, env_name in required.items() if not config[key]]


def validate_payment_safety(config):
    if not config['stk_enabled']:
        return {
            'message': 'M-Pesa STK push is disabled on this server. Set MPESA_STK_ENABLED=true only when you are ready to charge phones.',
            'environment': config['env'],
            'shortcode': config['shortcode'] or None,
        }, 403

    if config['env'] == 'production' and not config['live_confirmed']:
        return {
            'message': 'Live M-Pesa payments are blocked until you confirm the receiving shortcode. Set MPESA_CONFIRM_LIVE_RECEIVER=true only after verifying the destination account.',
            'environment': config['env'],
            'shortcode': config['shortcode'] or None,
        }, 403

    return None, None


def parse_json_response(response):
    try:
        return response.json(), None
    except ValueError:
        body = (response.text or '').strip()
        return None, body[:500] or 'Empty response body'


def get_access_token(config):
    response = requests.get(
        OAUTH_URL,
        auth=(config['consumer_key'], config['consumer_secret']),
        timeout=REQUEST_TIMEOUT,
    )

    payload, parse_error = parse_json_response(response)
    if not response.ok:
        return None, {
            'stage': 'oauth',
            'environment': config['env'],
            'status_code': response.status_code,
            'error': 'Safaricom token request failed',
            'details': payload if payload is not None else parse_error,
        }

    if payload is None:
        return None, {
            'stage': 'oauth',
            'environment': config['env'],
            'status_code': response.status_code,
            'error': 'Safaricom token response was not valid JSON',
            'details': parse_error,
        }

    access_token = payload.get('access_token')
    if not access_token:
        return None, {
            'stage': 'oauth',
            'environment': config['env'],
            'status_code': response.status_code,
            'error': 'Safaricom token response did not include access_token',
            'details': payload,
        }

    return access_token, None


def generate_password(shortcode, passkey):
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    raw = f'{shortcode}{passkey}{timestamp}'
    encoded = base64.b64encode(raw.encode()).decode()
    return encoded, timestamp


@mpesa_bp.route('/status', methods=['GET'])
def mpesa_status():
    config = get_config()
    return jsonify({
        'environment': config['env'],
        'shortcode': config['shortcode'] or None,
        'stkEnabled': config['stk_enabled'],
        'liveConfirmed': config['live_confirmed'],
        'accountReference': ACCOUNT_REFERENCE,
        'transactionDescription': TRANSACTION_DESCRIPTION,
    })


@mpesa_bp.route('/stk-push', methods=['POST'])
def stk_push():
    data = request.get_json(silent=True) or {}
    phone = str(data.get('phone', '')).strip()
    amount = data.get('amount')

    if not phone or not amount:
        return jsonify({'error': 'phone and amount are required'}), 400

    config = get_config()
    safety_error, safety_status = validate_payment_safety(config)
    if safety_error:
        return jsonify(safety_error), safety_status

    missing = missing_config(config)
    if missing:
        return jsonify({
            'error': 'M-Pesa credentials are missing',
            'missing': missing,
            'environment': config['env'],
        }), 500

    try:
        token, token_error = get_access_token(config)
    except requests.RequestException as exc:
        return jsonify({
            'error': 'Failed to reach Safaricom OAuth endpoint',
            'details': str(exc),
            'environment': config['env'],
        }), 502

    if token_error:
        return jsonify(token_error), 502

    password, timestamp = generate_password(config['shortcode'], config['passkey'])

    payload = {
        'BusinessShortCode': config['shortcode'],
        'Password': password,
        'Timestamp': timestamp,
        'TransactionType': 'CustomerPayBillOnline',
        'Amount': amount,
        'PartyA': phone,
        'PartyB': config['shortcode'],
        'PhoneNumber': phone,
        'CallBackURL': config['callback_url'],
        'AccountReference': ACCOUNT_REFERENCE,
        'TransactionDesc': TRANSACTION_DESCRIPTION,
    }

    headers = {'Authorization': f'Bearer {token}'}

    try:
        response = requests.post(
            STK_PUSH_URL,
            json=payload,
            headers=headers,
            timeout=REQUEST_TIMEOUT,
        )
    except requests.RequestException as exc:
        return jsonify({
            'error': 'Failed to reach Safaricom STK push endpoint',
            'details': str(exc),
            'environment': config['env'],
        }), 502

    response_payload, parse_error = parse_json_response(response)
    if response_payload is None:
        return jsonify({
            'stage': 'stk_push',
            'environment': config['env'],
            'status_code': response.status_code,
            'error': 'Safaricom STK push response was not valid JSON',
            'details': parse_error,
        }), 502

    return jsonify(response_payload), response.status_code


@mpesa_bp.route('/callback', methods=['POST'])
def callback():
    data = request.get_json(silent=True) or {}
    print('=' * 50)
    print('M-Pesa callback received at:', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    print('M-Pesa environment:', MPESA_ENV)
    print('Callback data:', data)
    print('=' * 50)

    try:
        body = data.get('Body', {})
        stk_callback = body.get('stkCallback', {})

        result_code = stk_callback.get('ResultCode')
        result_desc = stk_callback.get('ResultDesc')
        checkout_request_id = stk_callback.get('CheckoutRequestID')
        merchant_request_id = stk_callback.get('MerchantRequestID')

        print(f"ResultCode: {result_code}")
        print(f"ResultDesc: {result_desc}")
        print(f"CheckoutRequestID: {checkout_request_id}")
        print(f"MerchantRequestID: {merchant_request_id}")

        if result_code == '0':
            callback_metadata = stk_callback.get('CallbackMetadata', {})
            items = callback_metadata.get('Item', [])

            metadata = {}
            for item in items:
                metadata[item.get('Name')] = item.get('Value')

            amount = metadata.get('Amount')
            mpesa_receipt = metadata.get('MpesaReceiptNumber')
            transaction_date = metadata.get('TransactionDate')
            phone_number = metadata.get('PhoneNumber')

            print('\n' + '=' * 20)
            print('SUCCESSFUL PAYMENT!')
            print(f'   Receipt Number: {mpesa_receipt}')
            print(f'   Amount: KES {amount}')
            print(f'   Phone Number: {phone_number}')
            print(f'   Transaction Date: {transaction_date}')
            print(f'   Checkout Request ID: {checkout_request_id}')
            print('=' * 20 + '\n')
        else:
            print('\n' + '!' * 20)
            print('PAYMENT FAILED!')
            print(f'   Result Code: {result_code}')
            print(f'   Result Description: {result_desc}')
            print(f'   Checkout Request ID: {checkout_request_id}')
            print('!' * 20 + '\n')
    except Exception as e:
        print(f'\nERROR processing callback: {str(e)}')
        import traceback
        traceback.print_exc()

    return jsonify({'ResultCode': 0, 'ResultDesc': 'Success'})
