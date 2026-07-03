# BestOfAll

**One search bar. Every platform. The best pick, instantly.**

BestOfAll is a universal search and comparison platform for food, groceries, medicines,
electronics, fashion and gifts. Search once and see merged, ranked results from every
major delivery and e-commerce platform — Amazon, Flipkart, Myntra, Ajio, Swiggy, Zomato,
Domino's, Pizza Hut, Blinkit, Zepto, Instamart, BigBasket, PharmEasy and Apollo 247 —
compared side by side on price, delivery time, rating, discount and distance.

---

## Monorepo layout

```
bestofall/
├── apps/
│   ├── web/            Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion
│   └── api/             Express + TypeScript + PostgreSQL + Redis
├── packages/
│   └── shared/          Types, platform registry, and the Signal Score ranking algorithm
│                         shared by both apps so the contract never drifts
├── infra/docker/         docker-compose.yml for local & prod-like orchestration
├── .github/workflows/    CI (lint/test/build) and CD (image build & push) pipelines
└── docs/                 Architecture, API reference, and deployment guides
```

## Why a shared package?

`packages/shared` holds every type that crosses the frontend/backend boundary
(`SearchResultItem`, `SearchRequest`, `User`, ...), the platform registry (`PLATFORMS`),
and the **Signal Score** algorithm (`computeSignalScores`) that ranks results by a
composite of price, delivery speed, rating, discount and distance. Both apps import the
same source of truth, so a result the API scores as "Best Overall" is rendered
identically on the frontend without re-implementing the logic.

## Getting started (local development)

### Prerequisites
- Node.js 20+
- Docker (for PostgreSQL & Redis — or run them yourself and adjust `.env`)

### 1. Install dependencies
```bash
npm install
```

### 2. Start PostgreSQL & Redis
```bash
docker compose -f infra/docker/docker-compose.yml up postgres redis -d
```

### 3. Configure environment variables
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```
The defaults work out of the box in **dev mode** (`AUTH_DEV_MODE=true`), where phone
verification is simulated and the OTP is always `123456` — no Firebase project or SMS
provider required to run the whole app end to end. See [`docs/AUTH.md`](docs/AUTH.md) to
switch to live Firebase Phone Auth for production.

### 4. Run database migrations & seed data
```bash
npm run db:migrate -w apps/api
npm run db:seed -w apps/api
```
This creates a demo admin (`+919999999999`) and a demo user (`+919876543210`) — sign in
with either using OTP `123456` in dev mode.

### 5. Run both apps
```bash
npm run dev
```
- Web: http://localhost:3000
- API: http://localhost:4000 (health check at `/health`)

## Running everything in Docker

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```
Brings up Postgres, Redis, the API, and the web app together. Run migrations once
against the containerized database the first time:
```bash
DATABASE_URL=postgresql://bestofall:bestofall@localhost:5432/bestofall npm run db:migrate -w apps/api
```

## Key documents

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design, the provider interface
  pattern, caching strategy, and the Signal Score algorithm
- [`docs/API.md`](docs/API.md) — REST API reference
- [`docs/PROVIDERS.md`](docs/PROVIDERS.md) — how platform integrations work today (mock)
  and how to graduate one to a real, official API
- [`docs/AUTH.md`](docs/AUTH.md) — OTP auth flow, dev mode vs. live Firebase Phone Auth
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — production deployment options

## On platform integrations

No platform in this build is scraped. Every platform without a public search API is
represented by a modelled **mock provider** — deterministic, realistic-looking demo
data generated at request time, clearly documented as such in code. Each mock provider
implements the exact same `SearchProvider` interface a real, officially-licensed
integration would, so a partnership or public API key can replace a mock with zero
changes anywhere else in the app. See `apps/api/src/providers/`.

## Tech stack

**Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Zustand, Recharts
**Backend:** Node.js, Express, PostgreSQL, Redis, Firebase Admin (OTP verification), Zod, Pino
**Infra:** Docker, Docker Compose, GitHub Actions CI/CD, GHCR image registry

> **Note:** This project pins `next@14.2.35`, the final security-patched release on the
> 14.x line (Next.js 14 reached end-of-life in October 2025 and no longer receives
> guaranteed CVE fixes). Before going to production, plan an upgrade to a supported
> Next.js 15.x/16.x release — the App Router code in `apps/web` should port with minimal
> changes, but budget time to re-test.

## License

MIT — see [`LICENSE`](LICENSE).
