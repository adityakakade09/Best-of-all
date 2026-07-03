import dotenv from 'dotenv';
dotenv.config();

function required(name: string, fallback?: string): string {
  const val = process.env[name] ?? fallback;
  if (val === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[config] Missing env var ${name} — using empty string. Set it in .env for production.`);
    return '';
  }
  return val;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT ?? '4000', 10),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',

  databaseUrl: required('DATABASE_URL', 'postgresql://bestofall:bestofall@localhost:5432/bestofall'),
  redisUrl: required('REDIS_URL', 'redis://localhost:6379'),

  jwtAccessSecret: required('JWT_ACCESS_SECRET', 'dev_access_secret'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET', 'dev_refresh_secret'),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  },
  authDevMode: (process.env.AUTH_DEV_MODE ?? 'true') === 'true',

  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',

  searchCacheTtl: parseInt(process.env.SEARCH_CACHE_TTL ?? '120', 10),

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '120', 10),
  },
};
