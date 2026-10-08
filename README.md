# Shopverse — E-commerce Demo

A full-stack e-commerce storefront built on the `dataset/Combined_dataset.csv` catalog (1,000 products across 97 categories, scraped from Myntra).

- **Backend:** FastAPI + SQLAlchemy + SQLite, JWT auth
- **Frontend:** React (Vite) + React Router + Axios

## Features

- Product catalog seeded automatically from `dataset/Combined_dataset.csv`
- Home page with categories and top-rated picks
- Category browsing, search, price/rating filters, sorting, pagination
- Product detail page (gallery, sizes, specs, rating breakdown, similar products)
- Auth (register/login) with JWT
- Server-side cart tied to the logged-in user
- Checkout flow that creates a real order, order history, and order detail

## Project layout

```
backend/            FastAPI app
  app/
    main.py          app entrypoint (also seeds the DB on startup)
    models.py        SQLAlchemy models
    schemas.py        Pydantic schemas
    seed.py           CSV -> SQLite loader
    routers/          products, auth, cart, orders
  requirements.txt
frontend/            React app (Vite)
  src/
    api/              axios calls to the backend
    context/           AuthContext, CartContext
    pages/, components/
dataset/              provided CSV dataset (unchanged)
```

## Running the backend

```bash
cd backend
python -m venv venv
./venv/Scripts/activate      # Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

On first run, the app automatically creates `backend/ecommerce.db` and seeds it with all 1,000 products from the dataset. The API is served at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

To force a reseed (e.g. after editing `seed.py`): `python -m app.seed`.

## Running the frontend

Requires Node.js (LTS). This project already installed it via winget if you ran this on the same machine.

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and talks to the backend at `http://localhost:8000/api` (configurable via `frontend/.env`, `VITE_API_URL`).

## Deploying on Render

The repo includes a [render.yaml](render.yaml) Blueprint that defines both services:

1. Push this repo to GitHub.
2. In the Render dashboard: **New +** → **Blueprint** → connect the repo. Render reads `render.yaml` and creates two services:
   - `shopverse-backend` — Python web service (FastAPI/uvicorn), free plan
   - `shopverse-frontend` — static site (Vite build output), free plan
3. Click **Apply**. Render builds and deploys both.
4. Render assigns each service a URL like `shopverse-backend-xxxx.onrender.com` (a random suffix is added if the plain name is taken). Once both are live:
   - Open the backend service → **Environment** → update `FRONTEND_ORIGIN` to the frontend's actual URL (e.g. `https://shopverse-frontend-xxxx.onrender.com`).
   - Open the frontend service → **Environment** → update `VITE_API_URL` to the backend's actual URL + `/api` (e.g. `https://shopverse-backend-xxxx.onrender.com/api`).
   - Redeploy both (env var changes on a static site require a rebuild; on the backend a restart is enough).
5. Visit the frontend URL — that's your live site.

**Important limitation:** Render's free web services use ephemeral disk — the SQLite file is recreated on every deploy and after the service spins down from inactivity. The product catalog reseeds itself automatically on startup, so browsing/search always works, but **any accounts, carts, or orders created by users will be wiped** on redeploy/restart. For a real deployment, swap SQLite for a managed Postgres (Render has a free Postgres tier) — ask me if you want that migration done.

## Notes

- Prices: the dataset's `discount` column is a percentage; the app computes the sale price itself as `price * (1 - discount / 100)` since the dataset's own `final_price` field doesn't reflect the discount.
- Cart requires login — adding to bag while logged out redirects to the login page.
- This is a demo app: checkout has no real payment integration, it simply records the order.
