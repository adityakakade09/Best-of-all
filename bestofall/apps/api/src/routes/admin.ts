import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { query } from '../db/pool';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get(
  '/overview',
  asyncHandler(async (_req, res) => {
    const [users, newUsers, searches, searchesToday, redirects, metrics] = await Promise.all([
      query<{ count: string }>(`SELECT count(*) FROM users`),
      query<{ count: string }>(`SELECT count(*) FROM users WHERE created_at::date = now()::date`),
      query<{ count: string }>(`SELECT count(*) FROM search_history`),
      query<{ count: string }>(`SELECT count(*) FROM search_history WHERE searched_at::date = now()::date`),
      query<{ count: string }>(`SELECT count(*) FROM order_redirects`),
      query<{ avg: string }>(`SELECT avg(latency_ms) FROM platform_metrics WHERE created_at > now() - interval '1 day'`),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: Number(users.rows[0]?.count ?? 0),
        newUsersToday: Number(newUsers.rows[0]?.count ?? 0),
        totalSearches: Number(searches.rows[0]?.count ?? 0),
        searchesToday: Number(searchesToday.rows[0]?.count ?? 0),
        totalOrderRedirects: Number(redirects.rows[0]?.count ?? 0),
        activePlatforms: 14,
        avgResponseTimeMs: Math.round(Number(metrics.rows[0]?.avg ?? 0)),
      },
    });
  })
);

adminRouter.get(
  '/trending-searches',
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      `SELECT query, category, count(*)::int as count
       FROM search_history
       WHERE searched_at > now() - interval '7 days'
       GROUP BY query, category
       ORDER BY count DESC
       LIMIT 15`
    );
    res.json({ success: true, data: rows });
  })
);

adminRouter.get(
  '/platform-performance',
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      `SELECT
         platform_id as "platformId",
         count(*)::int as "requestCount",
         round(avg(latency_ms))::int as "avgLatencyMs",
         round(1.0 - avg(success::int), 3)::float as "errorRate"
       FROM platform_metrics
       WHERE created_at > now() - interval '1 day'
       GROUP BY platform_id
       ORDER BY "requestCount" DESC`
    );
    res.json({ success: true, data: rows });
  })
);

adminRouter.get(
  '/search-trend',
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      `SELECT
         to_char(searched_at::date, 'YYYY-MM-DD') as date,
         count(*)::int as searches,
         count(DISTINCT user_id)::int as "uniqueUsers"
       FROM search_history
       WHERE searched_at > now() - interval '14 days'
       GROUP BY searched_at::date
       ORDER BY date ASC`
    );
    res.json({ success: true, data: rows });
  })
);
