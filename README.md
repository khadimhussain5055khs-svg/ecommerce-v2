# PreLounge

PreLounge is a full-stack e-commerce app:
- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + MongoDB (Mongoose)
- Payments: Razorpay
- Auth: JWT with `customer`, `admin`, `owner` roles

## Repository Structure

```txt
ecommerce-deployable/
├── src/                  # Frontend app
├── backend/              # Express API server
├── .github/workflows/    # CI pipeline
├── .env.example          # Frontend env template
└── backend/.env.example  # Backend env template
```

## Features

- User registration/login with role-based access
- Owner/admin dashboard:
  - Manage products and banners
  - Manage order statuses
- Cart + checkout
- COD and Razorpay online payment flow
- Customer order history
- Inventory updates on successful order/payment

## Local Development

### 1) Install dependencies

```bash
npm install
npm install --prefix backend
```

### 2) Configure environment variables

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Edit `backend/.env` values:
- `MONGODB_URI`
- `JWT_SECRET`
- `OWNER_EMAIL`, `OWNER_PASSWORD`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

### 3) Run app

Frontend only:
```bash
npm run dev
```

Backend only:
```bash
npm run backend:dev
```

Run both:
```bash
npm run dev:full
```

Frontend URL: `http://localhost:5173`  
Backend URL: `http://localhost:5000/api/v1`

## Owner Bootstrap

On backend startup, owner account and default catalog are auto-bootstrapped when collections are empty.

You can also run:
```bash
npm run backend:seed-owner
```

## Production Build

Frontend:
```bash
npm run build
```

Backend:
```bash
npm run backend:start
```

## Deploy Guide (GitHub Ready)

### Frontend on Vercel
- Import this repo into Vercel.
- Root directory: `/`
- Framework preset: `Vite` (or `React` if you want)
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:
  - `VITE_API_URL=https://<your-backend-domain>/api/v1`

> The frontend uses `import.meta.env.VITE_API_URL` and falls back to `/api/v1` if not set.

### Backend on Render
- Add a new Web Service from this repo.
- Root directory: `backend`
- Environment: `Node`
- Build command: `cd backend && npm install && npm run prisma:generate`
- Start command: `cd backend && npm start`
- Environment variables: use `backend/.env.example` as a template.
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `FRONTEND_URL`
  - `OWNER_EMAIL`
  - `OWNER_PASSWORD`
  - `OWNER_NAME`
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`

### Database on Railway
- Create a new Railway project and add a MySQL plugin.
- Copy the generated `DATABASE_URL` and add it to Render as an env var.
- If you prefer PostgreSQL, update `DATABASE_URL` to use the correct Prisma provider.

### Notes
- `FRONTEND_URL` on the backend should be the deployed Vercel URL.
- `VITE_API_URL` on Vercel should point to the Render backend URL plus `/api/v1`.
- `render.yaml` is included for Render service-as-code.
- `vercel.json` is included for Vercel SPA routing.

### CI

GitHub Actions workflow is included at:
- `.github/workflows/ci.yml`

It runs frontend build and backend dependency validation on PRs and pushes.

## Deployment Smoke Checklist

After deploy, verify:
1. `/api/v1/health` returns `{ ok: true }`
2. Owner login works with `OWNER_EMAIL`/`OWNER_PASSWORD`
3. Admin can create/update/delete products and banners
4. Cart updates and checkout creates orders
5. Razorpay online payment verifies successfully
6. Customer can view `My Orders`
