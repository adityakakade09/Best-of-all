import fs from 'fs';
import path from 'path';
import { pool } from './pool';
import { logger } from '../config/logger';

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  logger.info('Applying schema.sql to database...');
  const client = await pool.connect();
  try {
    await client.query(sql);
    logger.info('✅ Migration complete.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  logger.error({ err }, '❌ Migration failed');
  process.exit(1);
});
