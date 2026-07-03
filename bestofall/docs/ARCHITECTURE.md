# Architecture

## Overview

```
┌─────────────┐        HTTPS/JSON        ┌──────────────┐
│  Next.js    │ ───────────────────────▶ │   Express    │
│  (apps/web) │ ◀─────────────────────── │  (apps/api)  │
└─────────────┘                          └──────┬───────┘
                                                  │
                     ┌────────────────────────────┼────────────────────────┐
                     ▼                             ▼                        ▼
              ┌─────────────┐              ┌─────────────┐          ┌─────────────┐
              │  PostgreSQL │              │    Redis     │          │  Providers   │
              │ users, hist,│              │ search cache,│          │  (14 search  │
              │ wishlist,   │              │ OTP, rate    │          │  providers,  │
              │ addresses,  │              │ limiting     │          │  fanned out  │
              │ metrics     │              │              │          │  in parallel)│
              └─────────────┘              └─────────────┘          └─────────────┘
```

## Request lifecycle: a search

1. **Client** debounces input and calls `GET /api/search?query=...&category=...&sort=...`.
2. **Route** (`routes/search.ts`) validates the query with Zod, then calls
   `services/searchAggregator.ts`.
3. **Aggregator**:
   - Infers a category if none was given (`services/categoryInference.ts`).
   - Checks Redis for a cached result set keyed by `query + category + rounded location`.
   - On a cache miss, fans the request out to every `SearchProvider` registered for that
     category **in parallel** (`Promise.allSettled`, 2.5s per-provider timeout) so one
     slow/broken platform never blocks or breaks the whole search.
   - Runs `computeSignalScores()` (from `@bestofall/shared`) over the merged result set to
     assign each item a 0–100 composite score and badges (`best_overall`, `lowest_price`,
     `fastest_delivery`, ...).
   - Caches the scored, unfiltered result set for `SEARCH_CACHE_TTL` seconds (default 120s).
   - Applies the request's filters and sort **after** caching, so the same cached data can
     serve many different filter/sort combinations without re-fetching from providers.
4. **Response** includes the paginated results, computed facets (price range, brands,
   platforms present), timing, and whether it was served from cache.
5. Each search is also logged (fire-and-forget) to `search_history` for personalization
   and the admin analytics dashboard.

## The provider interface pattern

Every platform — whether or not BestOfAll has an official API partnership with it —
implements one interface:

```ts
interface SearchProvider {
  readonly platformId: string;
  supportsCategory(category: Category): boolean;
  search(params: ProviderSearchParams): Promise<SearchResultItem[]>;
}
```

Today, all 14 platforms are backed by `createMockProvider()`, which wraps a shared,
deterministic mock data engine (`providers/mock/mockEngine.ts`). Results are seeded off
`(platformId, query, index)` so repeated searches return stable, realistic-looking data
useful for demos and tests — never scraped, never copied from a live site.

`providers/real/exampleOfficialProvider.ts` is a template showing exactly how to
graduate a platform to a real integration: implement the same interface against the
partner's actual API, then swap one line in `providers/registry.ts`. Nothing in the
aggregator, caching layer, routes, or frontend needs to change.

See [`PROVIDERS.md`](./PROVIDERS.md) for the full guide.

## The Signal Score

`packages/shared/src/scoring.ts` computes a 0–100 composite score per result, relative to
the min/max of the current result set, weighted:

| Factor    | Weight |
|-----------|--------|
| Price     | 32%    |
| Speed     | 24%    |
| Rating    | 22%    |
| Discount  | 14%    |
| Distance  | 8%     |

The highest-scoring item in a result set is tagged `best_overall` and rendered with the
glowing **Signal Ring** on the frontend — the product's answer to "which one should I
actually pick?" without asking the user to mentally weigh five separate stats.

## Caching strategy

- **Search results**: cached in Redis for `SEARCH_CACHE_TTL` seconds, keyed by normalized
  query + category + location (rounded to ~1km) — absorbs bursts of identical/near-identical
  searches without re-hitting every provider.
- **OTP codes** (dev mode): stored in Redis with a 5-minute TTL.
- **Rate limiting**: `express-rate-limit` in-memory by default; swap to a Redis store
  (`rate-limit-redis`) behind a load balancer with multiple API instances.

## Data model

See `apps/api/src/db/schema.sql` for the full schema: `users`, `refresh_tokens`,
`addresses`, `wishlist_items`, `search_history`, `notifications`, `order_redirects`
(click-through tracking for admin CTR analytics), and `platform_metrics` (latency/error
tracking per provider, buffered and batch-inserted every 5s).

## Frontend architecture

- **App Router** (`apps/web/app`) with server-rendered layout/metadata and client
  components for interactive pieces (search, filters, auth forms).
- **State**: Zustand for auth session (persisted to `localStorage`), local component state
  for search/filter/sort — no global client-state library needed beyond auth.
- **Data fetching**: a small typed `api` client (`lib/apiClient.ts`) wraps `fetch`,
  attaches the bearer token, and normalizes the API's `{ success, data, error }` envelope.
- **Design system**: Tailwind tokens for the glassmorphism palette (`tailwind.config.js`),
  reusable primitives in `components/ui`, feature components in `components/search` and
  `components/admin`.

## Security

- Helmet security headers, strict CORS to `CLIENT_ORIGIN`, per-route rate limiting
  (stricter on OTP endpoints to prevent SMS-bombing).
- JWT access tokens (short-lived) + refresh tokens (rotatable, revocable via
  `refresh_tokens` table) rather than long-lived sessions.
- Zod validation on every mutating endpoint; centralized error handler never leaks stack
  traces to clients.
- Phone verification is either Firebase Phone Auth (ID token verified server-side via
  Firebase Admin) or, in dev mode only, a Redis-backed simulated OTP — never a
  self-rolled SMS OTP store in production.
