/**
 * Soft-deletes every row in products (sets is_deleted, clears is_active).
 * Master categories/brands are untouched.
 *
 * Run from repo root: node server/scripts/clear-all-products.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { initDatabase, getPool } = require('../db');

async function main() {
  await initDatabase();
  const pool = getPool();
  const [result] = await pool.execute(
    `UPDATE products
     SET is_deleted = 1, is_active = 0, deleted_at = NOW()
     WHERE is_deleted = 0`
  );
  console.log(`[clear-all-products] Soft-deleted rows: ${result.affectedRows}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[clear-all-products]', err);
  process.exit(1);
});
