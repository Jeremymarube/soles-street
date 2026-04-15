import logging
import os
from pathlib import Path
import time
import uuid
from datetime import timedelta

from flask import Flask, g, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from werkzeug.middleware.proxy_fix import ProxyFix

from extensions import limiter
from models.db import get_db_connection
from routes.admin import admin_bp
from routes.mpesa import mpesa_bp
from routes.orders import orders_bp, payments_bp
from routes.products import products_bp
from routes.uploads import uploads_bp

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

app_env = os.getenv("APP_ENV", os.getenv("FLASK_ENV", "development")).strip().lower() or "development"
app_debug = os.getenv("FLASK_DEBUG", "false").strip().lower() == "true"
app.secret_key = os.getenv("FLASK_SECRET_KEY", "").strip()

if not app.secret_key:
    raise RuntimeError("FLASK_SECRET_KEY must be set.")

if app_env == "production" and app.secret_key == "change-me-in-production":
    raise RuntimeError("FLASK_SECRET_KEY cannot use a default value in production.")

app.config["ENV"] = app_env
app.config["DEBUG"] = app_debug
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = app_env == "production"
app.config["SESSION_COOKIE_NAME"] = os.getenv("SESSION_COOKIE_NAME", "solestreet_session")
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=12)
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024

log_level_name = os.getenv("LOG_LEVEL", "INFO").strip().upper() or "INFO"
log_level = getattr(logging, log_level_name, logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
app.logger.handlers.clear()
app.logger.addHandler(handler)
app.logger.setLevel(log_level)

limiter.init_app(app)

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").strip()
cors_allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS", "").strip()
allowed_origins = [
    origin.strip()
    for origin in (
        cors_allowed_origins.split(",")
        if cors_allowed_origins
        else [frontend_origin, "http://127.0.0.1:3000", "http://localhost:3000"]
    )
    if origin.strip()
]
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": allowed_origins}})

if app_env == "production" and limiter.storage_uri.startswith("memory://"):
    app.logger.warning(
        "Rate limiting is using in-memory storage. Configure RATE_LIMIT_STORAGE_URI for multi-instance production deployments."
    )


def ensure_products_schema(cursor):
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price BIGINT NOT NULL,
            image TEXT NOT NULL,
            brand TEXT NOT NULL,
            category TEXT NOT NULL,
            badge TEXT,
            featured BOOLEAN DEFAULT FALSE,
            description TEXT DEFAULT '',
            sizes JSONB DEFAULT '[]'::jsonb,
            in_stock BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    cursor.execute(
        "SELECT data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'id'"
    )
    id_column = cursor.fetchone()
    if id_column and id_column.get("data_type") != "text":
        cursor.execute("ALTER TABLE products ALTER COLUMN id TYPE TEXT USING id::text")

    cursor.execute(
        "SELECT data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price'"
    )
    price_column = cursor.fetchone()
    if price_column and price_column.get("data_type") != "bigint":
        cursor.execute("ALTER TABLE products ALTER COLUMN price TYPE BIGINT USING price::bigint")

    cursor.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT NOT NULL DEFAULT 'Nike'")
    cursor.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Men'")
    cursor.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS badge TEXT")
    cursor.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE")
    cursor.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''")
    cursor.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[]'::jsonb")
    cursor.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT TRUE")
    cursor.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    cursor.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_products_featured ON products (featured)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_products_category ON products (category)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products (updated_at DESC)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_products_name ON products (name)")


def ensure_orders_schema(cursor):
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            customer_name TEXT,
            phone TEXT,
            payment_method TEXT,
            total BIGINT NOT NULL DEFAULT 0,
            whatsapp_message TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            mpesa_reference TEXT,
            items JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    cursor.execute(
        "SELECT data_type FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total'"
    )
    total_column = cursor.fetchone()
    if total_column and total_column.get("data_type") != "bigint":
        cursor.execute("ALTER TABLE orders ALTER COLUMN total TYPE BIGINT USING total::bigint")

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders (updated_at DESC)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders (phone)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_mpesa_reference ON orders (mpesa_reference)")


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    ensure_products_schema(cursor)
    ensure_orders_schema(cursor)
    conn.commit()
    cursor.close()
    conn.close()


init_db()

app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(products_bp, url_prefix="/api/products")
app.register_blueprint(orders_bp, url_prefix="/api/orders")
app.register_blueprint(payments_bp, url_prefix="/api/payments")
app.register_blueprint(uploads_bp, url_prefix="/api/uploads")
app.register_blueprint(mpesa_bp, url_prefix="/api/mpesa")


@app.route("/")
def home():
    return "SoleStreet Flask API with PostgreSQL is running"


@app.route("/healthz")
def healthz():
    return jsonify({"status": "ok", "environment": app_env}), 200


@app.before_request
def before_request_logging():
    g.request_started_at = time.perf_counter()
    g.request_id = request.headers.get("X-Request-ID", "").strip() or uuid.uuid4().hex


@app.after_request
def after_request_logging(response):
    duration_ms = round((time.perf_counter() - getattr(g, "request_started_at", time.perf_counter())) * 1000, 2)
    response.headers["X-Request-ID"] = getattr(g, "request_id", "")
    app.logger.info(
        "request_id=%s method=%s path=%s status=%s duration_ms=%s remote_addr=%s",
        getattr(g, "request_id", "-"),
        request.method,
        request.path,
        response.status_code,
        duration_ms,
        request.headers.get("X-Forwarded-For", request.remote_addr),
    )
    return response


@app.errorhandler(HTTPException)
def handle_http_exception(error):
    return (
        jsonify(
            {
                "message": error.description,
                "status": error.code,
                "requestId": getattr(g, "request_id", None),
            }
        ),
        error.code,
    )


@app.errorhandler(Exception)
def handle_unexpected_exception(error):
    app.logger.exception(
        "Unhandled server error request_id=%s method=%s path=%s",
        getattr(g, "request_id", "-"),
        request.method,
        request.path,
    )
    return (
        jsonify(
            {
                "message": "Internal server error.",
                "requestId": getattr(g, "request_id", None),
            }
        ),
        500,
    )


if __name__ == "__main__":
    app.run(debug=app_debug, port=int(os.getenv("PORT", "5000")))

