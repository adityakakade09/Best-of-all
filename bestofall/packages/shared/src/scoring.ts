import { SearchResultItem, ResultBadge } from './types';

/**
 * The "Signal Score" is BestOfAll's composite ranking: it blends price
 * competitiveness, delivery speed, rating, discount and distance into a
 * single 0-100 number so results can be ranked by genuine "best overall"
 * value rather than any single axis. It powers the SignalRing UI component
 * and the default `relevance` sort.
 */
export interface ScoringWeights {
  price: number;
  speed: number;
  rating: number;
  discount: number;
  distance: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  price: 0.32,
  speed: 0.24,
  rating: 0.22,
  discount: 0.14,
  distance: 0.08,
};

const normalizeInverse = (value: number, min: number, max: number): number => {
  if (max === min) return 1;
  return clamp01(1 - (value - min) / (max - min));
};

const normalize = (value: number, min: number, max: number): number => {
  if (max === min) return 1;
  return clamp01((value - min) / (max - min));
};

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

/**
 * Computes signalScore (0-100) for every item in a result set, relative to
 * the min/max of that set — so scores are always meaningfully comparable
 * within a single search rather than against a fixed global scale.
 */
export function computeSignalScores(
  items: SearchResultItem[],
  weights: ScoringWeights = DEFAULT_WEIGHTS
): SearchResultItem[] {
  if (items.length === 0) return items;

  const prices = items.map((i) => i.price);
  const etas = items.map((i) => i.etaMinutes);
  const ratings = items.map((i) => i.rating);
  const discounts = items.map((i) => i.discountPercent ?? 0);
  const distances = items.map((i) => i.distanceKm ?? 0);

  const priceMin = Math.min(...prices);
  const priceMax = Math.max(...prices);
  const etaMin = Math.min(...etas);
  const etaMax = Math.max(...etas);
  const ratingMin = Math.min(...ratings);
  const ratingMax = Math.max(...ratings);
  const discountMin = Math.min(...discounts);
  const discountMax = Math.max(...discounts);
  const distanceMin = Math.min(...distances);
  const distanceMax = Math.max(...distances);

  const scored = items.map((item) => {
    const priceScore = normalizeInverse(item.price, priceMin, priceMax);
    const speedScore = normalizeInverse(item.etaMinutes, etaMin, etaMax);
    const ratingScore = normalize(item.rating, ratingMin, ratingMax);
    const discountScore = normalize(item.discountPercent ?? 0, discountMin, discountMax);
    const distanceScore = normalizeInverse(item.distanceKm ?? 0, distanceMin, distanceMax);

    const composite =
      priceScore * weights.price +
      speedScore * weights.speed +
      ratingScore * weights.rating +
      discountScore * weights.discount +
      distanceScore * weights.distance;

    return { ...item, signalScore: Math.round(composite * 100) };
  });

  return assignBadges(scored, {
    priceMin,
    etaMin,
    ratingMax,
    discountMax,
    distanceMin,
  });
}

function assignBadges(
  items: SearchResultItem[],
  extremes: {
    priceMin: number;
    etaMin: number;
    ratingMax: number;
    discountMax: number;
    distanceMin: number;
  }
): SearchResultItem[] {
  if (items.length === 0) return items;
  const bestOverall = items.reduce((a, b) => (b.signalScore > a.signalScore ? b : a));

  return items.map((item) => {
    const badges: ResultBadge[] = [];
    if (item.id === bestOverall.id) badges.push('best_overall');
    if (item.price === extremes.priceMin) badges.push('lowest_price');
    if (item.etaMinutes === extremes.etaMin) badges.push('fastest_delivery');
    if (item.rating === extremes.ratingMax) badges.push('top_rated');
    if ((item.discountPercent ?? 0) === extremes.discountMax && extremes.discountMax > 0)
      badges.push('biggest_discount');
    if (item.freeDeliveryEligible) badges.push('free_delivery');
    if (item.distanceKm !== undefined && item.distanceKm === extremes.distanceMin)
      badges.push('nearest');
    return { ...item, badges };
  });
}
