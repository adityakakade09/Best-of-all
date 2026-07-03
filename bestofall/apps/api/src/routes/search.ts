import { Router } from 'express';
import { z } from 'zod';
import { PLATFORMS } from '@bestofall/shared';
import { asyncHandler } from '../utils/asyncHandler';
import { runSearch } from '../services/searchAggregator';
import { optionalAuth } from '../middleware/auth';
import { query } from '../db/pool';

export const searchRouter = Router();

const searchSchema = z.object({
  query: z.string().min(1).max(200),
  category: z
    .enum(['food', 'groceries', 'medicines', 'electronics', 'fashion', 'gifts', 'other'])
    .optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
  sort: z
    .enum([
      'relevance',
      'price_low',
      'price_high',
      'delivery_fast',
      'rating_high',
      'discount_high',
      'distance_near',
      'popularity',
    ])
    .optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  freeDeliveryOnly: z.coerce.boolean().optional(),
  inStockOnly: z.coerce.boolean().optional(),
  minRating: z.coerce.number().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  brands: z.string().optional(), // comma separated
  platforms: z.string().optional(), // comma separated
});

searchRouter.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const q = searchSchema.parse(req.query);

    const response = await runSearch({
      query: q.query,
      category: q.category,
      page: q.page,
      pageSize: q.pageSize,
      sort: q.sort,
      location: q.lat !== undefined && q.lng !== undefined ? { lat: q.lat, lng: q.lng } : undefined,
      filters: {
        freeDeliveryOnly: q.freeDeliveryOnly,
        inStockOnly: q.inStockOnly,
        minRating: q.minRating,
        minPrice: q.minPrice,
        maxPrice: q.maxPrice,
        brands: q.brands?.split(',').filter(Boolean),
        platforms: q.platforms?.split(',').filter(Boolean),
      },
    });

    // Fire-and-forget: log to search history (works for both logged-in and anonymous users)
    void query(
      `INSERT INTO search_history (user_id, query, category, result_count) VALUES ($1, $2, $3, $4)`,
      [req.auth?.sub ?? null, q.query, response.category, response.total]
    ).catch(() => undefined);

    res.json({ success: true, data: response });
  })
);

searchRouter.get('/platforms', (_req, res) => {
  res.json({ success: true, data: PLATFORMS });
});

const redirectSchema = z.object({
  platformId: z.string(),
  itemId: z.string(),
  query: z.string().optional(),
  price: z.number().optional(),
});

searchRouter.post(
  '/redirect',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const body = redirectSchema.parse(req.body);
    await query(
      `INSERT INTO order_redirects (user_id, platform_id, item_id, query, price) VALUES ($1, $2, $3, $4, $5)`,
      [req.auth?.sub ?? null, body.platformId, body.itemId, body.query ?? null, body.price ?? null]
    );
    res.json({ success: true, data: { tracked: true } });
  })
);
