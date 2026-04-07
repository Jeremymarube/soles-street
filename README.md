# SoleStreet

SoleStreet is a mobile-first sneaker store built with Next.js, Flask, and PostgreSQL. Customers can browse shoes, search by name, shop by category, add items to cart, and place orders through WhatsApp. The store owner gets a protected admin dashboard for managing products, uploads, sizes, and featured homepage picks.

## Tech Stack

- Frontend: Next.js 16, React 19, Tailwind CSS
- Backend: Flask, Flask-CORS
- Database: PostgreSQL
- Auth: single-owner admin login with hashed password and Flask session cookies
- Ordering: WhatsApp prefilled checkout flow
- Payments: M-Pesa STK flow with safety locks

## Features

- Mobile-first storefront
- Categories for Men, Women, Kids, and Both
- Search and filtering from the navbar and shop page
- Cart and checkout flow
- Short WhatsApp order messages
- Protected admin dashboard
- Product create, edit, delete, image upload, sizes, and featured toggle
- Homepage featured products section
- Guarded M-Pesa backend integration

## Project Structure

```text
soles-street/
  client/   Next.js frontend
  server/   Flask API, auth, uploads, payments, database logic
```

## Requirements

- Node.js 18+
- npm
- Python 3.8+
- PostgreSQL 14+

## Local Development

### 1. Create the PostgreSQL database

Create a database and user that match the backend defaults, or override them with environment variables:

```sql
CREATE DATABASE soles_street_db;
CREATE USER soles_user WITH PASSWORD 'soles123';
GRANT ALL PRIVILEGES ON DATABASE soles_street_db TO soles_user;
```

If tables were created by another owner earlier, transfer ownership so startup migrations can run:

```sql
ALTER DATABASE soles_street_db OWNER TO soles_user;
ALTER SCHEMA public OWNER TO soles_user;
```

### 2. Start the Flask backend

Install dependencies:

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Set backend environment variables before running Flask:

```bash
export DB_HOST=127.0.0.1
export DB_NAME=soles_street_db
export DB_USER=soles_user
export DB_PASSWORD=soles123

export FRONTEND_ORIGIN=http://localhost:3000
export FLASK_SECRET_KEY=replace-this-with-a-long-random-secret

export ADMIN_USERNAME='Steve Aboko'
export ADMIN_PASSWORD_HASH='your-generated-password-hash'
```

Generate an admin password hash:

```bash
python - <<'PY'
from werkzeug.security import generate_password_hash
print(generate_password_hash('soles_street@123'))
PY
```

Start the backend:

```bash
python app.py
```

Backend URL:

```text
http://localhost:5000
```

### 3. Start the Next.js frontend

Install frontend dependencies:

```bash
cd client
npm install
```

Create `client/.env` or `client/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=/backend-api
BACKEND_API_URL=http://localhost:5000/api

NEXT_PUBLIC_WHATSAPP_NUMBER=2547XXXXXXXX
NEXT_PUBLIC_WHATSAPP_DISPLAY=+254 7XX XXX XXX

NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/yourhandle
NEXT_PUBLIC_TIKTOK_URL=https://tiktok.com/@yourhandle
```

Start the frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

## How the App Works

### Customer Flow

1. Open the homepage and browse featured shoes.
2. Visit `/shop` to search, filter, and view products.
3. Open a product page, choose a size, and add it to cart.
4. Review the cart at `/cart`.
5. Go to `/checkout`.
6. Place the order through WhatsApp.

WhatsApp message examples:

```text
Hi, I want to order Puma. Total: Ksh 5.
```

```text
Hi, I want to order:
Puma x1
Nike x2
Total: Ksh 15.
```

### Admin Flow

1. Open `/admin`.
2. If not signed in, you are redirected to `/admin/login`.
3. Sign in with the configured owner username and password.
4. From the admin dashboard you can add, edit, feature, upload, and remove products.

Only the configured admin username can stay authenticated.

## Featured Products

The homepage section:

- `Featured`
- `Top picks right now`

only shows products with `featured = true`. You can control this from the admin add/edit form using the `Featured` checkbox.

## Admin Security

Admin access is protected with:

- one owner username
- one hashed password
- Flask server sessions
- protected product write routes
- protected image upload routes

The frontend sends requests with credentials included, and the Next.js app proxies backend API calls through `/backend-api` so admin session cookies work correctly on `localhost`.

## M-Pesa Safety

M-Pesa is intentionally locked down so the app does not accidentally send live payment prompts.

Safe default:

```bash
export MPESA_ENV=sandbox
export MPESA_STK_ENABLED=false
```

To deliberately allow STK push:

```bash
export MPESA_STK_ENABLED=true
```

For live production payments, you must explicitly confirm that the receiving shortcode is correct:

```bash
export MPESA_ENV=production
export MPESA_CONFIRM_LIVE_RECEIVER=true
export MPESA_STK_ENABLED=true
```

Recommended workflow:

- keep M-Pesa disabled while building the store
- use WhatsApp ordering for live testing
- only enable STK after confirming the real shortcode, passkey, credentials, and callback URL

### M-Pesa Environment Variables

```bash
export MPESA_ENV=sandbox
export MPESA_STK_ENABLED=false
export MPESA_CONFIRM_LIVE_RECEIVER=false
export MPESA_CONSUMER_KEY=your-key
export MPESA_CONSUMER_SECRET=your-secret
export MPESA_SHORTCODE=your-shortcode
export MPESA_PASSKEY=your-passkey
export MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
```

## Database Notes

The backend uses PostgreSQL and runs startup schema checks for `products` and `orders`.

On startup it will try to:

- create missing tables
- migrate older product schemas where possible
- ensure `products.id` is text-based for slug ids
- ensure large totals use `BIGINT`
- add useful catalog indexes as the store grows

This means the catalog can grow far beyond a few demo products, but if you eventually have a very large inventory, pagination is the next logical improvement for `/shop` and the admin product list.

## Common Routes

### Frontend

- `/`
- `/shop`
- `/shop/[id]`
- `/cart`
- `/checkout`
- `/contact`
- `/admin`
- `/admin/login`
- `/admin/products`
- `/admin/products/add`

### Backend

- `GET /api/products/`
- `POST /api/products/`
- `PUT /api/products/<id>`
- `DELETE /api/products/<id>`
- `POST /api/orders/`
- `POST /api/payments/mpesa`
- `GET /api/mpesa/status`
- `POST /api/mpesa/stk-push`
- `POST /api/mpesa/callback`
- `POST /api/uploads/`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/session`

## Troubleshooting

- Use `http://localhost:3000`, not `127.0.0.1:3000`, for the frontend.
- Keep the backend on `http://localhost:5000`.
- Restart Next.js after changing `client/.env`, `.env.local`, or `next.config.mjs`.
- Restart Flask after changing backend environment variables or schema logic.
- If admin login loops back to `/admin/login`, check that the frontend is using `/backend-api` and that both apps are running on `localhost`.
- If product creation fails after an old database import, check table ownership so the backend can run its startup schema fixes.

## Dependencies

Backend packages are listed in `server/requirements.txt`, including:

- Flask
- Flask-Cors
- psycopg2-binary
- Werkzeug

## Status

Current app status:

- storefront is functional
- admin catalog management is functional
- featured products are functional
- WhatsApp ordering is functional
- owner login is protected
- M-Pesa exists but is intentionally guarded for safety

## License

Private project.
