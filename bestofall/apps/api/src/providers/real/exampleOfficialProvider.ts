import { Category, PlatformMeta } from '@bestofall/shared';
import { ProviderError, ProviderSearchParams, SearchProvider } from '../types';

/**
 * TEMPLATE for a real, official-API-backed provider.
 *
 * This file is NOT wired into the registry by default — it exists to show
 * exactly how to graduate a platform from `createMockProvider(...)` to a
 * live integration once a partnership/public API key is available:
 *
 *   1. Implement `SearchProvider` (same contract the mock uses).
 *   2. Map the partner API's response shape to `SearchResultItem`.
 *   3. Read credentials from `config/env.ts` (never hardcode secrets).
 *   4. Swap the registration in `providers/registry.ts`:
 *        registry.register(createAmazonOfficialProvider(env.amazon))
 *      in place of:
 *        registry.register(createMockProvider(getPlatform('amazon')!))
 *
 * Nothing else in the app (aggregator, routes, caching, frontend) needs to
 * change, because everything downstream only depends on `SearchProvider`.
 */
export function createOfficialProviderTemplate(
  platform: PlatformMeta,
  opts: { apiKey: string; baseUrl: string }
): SearchProvider {
  return {
    platformId: platform.id,

    supportsCategory(category: Category): boolean {
      return platform.categories.includes(category);
    },

    async search(params: ProviderSearchParams) {
      if (!opts.apiKey) {
        // Fail closed rather than silently returning fabricated data when
        // credentials are missing for a "real" provider.
        throw new ProviderError(platform.id, 'Missing API credentials');
      }

      try {
        const url = `${opts.baseUrl}/search?q=${encodeURIComponent(params.query)}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${opts.apiKey}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { items?: unknown[] };

        // Map partner-specific fields -> SearchResultItem here.
        return (json.items ?? []).map(() => {
          throw new ProviderError(platform.id, 'Response mapping not implemented — fill in for this partner API');
        });
      } catch (err) {
        throw new ProviderError(platform.id, 'Search request failed', err);
      }
    },
  };
}
