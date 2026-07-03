# Deployment

BestOfAll ships as two containerized services (API, Web) plus managed PostgreSQL and
Redis. Any platform that runs Docker images works; a few common paths below.

## Option A — Single VM / Docker Compose

Simplest path to a live, cloud-hosted instance:

1. Provision a VM (e.g. a $12–24/mo box on any cloud) with Docker installed.
2. Copy the repo, set real secrets in `apps/api/.env` (`JWT_*` secrets, Firebase creds,
   `GOOGLE_MAPS_API_KEY`, `AUTH_DEV_MODE=false`) and `apps/web/.env.local`
   (`NEXT_PUBLIC_*`).
3. `docker compose -f infra/docker/docker-compose.yml up --build -d`
4. Put a reverse proxy (Caddy/Nginx/Traefik) in front for TLS + your domain, pointing
   `/` at the `web` container (port 3000) and `/api` at the `api` container (port 4000)
   — or keep them on separate subdomains (`app.example.com`, `api.example.com`) and set
   `NEXT_PUBLIC_API_URL` / `CLIENT_ORIGIN` accordingly.
5. Run `npm run db:migrate -w apps/api` once against the production `DATABASE_URL`.

## Option B — Managed platform (Cloud Run, Render, Railway, Fly.io, ECS)

The `Dockerfile`s in `apps/api` and `apps/web` build standalone production images with
no platform-specific assumptions — push each to your registry of choice and deploy as
two services:

- **API service**: exposes port `4000`, needs `DATABASE_URL`, `REDIS_URL`, `JWT_*`,
  `CLIENT_ORIGIN`, and (in production auth mode) Firebase credentials.
- **Web service**: exposes port `3000`, needs `NEXT_PUBLIC_API_URL` set to the API
  service's public URL **at build time** (it's baked into the client bundle).

Managed **PostgreSQL** (Cloud SQL, Neon, Supabase, RDS, Railway Postgres) and managed
**Redis** (Upstash, ElastiCache, Redis Cloud) are recommended over self-hosting these in
containers for anything beyond early-stage traffic.

## Option C — Google Cloud (matches the brief's "Google Cloud services")

- **Cloud Run** for both `api` and `web` containers (scales to zero, pay-per-request).
- **Cloud SQL for PostgreSQL** as the primary database.
- **Memorystore for Redis** for the cache layer.
- **Secret Manager** for `JWT_*`, Firebase service account, and Maps API key — injected
  as env vars into Cloud Run revisions.
- **Firebase Authentication** (already part of the auth design) for OTP phone sign-in.
- **Cloud Build** (or the included GitHub Actions workflow) to build/push images and
  trigger new Cloud Run revisions on tag pushes.

## CI/CD

- `.github/workflows/ci.yml` — runs on every push/PR: installs, builds the shared
  package, lints and tests both apps, spins up ephemeral Postgres/Redis via GitHub
  Actions services, runs migrations, and builds both apps to catch build-time errors
  before merge.
- `.github/workflows/deploy.yml` — on a `v*` tag push, builds and pushes both Docker
  images to GitHub Container Registry. The final "trigger your platform's deploy" step
  is intentionally left as a template — wire in `gcloud run deploy`, `flyctl deploy`,
  `railway up`, or an ECS/K8s rollout depending on where you land.

## Scaling notes

- The API is stateless (JWTs, no server-side sessions) — horizontally scale by running
  more container replicas behind a load balancer.
- Search result caching in Redis means repeated identical/near-identical queries don't
  re-hit every provider — tune `SEARCH_CACHE_TTL` per traffic patterns.
- `platform_metrics` writes are buffered in-memory and batch-inserted every 5s
  (`services/metrics.ts`) specifically so a burst of concurrent searches doesn't turn
  into a burst of individual `INSERT`s.
- Move rate limiting to a shared Redis store (`rate-limit-redis`) once running more than
  one API replica, since the default `express-rate-limit` store is per-process.
