import { describe, expect, it } from 'vitest';
import { computeSignalScores } from '@bestofall/shared';
import type { SearchResultItem } from '@bestofall/shared';

function makeItem(overrides: Partial<SearchResultItem>): SearchResultItem {
  return {
    id: 'p:1',
    platformId: 'p',
    platformName: 'Platform',
    category: 'electronics',
    title: 'Item',
    image: 'https://example.com/x.png',
    price: 1000,
    currency: 'INR',
    deliveryFee: 0,
    freeDeliveryEligible: true,
    etaMinutes: 60,
    rating: 4.0,
    ratingCount: 100,
    inStock: true,
    popularityScore: 50,
    signalScore: 0,
    deepLink: 'https://example.com',
    ...overrides,
  };
}

describe('computeSignalScores', () => {
  it('gives the cheapest, fastest, best-rated item the highest score', () => {
    const items = [
      makeItem({ id: 'a:1', platformId: 'a', price: 500, etaMinutes: 20, rating: 4.8 }),
      makeItem({ id: 'b:1', platformId: 'b', price: 2000, etaMinutes: 90, rating: 3.5 }),
    ];
    const scored = computeSignalScores(items);
    const best = scored.find((i) => i.id === 'a:1')!;
    const worst = scored.find((i) => i.id === 'b:1')!;
    expect(best.signalScore).toBeGreaterThan(worst.signalScore);
    expect(best.badges).toContain('best_overall');
  });

  it('assigns lowest_price badge to the cheapest item', () => {
    const items = [
      makeItem({ id: 'a:1', platformId: 'a', price: 300 }),
      makeItem({ id: 'b:1', platformId: 'b', price: 900 }),
    ];
    const scored = computeSignalScores(items);
    expect(scored.find((i) => i.id === 'a:1')!.badges).toContain('lowest_price');
  });

  it('handles a single-item result set without dividing by zero', () => {
    const items = [makeItem({ id: 'a:1' })];
    const scored = computeSignalScores(items);
    expect(scored[0].signalScore).toBeGreaterThanOrEqual(0);
    expect(scored[0].badges).toContain('best_overall');
  });

  it('returns an empty array unchanged', () => {
    expect(computeSignalScores([])).toEqual([]);
  });
});
