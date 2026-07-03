'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { WishlistItem } from '@bestofall/shared';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ResultCard } from '@/components/search/ResultCard';
import { ResultCardSkeleton } from '@/components/search/ResultCardSkeleton';
import { api } from '@/lib/apiClient';
import { Heart } from 'lucide-react';

function WishlistContent() {
  const [items, setItems] = useState<WishlistItem[] | null>(null);

  const load = () => {
    api
      .get<WishlistItem[]>('/wishlist')
      .then(setItems)
      .catch(() => toast.error('Could not load your wishlist'));
  };

  useEffect(load, []);

  const remove = async (itemId: string) => {
    setItems((prev) => prev?.filter((i) => i.item.id !== itemId) ?? null);
    try {
      await api.delete(`/wishlist/${encodeURIComponent(itemId)}`);
    } catch {
      toast.error('Failed to remove item');
      load();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-signal-ember/10 text-signal-ember">
          <Heart className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold">Your wishlist</h1>
          <p className="text-sm text-ink-muted dark:text-ink-muted-dark">Items you&apos;ve saved to compare or order later.</p>
        </div>
      </div>

      {items === null ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ResultCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel rounded-xl3 px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold">Nothing saved yet</p>
          <p className="mt-1 text-sm text-ink-muted dark:text-ink-muted-dark">
            Tap the heart on any result to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((w, i) => (
            <ResultCard
              key={w.item.id}
              item={w.item}
              index={i}
              isWishlisted
              onToggleWishlist={(item) => remove(item.id)}
              onOrderNow={(item) => window.open(item.deepLink, '_blank', 'noopener,noreferrer')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WishlistPage() {
  return (
    <AuthGuard>
      <WishlistContent />
    </AuthGuard>
  );
}
