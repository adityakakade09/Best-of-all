import { Category, PLATFORMS } from '@bestofall/shared';
import { SearchProvider } from './types';
import { createMockProvider } from './mock/mockProviderFactory';

class ProviderRegistry {
  private providers = new Map<string, SearchProvider>();

  register(provider: SearchProvider) {
    this.providers.set(provider.platformId, provider);
  }

  get(platformId: string): SearchProvider | undefined {
    return this.providers.get(platformId);
  }

  all(): SearchProvider[] {
    return Array.from(this.providers.values());
  }

  forCategory(category: Category): SearchProvider[] {
    return this.all().filter((p) => p.supportsCategory(category));
  }
}

export const registry = new ProviderRegistry();

// Register every platform. Today every platform is backed by the mock
// engine (see providers/mock) because none currently has a public search
// API BestOfAll has integrated with — swap individual lines here for real
// providers (see providers/real/exampleOfficialProvider.ts) as partnerships
// land, with zero changes needed anywhere else in the app.
for (const platform of PLATFORMS) {
  registry.register(createMockProvider(platform));
}
