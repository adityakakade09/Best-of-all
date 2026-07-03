import { pool } from './pool';
import { logger } from '../config/logger';

async function seed() {
  logger.info('Seeding database with demo data...');

  await pool.query(
    `INSERT INTO users (phone, name, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (phone) DO NOTHING`,
    ['+919999999999', 'BestOfAll Admin']
  );

  await pool.query(
    `INSERT INTO users (phone, name, role)
     VALUES ($1, $2, 'user')
     ON CONFLICT (phone) DO NOTHING`,
    ['+919876543210', 'Demo User']
  );

  logger.info('✅ Seed complete. Demo admin: +919999999999 (dev OTP: 123456)');
  await pool.end();
}

seed().catch((err) => {
  logger.error({ err }, '❌ Seed failed');
  process.exit(1);
});
