# FiveMarket

A minimal Fiverr-style marketplace built with **React (Vite)**, **Node.js/Express**, and **PostgreSQL**.
The repo uses **ESM** (`import`/`export`) project-wide.

## Tech Stack

- **Frontend:** Vite + React (JS), Tailwind v4 (`@tailwindcss/vite`)
- **Backend:** Node 22 (ESM), Express, `pg`, CORS, dotenv, morgan
- **Database:** PostgreSQL 16 (Docker), plain SQL migrations
- **Orchestration:** Docker Compose (db + api), **auto-migrate** on container start

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

- **apps/web/.env**

  VITE_API_URL=[http://localhost:3000](http://localhost:3000)

- **apps/api/.env** (optional for local runs; Docker sets env in compose)

  PORT=3000 \
  DATABASE_URL=postgres://fivemarket:fivemarket@localhost:5432/fivemarket \
  CORS_ORIGIN=[http://localhost:5173](http://localhost:5173) \
  JWT_SECRET=devsecret \

> Do NOT commit `.env` files. Make sure `.env` files are **git-ignored**.

## Getting Started

### 1) Install dependencies & create lockfile

```
npm install
```

### 2) Start DB + API with Docker (recommended dev flow)

```
docker compose up --build -d
# API container auto-runs db/scripts/migrate.js → applies db/migrations/*.sql
```

### 3) Start the frontend (Vite)

```
cd apps/web
# ensure your .env file exists and has VITE_API_URL=http://localhost:3000
npm run dev:web
# open http://localhost:5173
```

You should see the app and an “API health: ok” check.

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

- All DDL/DML lives in `db/migrations/*.sql` (e.g., `00_schema.sql`, `01_seed.sql`, `02_views.sql`).
- The API container runs:

  ```
  node /app/db/scripts/migrate.js
  ```

  on boot to apply any new migrations.

- After adding a new `.sql` migration:

  ```
  docker compose restart api
  ```

- ## or to be safe:

  ```
  docker compose build --no-cache api && docker compose up -d
  ```

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
