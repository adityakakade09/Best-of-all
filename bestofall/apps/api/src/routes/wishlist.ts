import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { query } from '../db/pool';

export const wishlistRouter = Router();
wishlistRouter.use(requireAuth);

wishlistRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT id, item_id, item_snapshot, added_at FROM wishlist_items WHERE user_id = $1 ORDER BY added_at DESC`,
      [req.auth!.sub]
    );
    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        userId: req.auth!.sub,
        item: r.item_snapshot,
        addedAt: r.added_at,
      })),
    });
  })
);

const addSchema = z.object({
  itemId: z.string(),
  item: z.record(z.unknown()),
});

wishlistRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = addSchema.parse(req.body);
    await query(
      `INSERT INTO wishlist_items (user_id, item_id, item_snapshot)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, item_id) DO UPDATE SET item_snapshot = EXCLUDED.item_snapshot`,
      [req.auth!.sub, body.itemId, JSON.stringify(body.item)]
    );
    res.status(201).json({ success: true, data: { added: true } });
  })
);

wishlistRouter.delete(
  '/:itemId',
  asyncHandler(async (req, res) => {
    await query(`DELETE FROM wishlist_items WHERE user_id = $1 AND item_id = $2`, [
      req.auth!.sub,
      req.params.itemId,
    ]);
    res.json({ success: true, data: { removed: true } });
  })
);
