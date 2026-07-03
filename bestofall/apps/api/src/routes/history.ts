import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { query } from '../db/pool';

export const historyRouter = Router();
historyRouter.use(requireAuth);

historyRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT id, query, category, result_count, searched_at
       FROM search_history WHERE user_id = $1
       ORDER BY searched_at DESC LIMIT 50`,
      [req.auth!.sub]
    );
    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        userId: req.auth!.sub,
        query: r.query,
        category: r.category,
        searchedAt: r.searched_at,
        resultCount: r.result_count,
      })),
    });
  })
);

historyRouter.delete(
  '/',
  asyncHandler(async (req, res) => {
    await query(`DELETE FROM search_history WHERE user_id = $1`, [req.auth!.sub]);
    res.json({ success: true, data: { cleared: true } });
  })
);
