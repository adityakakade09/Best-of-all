import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 200, 2000),
  lazyConnect: false,
});

redis.on('error', (err) => logger.error({ err }, 'Redis connection error'));
redis.on('connect', () => logger.info('Redis connected'));

/** Get + parse JSON from cache, or null if missing/invalid. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    logger.warn({ err, key }, 'cacheGet failed');
    return null;
  }
}

/** Set JSON in cache with a TTL in seconds. */
export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    logger.warn({ err, key }, 'cacheSet failed');
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    logger.warn({ err, key }, 'cacheDel failed');
  }
}

/** Build a deterministic cache key for a search request. */
export function buildSearchCacheKey(params: Record<string, unknown>): string {
  const normalized = Object.keys(params)
    .sort()
    .map((k) => `${k}=${JSON.stringify(params[k])}`)
    .join('&');
  return `search:${normalized}`;
}
