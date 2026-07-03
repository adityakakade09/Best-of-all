import { SearchResultItem } from '@bestofall/shared';
import { ResultCard } from './ResultCard';
import { ResultCardSkeleton } from './ResultCardSkeleton';

interface ResultGridProps {
  items: SearchResultItem[];
  loading: boolean;
  wishlistedIds: Set<string>;
  onToggleWishlist: (item: SearchResultItem) => void;
  onOrderNow: (item: SearchResultItem) => void;
}

export function ResultGrid({ items, loading, wishlistedIds, onToggleWishlist, onOrderNow }: ResultGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ResultCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass-panel flex flex-col items-center gap-2 rounded-xl3 px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">No results match these filters</p>
        <p className="text-sm text-ink-muted dark:text-ink-muted-dark">
          Try clearing a filter or searching for something else.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <ResultCard
          key={item.id}
          item={item}
          index={i}
          isWishlisted={wishlistedIds.has(item.id)}
          onToggleWishlist={onToggleWishlist}
          onOrderNow={onOrderNow}
        />
      ))}
    </div>
  );
}
