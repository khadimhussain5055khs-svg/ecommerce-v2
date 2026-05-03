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

### Frontend (Vercel or Netlify)
- Build command: `npm run build`
- Publish directory: `dist`
- Set env var:
  - `VITE_API_URL=https://<your-backend-domain>/api/v1`

### Backend (Render or Railway)
- Root directory: `backend`
- Start command: `npm start`
- Required env vars: use `backend/.env.example`
- MongoDB: use MongoDB Atlas connection string

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

hello this one is making us very angry because
