import {
  computeSignalScores,
  Category,
  SearchFacets,
  SearchFilters,
  SearchRequest,
  SearchResponse,
  SearchResultItem,
  SortOption,
} from '@bestofall/shared';
import { registry } from '../providers/registry';
import { buildSearchCacheKey, cacheGet, cacheSet } from '../cache/redis';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { recordPlatformMetric } from './metrics';
import { inferCategory } from './categoryInference';

const PROVIDER_TIMEOUT_MS = 2500;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('provider_timeout')), ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function fetchFromAllProviders(
  request: SearchRequest,
  category: Category
): Promise<SearchResultItem[]> {
  const providers = registry.forCategory(category);

  const settled = await Promise.allSettled(
    providers.map(async (provider) => {
      const start = Date.now();
      try {
        const items = await withTimeout(
          provider.search({
            query: request.query,
            category,
            location: request.location,
            limit: 6,
          }),
          PROVIDER_TIMEOUT_MS
        );
        recordPlatformMetric(provider.platformId, Date.now() - start, true);
        return items;
      } catch (err) {
        recordPlatformMetric(provider.platformId, Date.now() - start, false);
        logger.warn({ err, platform: provider.platformId }, 'Provider search failed');
        return [] as SearchResultItem[];
      }
    })
  );

  return settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}

function applyFilters(items: SearchResultItem[], filters?: SearchFilters): SearchResultItem[] {
  if (!filters) return items;
  return items.filter((item) => {
    if (filters.freeDeliveryOnly && !item.freeDeliveryEligible) return false;
    if (filters.inStockOnly && !item.inStock) return false;
    if (filters.minRating !== undefined && item.rating < filters.minRating) return false;
    if (filters.maxPrice !== undefined && item.price > filters.maxPrice) return false;
    if (filters.minPrice !== undefined && item.price < filters.minPrice) return false;
    if (filters.brands?.length && item.brand && !filters.brands.includes(item.brand)) return false;
    if (filters.platforms?.length && !filters.platforms.includes(item.platformId)) return false;
    return true;
  });
}

const SORTERS: Record<SortOption, (a: SearchResultItem, b: SearchResultItem) => number> = {
  relevance: (a, b) => b.signalScore - a.signalScore,
  price_low: (a, b) => a.price - b.price,
  price_high: (a, b) => b.price - a.price,
  delivery_fast: (a, b) => a.etaMinutes - b.etaMinutes,
  rating_high: (a, b) => b.rating - a.rating,
  discount_high: (a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0),
  distance_near: (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
  popularity: (a, b) => b.popularityScore - a.popularityScore,
};

function buildFacets(items: SearchResultItem[]): SearchFacets {
  const brandCounts = new Map<string, number>();
  const platformCounts = new Map<string, number>();
  let min = Infinity;
  let max = 0;

  for (const item of items) {
    if (item.brand) brandCounts.set(item.brand, (brandCounts.get(item.brand) ?? 0) + 1);
    platformCounts.set(item.platformId, (platformCounts.get(item.platformId) ?? 0) + 1);
    min = Math.min(min, item.price);
    max = Math.max(max, item.price);
  }

  return {
    brands: Array.from(brandCounts, ([value, count]) => ({ value, count })).sort(
      (a, b) => b.count - a.count
    ),
    platforms: Array.from(platformCounts, ([value, count]) => ({ value, count })).sort(
      (a, b) => b.count - a.count
    ),
    priceRange: { min: Number.isFinite(min) ? min : 0, max },
  };
}

export async function runSearch(request: SearchRequest): Promise<SearchResponse> {
  const start = Date.now();
  const category = request.category ?? inferCategory(request.query);
  const page = request.page ?? 1;
  const pageSize = request.pageSize ?? 20;
  const sort = request.sort ?? 'relevance';

  const cacheKey = buildSearchCacheKey({
    q: request.query.toLowerCase().trim(),
    category,
    lat: request.location?.lat?.toFixed(2),
    lng: request.location?.lng?.toFixed(2),
  });

  let allItems = await cacheGet<SearchResultItem[]>(cacheKey);
  let cached = true;

  if (!allItems) {
    cached = false;
    const raw = await fetchFromAllProviders(request, category);
    allItems = computeSignalScores(raw);
    await cacheSet(cacheKey, allItems, env.searchCacheTtl);
  }

  const filtered = applyFilters(allItems, request.filters);
  const sorted = [...filtered].sort(SORTERS[sort]);
  const total = sorted.length;
  const pageStart = (page - 1) * pageSize;
  const pageItems = sorted.slice(pageStart, pageStart + pageSize);

  return {
    query: request.query,
    category,
    total,
    page,
    pageSize,
    results: pageItems,
    facets: buildFacets(filtered),
    tookMs: Date.now() - start,
    cached,
  };
}
