import { useCallback, useEffect, useState } from 'react';
import { SearchResultItem, WishlistItem } from '@bestofall/shared';
import { api } from '@/lib/apiClient';
import { useAuthStore } from '@/lib/authStore';
import toast from 'react-hot-toast';

export function useWishlist() {
  const { user } = useAuthStore();
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    api
      .get<WishlistItem[]>('/wishlist')
      .then((items) => setIds(new Set(items.map((i) => i.item.id))))
      .catch(() => undefined);
  }, [user]);

  const toggle = useCallback(
    async (item: SearchResultItem) => {
      if (!user) {
        toast.error('Sign in to save items to your wishlist');
        return;
      }
      const isSaved = ids.has(item.id);
      setIds((prev) => {
        const next = new Set(prev);
        isSaved ? next.delete(item.id) : next.add(item.id);
        return next;
      });
      try {
        if (isSaved) {
          await api.delete(`/wishlist/${encodeURIComponent(item.id)}`);
          toast.success('Removed from wishlist');
        } else {
          await api.post('/wishlist', { itemId: item.id, item });
          toast.success('Saved to wishlist');
        }
      } catch {
        // revert optimistic update on failure
        setIds((prev) => {
          const next = new Set(prev);
          isSaved ? next.add(item.id) : next.delete(item.id);
          return next;
        });
        toast.error('Something went wrong — please try again');
      }
    },
    [ids, user]
  );

  return { wishlistedIds: ids, toggle };
}
