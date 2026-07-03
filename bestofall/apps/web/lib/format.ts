import { ResultBadge } from '@bestofall/shared';

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatEta(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''}`;
  const days = Math.round(hours / 24);
  return `${days} day${days > 1 ? 's' : ''}`;
}

export function formatDistance(km?: number): string | null {
  if (km === undefined) return null;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export const BADGE_LABELS: Record<ResultBadge, string> = {
  best_overall: 'Best Overall',
  lowest_price: 'Lowest Price',
  fastest_delivery: 'Fastest',
  top_rated: 'Top Rated',
  biggest_discount: 'Biggest Discount',
  free_delivery: 'Free Delivery',
  nearest: 'Nearest',
};

export const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food',
  groceries: 'Groceries',
  medicines: 'Medicines',
  electronics: 'Electronics',
  fashion: 'Fashion',
  gifts: 'Gifts',
  other: 'Everything Else',
};

export const SORT_LABELS: Record<string, string> = {
  relevance: 'Best Match',
  price_low: 'Lowest Price',
  price_high: 'Highest Price',
  delivery_fast: 'Fastest Delivery',
  rating_high: 'Highest Rated',
  discount_high: 'Maximum Discount',
  distance_near: 'Nearest to Me',
  popularity: 'Most Popular',
};
