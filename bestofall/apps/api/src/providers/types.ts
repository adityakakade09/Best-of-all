import { Category, GeoPoint, SearchResultItem } from '@bestofall/shared';

export interface ProviderSearchParams {
  query: string;
  category?: Category;
  location?: GeoPoint;
  limit?: number;
}

/**
 * Every platform integration — official API or modelled placeholder —
 * implements this single interface. The aggregator (see
 * services/searchAggregator.ts) never knows or cares whether a given
 * provider is backed by a real partner API or a mock data generator; that
 * makes swapping a mock provider for a real integration a one-file change
 * with zero blast radius on the rest of the system.
 */
export interface SearchProvider {
  readonly platformId: string;
  /** Whether this provider can serve results for a given category at all. */
  supportsCategory(category: Category): boolean;
  /** Perform a search against this platform (real API call or mock generation). */
  search(params: ProviderSearchParams): Promise<SearchResultItem[]>;
}

/** Thrown by providers on failure; the aggregator catches this per-provider so
 * one platform failing never breaks the overall search. */
export class ProviderError extends Error {
  constructor(public platformId: string, message: string, public cause?: unknown) {
    super(`[${platformId}] ${message}`);
    this.name = 'ProviderError';
  }
}
