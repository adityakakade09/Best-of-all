import { Category, PlatformMeta } from '@bestofall/shared';
import { ProviderSearchParams, SearchProvider } from '../types';
import { generateMockResults } from './mockEngine';

/**
 * Wraps a platform's metadata + the shared mock engine into a fully-formed
 * SearchProvider. This is the ONLY place mock data is produced — when a real
 * partnership/API becomes available for a platform, replace its call site in
 * `providers/registry.ts` with a real provider class implementing the same
 * `SearchProvider` interface (see providers/real/exampleOfficialProvider.ts
 * for the pattern) and nothing else in the app needs to change.
 */
export function createMockProvider(platform: PlatformMeta): SearchProvider {
  return {
    platformId: platform.id,

    supportsCategory(category: Category): boolean {
      return platform.categories.includes(category);
    },

    async search(params: ProviderSearchParams) {
      const category = params.category ?? platform.categories[0];
      if (!this.supportsCategory(category)) return [];

      // Simulate realistic network latency so the aggregator's
      // parallelism / timeout handling is exercised meaningfully.
      const latency = 120 + Math.random() * 380;
      await new Promise((resolve) => setTimeout(resolve, latency));

      const count = params.limit ?? 6;
      return generateMockResults({
        platform,
        query: params.query,
        category,
        location: params.location,
        count,
      });
    },
  };
}
