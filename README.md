# Apothecary — Pharmacy Inventory & Sales Management System

A MERN-stack app for small pharmacies to track medicines, stock levels,
expiry dates and daily sales, with low-stock and expiry alerts, sales/stock
reports, and staff login.

## Stack

- **Frontend:** React + Vite, plain CSS (all colours driven by CSS variables — see below)
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Auth:** JWT, passwords hashed with bcrypt

## Project structure

```
pharmacy-management-system/
├── backend/     Express API (models, controllers, routes, auth)
└── frontend/    React app (Vite)
```

## 1. Backend setup

```bash
cd backend
cp .env.example .env      # then edit .env — at minimum set MONGO_URI and JWT_SECRET
npm install
npm run seed               # creates a first admin account, see the printed credentials
npm run dev                 # starts the API on http://localhost:5000
```

`MONGO_URI` can point at a local MongoDB (`mongodb://127.0.0.1:27017/pharmacy_db`)
or a free MongoDB Atlas cluster.

### Backend API overview

| Method | Route                                | Description                          | Auth        |
|--------|---------------------------------------|---------------------------------------|-------------|
| POST   | /api/auth/register                    | Create a staff account (first one becomes admin) | Admin (after first account) |
| POST   | /api/auth/login                       | Staff login, returns a JWT            | Public      |
| GET    | /api/auth/me                          | Current logged-in staff profile       | Staff       |
| GET    | /api/auth/staff                       | List staff accounts                   | Admin       |
| GET    | /api/medicines                        | List/search medicines (`?q=`, `?category=`, `?filter=low-stock|expiring|expired`) | Staff |
| POST   | /api/medicines                        | Add a medicine                        | Staff       |
| GET    | /api/medicines/:id                    | Get one medicine                      | Staff       |
| PUT    | /api/medicines/:id                    | Edit a medicine                       | Staff       |
| DELETE | /api/medicines/:id                    | Delete a medicine                     | Admin/Pharmacist |
| GET    | /api/medicines/alerts/low-stock       | Medicines at/below reorder level      | Staff       |
| GET    | /api/medicines/alerts/expiring        | Medicines expired or expiring soon (`?days=`) | Staff |
| POST   | /api/sales                            | Record a sale — stock is reduced automatically | Staff |
| GET    | /api/sales                            | List sales (`?from=&to=`)             | Staff       |
| GET    | /api/sales/:id                        | Get one sale                          | Staff       |
| GET    | /api/reports/summary                  | Dashboard summary numbers             | Staff       |
| GET    | /api/reports/sales                    | Daily revenue + top sellers (`?from=&to=`) | Staff  |
| GET    | /api/reports/stock                    | Current stock valuation by category   | Staff       |

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:5173
```

In dev, the Vite server proxies `/api/*` requests to `http://localhost:5000`
(see `vite.config.js`), so you don't need to set `VITE_API_URL` locally.
For a production build, set `VITE_API_URL` in `frontend/.env` to your
deployed API's URL, then run `npm run build`.

## Changing the colour scheme

Every colour in the app is defined once, as a CSS variable, in
`frontend/src/styles/theme.css`. To re-theme the whole app — for a
different pharmacy's branding, for example — edit the values under `:root`
in that one file; no component CSS needs to change:

```css
:root {
  --color-primary: #1e6e5c;   /* main brand colour */
  --color-accent: #c97a2b;    /* secondary accent */
  --color-bg: #f6f7f4;        /* page background */
  --color-warning: #b8791e;   /* low-stock badges */
  --color-danger: #b23a34;    /* expired/error badges */
  --color-success: #2e7d4f;   /* in-stock/positive badges */
  ...
}
```

A dark theme is already sketched out under `[data-theme='dark']` in the
same file — add `data-theme="dark"` to `<html>` to try it.

## Notes on production use

- Set a strong, random `JWT_SECRET` before deploying.
- Stock is decremented at sale time without a DB transaction (standalone
  MongoDB doesn't support them without a replica set); for a busy,
  multi-till pharmacy, consider enabling MongoDB transactions or adding
  optimistic concurrency checks on `quantityInStock`.
- `EXPIRY_WARNING_DAYS` and the low-stock `reorderLevel` are configurable
  per medicine (reorder level) and globally (expiry window, via `.env`).
