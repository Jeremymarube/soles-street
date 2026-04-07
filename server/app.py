import os
from datetime import timedelta

from flask import Flask
from flask_cors import CORS
from models.db import get_db_connection
from routes.admin import admin_bp
from routes.orders import orders_bp, payments_bp
from routes.products import products_bp
from routes.uploads import uploads_bp
from routes.mpesa import mpesa_bp

app = Flask(__name__, static_folder="static", static_url_path="/static")
app.secret_key = os.getenv("FLASK_SECRET_KEY", "change-me-in-production")
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=12)

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": [frontend_origin, "http://127.0.0.1:3000", "http://localhost:3000"]}})


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
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders (phone)")


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


if __name__ == "__main__":
    app.run(debug=True, port=5000)
