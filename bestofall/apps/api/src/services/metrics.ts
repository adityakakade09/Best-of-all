import { query } from '../db/pool';
import { logger } from '../config/logger';

interface MetricEvent {
  platformId: string;
  latencyMs: number;
  success: boolean;
}

// Simple in-memory buffer flushed on an interval, so a burst of concurrent
// searches doesn't hammer Postgres with one INSERT per provider call.
const buffer: MetricEvent[] = [];
const FLUSH_INTERVAL_MS = 5000;
const MAX_BUFFER = 500;

export function recordPlatformMetric(platformId: string, latencyMs: number, success: boolean) {
  buffer.push({ platformId, latencyMs, success });
  if (buffer.length >= MAX_BUFFER) void flush();
}

async function flush() {
  if (buffer.length === 0) return;
  const batch = buffer.splice(0, buffer.length);
  try {
    const values = batch
      .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
      .join(',');
    const params = batch.flatMap((m) => [m.platformId, m.latencyMs, m.success]);
    await query(
      `INSERT INTO platform_metrics (platform_id, latency_ms, success) VALUES ${values}`,
      params
    );
  } catch (err) {
    logger.warn({ err }, 'Failed to flush platform metrics');
  }
}

setInterval(() => void flush(), FLUSH_INTERVAL_MS).unref();
