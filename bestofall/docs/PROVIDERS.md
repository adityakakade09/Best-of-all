# Provider Integrations

BestOfAll never scrapes a third-party platform. Every platform is accessed through one
of two paths:

1. **Official API / partnership** — a real `SearchProvider` implementation calling the
   platform's public or partner API with proper credentials.
2. **Modelled mock provider** — used for every platform today, since none currently has
   a public search API BestOfAll has integrated with. Clearly a placeholder, generating
   realistic-looking demo data rather than real listings.

Both paths implement the exact same interface, so the rest of the app — the aggregator,
caching, ranking, routes, and every frontend component — is completely agnostic to which
kind of provider it's talking to.

## The interface

```ts
// apps/api/src/providers/types.ts
interface SearchProvider {
  readonly platformId: string;
  supportsCategory(category: Category): boolean;
  search(params: ProviderSearchParams): Promise<SearchResultItem[]>;
}
```

## How mock providers work today

`providers/mock/mockEngine.ts` is a deterministic, seeded data generator. For a given
`(platformId, query, index)` it always produces the same title, price, ETA, rating, etc,
within category-appropriate ranges (see `CATEGORY_TUNING`). This means:

- The same search returns stable results across requests — useful for demos, screenshots,
  and tests.
- Different platforms return believably different prices/ETAs/discounts for the same
  query, so sorting and the Signal Score are meaningful.
- Nothing is copied from any real website — titles are generated from the query itself
  plus a small set of generic variant/brand templates per category.

`providers/mock/mockProviderFactory.ts` wraps this engine into a `SearchProvider`
implementation and adds simulated network latency, so the aggregator's timeout/parallel
handling is exercised realistically.

## Graduating a platform to a real integration

1. Get API credentials / partnership terms from the platform (many require a formal
   affiliate or partner agreement for programmatic search access).
2. Add the credentials to `apps/api/.env` (never hardcode secrets).
3. Create `providers/real/<platform>Provider.ts` implementing `SearchProvider`:
   ```ts
   export function createAmazonProvider(opts: { apiKey: string }): SearchProvider {
     return {
       platformId: 'amazon',
       supportsCategory: (c) => getPlatform('amazon')!.categories.includes(c),
       async search(params) {
         // call the real API, map its response shape -> SearchResultItem[]
       },
     };
   }
   ```
   See `providers/real/exampleOfficialProvider.ts` for a fuller template, including
   failing closed (throwing `ProviderError`) rather than silently returning fabricated
   data when credentials are missing.
4. In `providers/registry.ts`, replace that platform's line:
   ```diff
   - registry.register(createMockProvider(getPlatform('amazon')!));
   + registry.register(createAmazonProvider({ apiKey: env.amazonApiKey }));
   ```
5. Nothing else changes. The aggregator, cache keys, Signal Score, filters, sort, and
   every frontend component keep working exactly as before.

## Adding a brand-new platform

1. Add its metadata to `packages/shared/src/platforms.ts` (`PLATFORMS` array) — name,
   categories it serves, brand color, logo path, affiliate base URL.
2. Register either `createMockProvider(platform)` (to launch with modelled data) or a
   real provider for it in `providers/registry.ts`.
3. That's it — it now appears in search results, filters, the trust strip on the landing
   page, and admin platform-performance analytics automatically.
