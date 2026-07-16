# Sila | صِلة 💵

AI-powered personal finance platform. Sila unifies multiple bank accounts into one
smart dashboard by **analyzing bank SMS messages** (instead of direct bank integration),
then layers on categorization, scores, budgets, goals and AI insights.

Built strictly from the project documentation (Functional Requirements, ER Diagram,
DFD, Schema, Project Context). No features beyond the requirements.

## Tech Stack

- **Next.js 14** (App Router) — frontend + backend in one project
- **Tailwind CSS** — mobile-first UI, official Sila palette
- **PostgreSQL** + **Prisma** ORM — schema maps 1:1 to `sela_schema.sql`
- **JWT** session auth on top of **phone + OTP** login
- **Recharts** — dashboard charts
- **Mock AI service** with an **OpenAI-ready** provider seam

## Architecture

```
Route handlers (src/app/api/*)   → thin transport layer
      │
Service layer (src/server/services/*)  → all business logic (7 DFD processes)
      │
Prisma singleton (src/server/db/prisma.ts)  → the ONLY database gateway
```

- **Real-time (FR-13):** every mutation funnels through `recalc.service.ts`, which
  re-snapshots scores and regenerates AI outputs.
- **Generic AI outputs:** recommendations, insights and score tips all persist to the
  single `ai_output` entity, discriminated by type.
- **Swappable AI:** `AI_PROVIDER=mock` (default) or `openai` — one env var.

See `Project_Context.md` for the full domain context and design decisions.

## Prerequisites

- **Node.js** 18.18+ (or 20+)
- **PostgreSQL** 14+ — either via **Docker** (recommended, see below) or a local/remote instance

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and adjust the values:

```bash
cp .env.example .env
```

Set at least:

- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_SECRET` — any long random string

Defaults that already work for local dev: `MOCK_OTP_CODE=123456`, `AI_PROVIDER=mock`.

### 3. Start the database

**Option A — Docker (recommended).** Brings up PostgreSQL matching the default
`DATABASE_URL` with one command:

```bash
docker compose up -d
```

This runs Postgres 16 on `localhost:5432` with user/password `postgres` and database
`sela`, persisting data in a named volume. Stop it any time with `docker compose down`
(add `-v` to also wipe the data).

**Option B — existing PostgreSQL.** Create an empty database matching your
`DATABASE_URL` (default name: `sela`):

```bash
createdb sela         # or: psql -c "CREATE DATABASE sela;"
```

### 4. Run migrations + generate the Prisma client

```bash
npm run prisma:migrate      # creates the 14 tables, generates the client
```

### 5. Seed demo data

```bash
npm run db:seed
```

This creates a demo user with 3 accounts, ~42 transactions over 3 months, budgets,
goals, score history and AI outputs — so every screen is populated immediately.

### 6. Start the app

```bash
npm run dev
```

Open **http://localhost:3000**.

## Logging in

The demo user is pre-seeded:

- **Phone:** `0500000000`
- **OTP:** `123456` (mock — also printed to the server console on request)

New phone numbers will be routed through the onboarding flow (select banks →
confirm SMS-detected accounts → enter balances).

## Try the SMS ingestion

On the **Activity** tab, paste or edit a bank SMS and hit *Parse & add*, e.g.:

```
Al Rajhi Bank: Purchase of 88.00 SAR at Jarir from card ending 4821
SNB: Salary deposit of 8000 SAR to account ****7735
```

The parser extracts amount, type, category and last-4 digits, creates the
transaction, updates the balance, and recalculates scores + insights in real time.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run prisma:migrate` | Run migrations (dev) |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Drop, re-migrate and re-seed |

## Project Structure

```
prisma/            schema.prisma (14 models) + seed.ts
src/
  app/             Next.js routes — (auth) (onboarding) (dashboard) + api/*
  server/          Backend: services, ai layer, sms parser, auth, db, validation
  components/      Reusable UI, charts, layout
  lib/  hooks/  types/  config/
```

## Switching to real OpenAI

1. Set `AI_PROVIDER=openai` and `OPENAI_API_KEY=...` in `.env`.
2. Implement the API calls in `src/server/ai/OpenAIProvider.ts` (the method
   signatures and the `ai_output` persistence are already wired).

No other code changes required.
