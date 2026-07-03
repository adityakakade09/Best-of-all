import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { query } from '../db/pool';

export const addressesRouter = Router();
addressesRouter.use(requireAuth);

addressesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [req.auth!.sub]
    );
    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        label: r.label,
        addressLine: r.address_line,
        city: r.city,
        state: r.state,
        pincode: r.pincode,
        location: { lat: r.lat, lng: r.lng },
        isDefault: r.is_default,
      })),
    });
  })
);

const addressSchema = z.object({
  label: z.string().min(1).max(60),
  addressLine: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(3).max(12),
  lat: z.number(),
  lng: z.number(),
  isDefault: z.boolean().optional(),
});

addressesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = addressSchema.parse(req.body);
    if (body.isDefault) {
      await query(`UPDATE addresses SET is_default = false WHERE user_id = $1`, [req.auth!.sub]);
    }
    const { rows } = await query(
      `INSERT INTO addresses (user_id, label, address_line, city, state, pincode, lat, lng, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [
        req.auth!.sub,
        body.label,
        body.addressLine,
        body.city,
        body.state,
        body.pincode,
        body.lat,
        body.lng,
        body.isDefault ?? false,
      ]
    );
    res.status(201).json({ success: true, data: { id: rows[0].id } });
  })
);

addressesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await query(`DELETE FROM addresses WHERE id = $1 AND user_id = $2`, [req.params.id, req.auth!.sub]);
    res.json({ success: true, data: { removed: true } });
  })
);
