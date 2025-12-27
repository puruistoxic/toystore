// Migration script to add HSN code column to products table
// Run with: node server/scripts/add-hsn-code-column.js

const { initDatabase, getPool } = require('../db');

async function addHsnCodeColumn() {
  try {
    console.log('[Migration] Initializing database...');
    await initDatabase();
    const pool = getPool();

    console.log('[Migration] Adding hsn_code column to products table...');

    // Check if column already exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'hsn_code'
    `);

    if (columns.length > 0) {
      console.log('[Migration] ✓ Column hsn_code already exists. Skipping...');
      process.exit(0);
    }

    // Add the column
    await pool.execute(`
      ALTER TABLE products 
      ADD COLUMN hsn_code VARCHAR(20) NULL AFTER brand,
      ADD INDEX idx_hsn_code (hsn_code)
    `);

    console.log('[Migration] ✓ Successfully added hsn_code column to products table!');
    process.exit(0);
  } catch (error) {
    console.error('[Migration] ✗ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  addHsnCodeColumn();
}

module.exports = { addHsnCodeColumn };







