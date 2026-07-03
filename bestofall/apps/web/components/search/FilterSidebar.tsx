'use client';

import { SearchFacets, SearchFilters } from '@bestofall/shared';
import { formatInr } from '@/lib/format';
import { cn } from '@/lib/cn';

interface FilterSidebarProps {
  facets: SearchFacets;
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  className?: string;
}

export function FilterSidebar({ facets, filters, onChange, className }: FilterSidebarProps) {
  const toggleBrand = (brand: string) => {
    const brands = filters.brands ?? [];
    onChange({
      ...filters,
      brands: brands.includes(brand) ? brands.filter((b) => b !== brand) : [...brands, brand],
    });
  };

  const togglePlatform = (platformId: string) => {
    const platforms = filters.platforms ?? [];
    onChange({
      ...filters,
      platforms: platforms.includes(platformId)
        ? platforms.filter((p) => p !== platformId)
        : [...platforms, platformId],
    });
  };

  return (
    <aside className={cn('glass-panel flex flex-col gap-6 rounded-xl3 p-5', className)}>
      <div>
        <h4 className="mb-3 text-sm font-semibold">Delivery &amp; availability</h4>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.freeDeliveryOnly ?? false}
              onChange={(e) => onChange({ ...filters, freeDeliveryOnly: e.target.checked })}
              className="h-4 w-4 rounded accent-signal-indigo"
            />
            Free delivery only
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.inStockOnly ?? false}
              onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
              className="h-4 w-4 rounded accent-signal-indigo"
            />
            In stock only
          </label>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold">Minimum rating</h4>
        <div className="flex gap-2">
          {[0, 3, 3.5, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, minRating: r || undefined })}
              className={cn('chip !px-3 !py-1 text-xs', (filters.minRating ?? 0) === r && 'chip-active')}
            >
              {r === 0 ? 'Any' : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold">
          Price range
          <span className="ml-1 font-normal text-ink-muted dark:text-ink-muted-dark">
            ({formatInr(facets.priceRange.min)} – {formatInr(facets.priceRange.max)})
          </span>
        </h4>
        <input
          type="range"
          min={facets.priceRange.min}
          max={facets.priceRange.max}
          value={filters.maxPrice ?? facets.priceRange.max}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-signal-indigo"
        />
        <div className="mt-1 text-xs text-ink-muted dark:text-ink-muted-dark">
          Up to {formatInr(filters.maxPrice ?? facets.priceRange.max)}
        </div>
      </div>

      {facets.platforms.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold">Platform</h4>
          <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
            {facets.platforms.map((p) => (
              <label key={p.value} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.platforms?.includes(p.value) ?? false}
                    onChange={() => togglePlatform(p.value)}
                    className="h-4 w-4 rounded accent-signal-indigo"
                  />
                  {p.value}
                </span>
                <span className="text-xs text-ink-muted dark:text-ink-muted-dark">{p.count}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {facets.brands.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold">Brand</h4>
          <div className="flex flex-wrap gap-2">
            {facets.brands.slice(0, 10).map((b) => (
              <button
                key={b.value}
                onClick={() => toggleBrand(b.value)}
                className={cn('chip !px-3 !py-1 text-xs', filters.brands?.includes(b.value) && 'chip-active')}
              >
                {b.value}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => onChange({})}
        className="text-xs font-medium text-signal-indigo hover:underline self-start"
      >
        Clear all filters
      </button>
    </aside>
  );
}
