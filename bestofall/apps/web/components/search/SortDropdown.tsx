'use client';

import { SortOption } from '@bestofall/shared';
import { SORT_LABELS } from '@/lib/format';
import { ArrowUpDown } from 'lucide-react';

const SORT_OPTIONS: SortOption[] = [
  'relevance',
  'price_low',
  'price_high',
  'delivery_fast',
  'rating_high',
  'discount_high',
  'distance_near',
  'popularity',
];

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
}) {
  return (
    <label className="glass-panel flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium">
      <ArrowUpDown className="h-4 w-4 text-ink-muted dark:text-ink-muted-dark" />
      <span className="sr-only">Sort results by</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="bg-transparent outline-none cursor-pointer pr-1"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt} value={opt} className="text-ink bg-canvas-light dark:bg-canvas-dark">
            {SORT_LABELS[opt]}
          </option>
        ))}
      </select>
    </label>
  );
}
