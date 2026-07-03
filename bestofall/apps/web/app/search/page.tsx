'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category, SearchFilters, SearchResultItem, SortOption } from '@bestofall/shared';
import { SearchBar } from '@/components/search/SearchBar';
import { CategoryChips } from '@/components/search/CategoryChips';
import { SortDropdown } from '@/components/search/SortDropdown';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { ResultGrid } from '@/components/search/ResultGrid';
import { useSearch } from '@/hooks/useSearch';
import { useWishlist } from '@/hooks/useWishlist';
import { useGeolocation } from '@/hooks/useGeolocation';
import { api } from '@/lib/apiClient';
import { SlidersHorizontal, X } from 'lucide-react';

function SearchPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQuery = params.get('q') ?? '';
  const initialCategory = (params.get('category') as Category | null) ?? undefined;
  const initialLat = params.get('lat');
  const initialLng = params.get('lng');

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<Category | undefined>(initialCategory);
  const [sort, setSort] = useState<SortOption>('relevance');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const geo = useGeolocation();
  const location =
    initialLat && initialLng
      ? { lat: Number(initialLat), lng: Number(initialLng) }
      : geo.location ?? undefined;

  const { data, loading, error } = useSearch({ query, category, sort, filters, location });
  const { wishlistedIds, toggle } = useWishlist();

  const handleSearch = (q: string) => {
    setQuery(q);
    router.replace(`/search?q=${encodeURIComponent(q)}${category ? `&category=${category}` : ''}`);
  };

  const handleOrderNow = (item: SearchResultItem) => {
    void api.post('/search/redirect', {
      platformId: item.platformId,
      itemId: item.id,
      query,
      price: item.price,
    });
    window.open(item.deepLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8">
      <div className="mx-auto mb-6 max-w-2xl">
        <SearchBar
          initialQuery={query}
          onSearch={handleSearch}
          onRequestLocation={geo.request}
          locationStatus={geo.status}
          size="compact"
        />
      </div>

      <div className="mb-6">
        <CategoryChips active={category} onSelect={setCategory} />
      </div>

      {query ? (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-xl font-semibold">
                Results for &ldquo;{query}&rdquo;
              </h1>
              {data && (
                <p className="text-sm text-ink-muted dark:text-ink-muted-dark">
                  {data.total} results across every platform &middot; {data.tookMs}ms
                  {data.cached ? ' (cached)' : ''}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="btn-ghost !px-3.5 !py-2 text-sm lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <SortDropdown value={sort} onChange={setSort} />
            </div>
          </div>

          {error && (
            <div className="glass-panel mb-5 rounded-xl2 border-signal-ember/30 px-4 py-3 text-sm text-signal-ember">
              {error} — showing what we could gather. Try again in a moment.
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
            <div className="hidden lg:block">
              {data && (
                <FilterSidebar facets={data.facets} filters={filters} onChange={setFilters} className="sticky top-24" />
              )}
            </div>

            {mobileFiltersOpen && data && (
              <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm lg:hidden">
                <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-canvas-light dark:bg-canvas-dark p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-display text-lg font-semibold">Filters</h2>
                    <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <FilterSidebar facets={data.facets} filters={filters} onChange={setFilters} />
                </div>
              </div>
            )}

            <ResultGrid
              items={data?.results ?? []}
              loading={loading}
              wishlistedIds={wishlistedIds}
              onToggleWishlist={toggle}
              onOrderNow={handleOrderNow}
            />
          </div>
        </>
      ) : (
        <div className="glass-panel mx-auto max-w-xl rounded-xl3 px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold">Search for anything to get started</p>
          <p className="mt-1 text-sm text-ink-muted dark:text-ink-muted-dark">
            Try &ldquo;Pizza&rdquo;, &ldquo;iPhone 16&rdquo;, or &ldquo;Nike shoes&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="px-4 py-24 text-center text-sm text-ink-muted">Loading search…</div>}>
      <SearchPageInner />
    </Suspense>
  );
}
