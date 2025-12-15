# FiveMarket

A full-featured Fiverr-style freelance marketplace built with **React (Vite)**, **Node.js/Express**, and **PostgreSQL**.

## 🚀 Features

### For Clients

- **Browse & Order Services** - Discover freelance services across multiple categories
- **Package Selection** - Choose from Basic, Standard, or Premium packages
- **Add-ons** - Customize orders with optional add-ons
- **Order Management** - Track orders, request revisions, and accept deliveries
- **Reviews & Ratings** - Leave detailed reviews with 0.5-star increments
- **Messaging** - Real-time communication with freelancers
- **Dispute Resolution** - Open disputes for problematic orders
- **Profile Management** - Update personal information and change password

### For Freelancers

- **Service Creation** - Create services with multiple packages and add-ons
- **Portfolio Management** - Upload portfolio images to showcase work
- **Freelancer Dashboard** - Comprehensive dashboard with:
  - Overview: Earnings, active orders, ratings, and recent activity
  - Services: Manage services (pause/activate, edit, delete)
  - Sales: View and manage all orders with filters
  - Withdrawals: Request and track withdrawal requests
- **Order Fulfillment** - Start orders, upload deliverables, handle revisions
- **Skill Tests** - Take skill certification exams
- **Earnings Tracking** - Monitor total earned, available balance, and withdrawals

### For Administrators

- **Admin Dashboard** - Platform analytics and management:
  - Overview: Platform stats, quick actions, recent activity
  - Analytics: Top earners, popular categories, top rated services
- **User Management** - View all users, promote users to admin
- **Order Management** - Monitor all platform transactions
- **Dispute Resolution** - Review and resolve user disputes (approve/reject)
- **Platform Insights** - Revenue tracking, user growth, transaction monitoring

## 🛠 Tech Stack

- **Frontend:** Vite + React (JS), Tailwind v4 (`@tailwindcss/vite`)
- **Backend:** Node 22 (ESM), Express, `pg`, JWT authentication
- **Database:** PostgreSQL 16 (Docker), plain SQL migrations
- **Orchestration:** Docker Compose (db + api), **auto-migrate** on container start
- **File Uploads:** Multer for deliverables and portfolio images

## Prerequisites

- **Node:** v22 (LTS). Recommended via `nvm`.

  ```
  nvm install 22
  nvm use 22
  echo "v22" > .nvmrc
  ```

- **npm:** ≥ 10 (bundled with Node 22)

- **Docker Desktop** (Compose v3.9)

## Project Structure

```
FiveMarket/
├─ apps/
│  ├─ web/                  # Vite + React
│  └─ api/                  # Express API (ESM)
├─ db/
│  ├─ migrations/           # 00_schema.sql, 01_seed.sql, ...
│  └─ scripts/
│     └─ migrate.js         # runs all migrations in order
├─ docker-compose.yml
├─ package.json             # workspaces, root scripts
└─ README.md
```

## Environment Variables

### Frontend (`apps/web/.env`)

```env
VITE_API_URL=http://localhost:3000
```

### Backend (`apps/api/.env`)

```env
# Server
PORT=3000

# Database
DATABASE_URL=postgres://fivemarket:fivemarket@localhost:5432/fivemarket

# CORS
CORS_ORIGIN=http://localhost:5173

# Authentication
JWT_SECRET=your-secret-key-here
HASHID_SALT=your-hashid-salt-here

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=FiveMarket <your-email@gmail.com>

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

> **Note:** Do NOT commit `.env` files. Use `.env.example` for templates.

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Set up environment files

Create `apps/web/.env` and `apps/api/.env` with the variables above.

### 3) Start DB + API with Docker

```bash
docker compose up --build -d
# API container auto-runs db/scripts/migrate.js → applies db/migrations/*.sql
```

### 4) Start the frontend (Vite)

```bash
npm run dev:web
# open http://localhost:5173
```

You should see the app with seeded data ready to use!

## Dev Modes (choose one)

### A) Docker mode (DB+API in Docker, web local) — simple & consistent

- Start stack:

  ```
  docker compose up -d
  ```

- Run only the web:

  ```
  npm run dev:web  # (or from web folder: npm run dev)
  ```

- **Do not** run a local API (port 3000 would conflict with the API container)
  ```
  # DO NOT RUN npm run dev from root folder
  ```

### B) Local API mode (when editing server with hot reload)

- Stop API container:

  ```
  docker compose stop api
  ```

- Run web + local API:

  ```
  npm run dev # root script runs both
  ```

- DB still runs in Docker

- ### Switch back any time with:

  ```
  docker compose start api
  npm run dev:web
  ```

## Migrations & Seed

- All DDL/DML lives in `db/migrations/*.sql`:
  - `00_schema.sql` - Complete database schema (all tables, indexes, constraints)
  - `03_seed_data.sql` - Sample data with users, services, and orders
- The API container runs `node /app/db/scripts/migrate.js` on boot to apply migrations automatically.

- After adding a new `.sql` migration:
  ```bash
  docker compose restart api
  ```

### Database Schema

The database includes tables for:

- **Users & Roles** - `user`, `client`, `freelancer`, `administrator`
- **Services** - `service`, `package`, `service_addon`, `service_category`
- **Orders** - `order`, `order_addon`, `deliverable`, `transaction`
- **Communication** - `conversation`, `message`
- **Reviews & Disputes** - `review`, `dispute_resolution`, `revision_request`
- **Freelancer Features** - `withdrawal_request`, `skill_exam`, `certificate`, `portfolio_image`

### Seeded Data

The seed file (`03_seed_data.sql`) includes:

- **22 Users**: 20 freelancers + 2 administrators
- **Test Credentials**: All seeded users have password `password123`
- **Sample Services**: Multiple services across different categories
- **Sample Orders**: Orders in various states for testing
- **Categories**: Graphics & Design, Digital Marketing, Writing, Video, Programming, etc.

> **Admin Login**: Use userID 21 or 22 from the seed data to access admin features

## Common Commands

```
# Start stack (db + api)
docker compose up -d

# Tail logs
docker compose logs -f api
docker compose logs -f db

# Stop / remove
docker compose stop
docker compose down -v   # drops DB volume (wipes data)

# Frontend only (Docker API running)
npm run dev:web

# Frontend + local API (stop Docker API first)
npm run dev

# Run migrations manually against $DATABASE_URL
npm run migrate
```

## Ports

- **Postgres (Docker):** 5432
- **API (Express):** 3000
- **Web (Vite):** 5173

Check conflicts on macOS:

```
lsof -i tcp:5432
lsof -i tcp:3000
lsof -i tcp:5173
```

## Notes & Conventions

- **ESM everywhere:** write API and Node scripts with `import`/`export`.

  - Need a CJS-only lib?

    ```
    import { createRequire } from 'node:module';
    const require = createRequire(import.meta.url);
    const cjsLib = require('cjs-only-lib');
    ```

- **Auto-migrate:** no manual DB setup - compose boot applies migrations.

- **Commit policy:** track SQL migrations and `*.env.example`; never commit real secrets.

## Troubleshooting

- Frontend prints HTML after “API health:”

  ```
  VITE_API_URL not set or API not running.
  Set apps/web/.env and restart Vite.
  ```

- EADDRINUSE (port in use)

  ```
  Another process is on that port. Stop it or change the port in env/compose.
  ```

- Docker build fails at `npm ci`

  ```
  Make sure package-lock.json exists at the root, or run `npm install` at the repo root so package-lock.json exists.
  ```

- ESM/CJS module errors

  ```
  The repo is ESM. Keep scripts as ESM. If you need `require`, use `createRequire` as above.
  ```
