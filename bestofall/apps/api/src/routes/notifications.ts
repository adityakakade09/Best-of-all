import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { query } from '../db/pool';

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.auth!.sub]
    );
    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        userId: req.auth!.sub,
        type: r.type,
        title: r.title,
        body: r.body,
        read: r.read,
        createdAt: r.created_at,
        meta: r.meta,
      })),
    });
  })
);

notificationsRouter.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    await query(`UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`, [
      req.params.id,
      req.auth!.sub,
    ]);
    res.json({ success: true, data: { read: true } });
  })
);

notificationsRouter.patch(
  '/read-all',
  asyncHandler(async (req, res) => {
    await query(`UPDATE notifications SET read = true WHERE user_id = $1`, [req.auth!.sub]);
    res.json({ success: true, data: { readAll: true } });
  })
);
