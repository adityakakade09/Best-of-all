import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { pool } from './db/pool';
import { redis } from './cache/redis';

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(`🚀 BestOfAll API listening on port ${env.port} [${env.nodeEnv}]`);
  logger.info(`   Health check: http://localhost:${env.port}/health`);
  if (env.authDevMode) {
    logger.info('   Auth dev mode is ON — OTP is always 123456. Set AUTH_DEV_MODE=false for production.');
  }
});

function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully...`);
  server.close(async () => {
    try {
      await pool.end();
      redis.disconnect();
      logger.info('Shutdown complete.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  });

  // Force-exit if graceful shutdown hangs
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});
