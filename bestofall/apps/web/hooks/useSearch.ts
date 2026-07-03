import { useEffect, useState } from 'react';
import { Category, SearchFilters, SearchResponse, SortOption } from '@bestofall/shared';
import { api, buildQueryString } from '@/lib/apiClient';

interface UseSearchParams {
  query: string;
  category?: Category;
  sort: SortOption;
  filters: SearchFilters;
  location?: { lat: number; lng: number };
}

interface UseSearchResult {
  data: SearchResponse | null;
  loading: boolean;
  error: string | null;
}

export function useSearch({ query, category, sort, filters, location }: UseSearchParams): UseSearchResult {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    const qs = buildQueryString({
      query,
      category,
      sort,
      lat: location?.lat,
      lng: location?.lng,
      freeDeliveryOnly: filters.freeDeliveryOnly,
      inStockOnly: filters.inStockOnly,
      minRating: filters.minRating,
      maxPrice: filters.maxPrice,
      brands: filters.brands?.join(','),
      platforms: filters.platforms?.join(','),
    });

    api
      .get<SearchResponse>(`/search${qs}`)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Search failed');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, category, sort, filters, location?.lat, location?.lng]);

  return { data, loading, error };
}
