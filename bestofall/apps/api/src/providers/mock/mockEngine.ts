import { Category, GeoPoint, PlatformMeta, SearchResultItem } from '@bestofall/shared';

/**
 * Deterministic mock data engine.
 *
 * Every platform that lacks a public API is represented by a
 * `createMockProvider(platformMeta, tuning)` provider (see mockProviderFactory.ts)
 * powered by this engine. Results are seeded off (platformId + query + index)
 * so the *same* search returns stable, realistic-looking results across
 * requests (good for demos & tests) while still varying sensibly across
 * platforms and queries — never scraped or copied from any real site.
 */

// --- seeded PRNG (mulberry32) ------------------------------------------------
function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededRandom(...parts: string[]): () => number {
  return mulberry32(hashSeed(parts.join('|')));
}

const randInt = (rng: () => number, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

const randFloat = (rng: () => number, min: number, max: number, decimals = 1) => {
  const val = rng() * (max - min) + min;
  return Number(val.toFixed(decimals));
};

const pick = <T>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];

// --- catalogue tuning per category ------------------------------------------

interface CategoryTuning {
  priceRange: [number, number];
  etaRangeMinutes: [number, number];
  brands: string[];
  variantSuffixes: string[];
  imageSeeds: string[];
}

const CATEGORY_TUNING: Record<Category, CategoryTuning> = {
  food: {
    priceRange: [99, 799],
    etaRangeMinutes: [15, 55],
    brands: ['Chef Special', "Tonight's Kitchen", 'House Recipe', 'Signature'],
    variantSuffixes: ['(Regular)', '(Large)', '- Combo', '- Family Pack', '(Serves 2)'],
    imageSeeds: ['food1', 'food2', 'food3', 'food4', 'food5'],
  },
  groceries: {
    priceRange: [19, 899],
    etaRangeMinutes: [8, 40],
    brands: ['Amul', 'Nestle', 'ITC', 'Tata', 'Fresho', 'Local Farm'],
    variantSuffixes: ['500g', '1kg', 'Pack of 2', '250ml', '1L', 'Combo Pack'],
    imageSeeds: ['grocery1', 'grocery2', 'grocery3', 'grocery4'],
  },
  medicines: {
    priceRange: [29, 1499],
    etaRangeMinutes: [20, 90],
    brands: ['Cipla', 'Sun Pharma', 'Dr Reddy', "Mankind", 'Generic'],
    variantSuffixes: ['Strip of 10', 'Bottle 100ml', 'Pack of 15', '10 Tablets'],
    imageSeeds: ['med1', 'med2', 'med3'],
  },
  electronics: {
    priceRange: [499, 149999],
    etaRangeMinutes: [60, 4320],
    brands: ['Samsung', 'Apple', 'OnePlus', 'Sony', 'boAt', 'JBL', 'Xiaomi'],
    variantSuffixes: ['128GB', '256GB', 'Black', 'Silver', 'Pro Edition', 'with Warranty'],
    imageSeeds: ['tech1', 'tech2', 'tech3', 'tech4'],
  },
  fashion: {
    priceRange: [299, 12999],
    etaRangeMinutes: [90, 5760],
    brands: ['Nike', 'Adidas', 'Puma', 'H&M', 'Levis', 'Zara', 'Roadster'],
    variantSuffixes: ['UK 7', 'UK 8', 'UK 9', 'M', 'L', 'XL', 'Slim Fit'],
    imageSeeds: ['fashion1', 'fashion2', 'fashion3', 'fashion4'],
  },
  gifts: {
    priceRange: [199, 5999],
    etaRangeMinutes: [120, 2880],
    brands: ['Archies', 'FNP', 'IGP', 'Handpicked'],
    variantSuffixes: ['Gift Wrapped', 'with Greeting Card', 'Personalized', 'Deluxe Box'],
    imageSeeds: ['gift1', 'gift2', 'gift3'],
  },
  other: {
    priceRange: [99, 9999],
    etaRangeMinutes: [30, 2880],
    brands: ['Generic', 'Popular Pick', 'Trending'],
    variantSuffixes: ['Standard', 'Premium', 'Value Pack'],
    imageSeeds: ['misc1', 'misc2', 'misc3'],
  },
};

export interface MockGenerationOptions {
  platform: PlatformMeta;
  query: string;
  category: Category;
  location?: GeoPoint;
  count: number;
}

function titleCase(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function generateMockResults(opts: MockGenerationOptions): SearchResultItem[] {
  const { platform, query, category, location, count } = opts;
  const tuning = CATEGORY_TUNING[category] ?? CATEGORY_TUNING.other;
  const results: SearchResultItem[] = [];

  for (let i = 0; i < count; i++) {
    const rng = seededRandom(platform.id, query.toLowerCase(), String(i));

    const brand = pick(rng, tuning.brands);
    const suffix = pick(rng, tuning.variantSuffixes);
    const basePrice = randInt(rng, tuning.priceRange[0], tuning.priceRange[1]);
    const hasDiscount = rng() > 0.35;
    const discountPercent = hasDiscount ? randInt(rng, 5, 55) : 0;
    const originalPrice = hasDiscount ? Math.round(basePrice / (1 - discountPercent / 100)) : undefined;

    const isQuickCommerceOrFood = platform.type === 'quick_commerce' || platform.type === 'food_delivery';
    const etaMinutes = randInt(rng, tuning.etaRangeMinutes[0], tuning.etaRangeMinutes[1]);
    const distanceKm = isQuickCommerceOrFood || location
      ? randFloat(rng, 0.4, 12, 1)
      : undefined;

    const deliveryFeeRoll = rng();
    const freeDeliveryEligible = deliveryFeeRoll > 0.55 || basePrice > 499;
    const deliveryFee = freeDeliveryEligible ? 0 : randInt(rng, 15, 79);

    const rating = randFloat(rng, 3.2, 5.0, 1);
    const ratingCount = randInt(rng, 12, 48000);
    const popularityScore = randInt(rng, 20, 100);
    const inStock = rng() > 0.08;

    const imgSeed = `${pick(rng, tuning.imageSeeds)}-${platform.id}-${i}`;
    const sku = `${platform.id}-${hashSeed(query + i).toString(36)}`;

    results.push({
      id: `${platform.id}:${sku}`,
      platformId: platform.id,
      platformName: platform.name,
      category,
      title: `${titleCase(query)} ${suffix}`.trim(),
      description: `${brand} • Sold via ${platform.name}`,
      image: `https://picsum.photos/seed/${encodeURIComponent(imgSeed)}/400/400`,
      brand,
      price: basePrice,
      originalPrice,
      discountPercent: discountPercent || undefined,
      currency: 'INR',
      deliveryFee,
      freeDeliveryEligible,
      etaMinutes,
      rating,
      ratingCount,
      distanceKm,
      inStock,
      popularityScore,
      signalScore: 0, // filled in later by computeSignalScores()
      deepLink: `${platform.affiliateBaseUrl ?? 'https://example.com'}/search?q=${encodeURIComponent(
        query
      )}&ref=bestofall`,
    });
  }

  return results;
}
