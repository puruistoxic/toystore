/**
 * Migration script to add price_includes_gst column to products table
 * This allows products to have prices that already include GST
 * 
 * Usage: node server/scripts/add-price-includes-gst.js [--default-true]
 * 
 * --default-true: Set all existing products to have GST-inclusive prices (default: false)
 */

const { getPool } = require('../db');

async function addPriceIncludesGstColumn(defaultToTrue = false) {
  const pool = getPool();
  
  try {
    console.log('Adding price_includes_gst column to products table...');
    
    // Check if column already exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'price_includes_gst'
    `);
    
    if (columns.length > 0) {
      console.log('Column price_includes_gst already exists. Skipping...');
      return;
    }
    
    // Add the column
    await pool.execute(`
      ALTER TABLE products 
      ADD COLUMN price_includes_gst BOOLEAN DEFAULT FALSE 
      AFTER price
    `);
    
    console.log('✓ Column price_includes_gst added successfully');
    
    // If defaultToTrue, update all existing products
    if (defaultToTrue) {
      console.log('Setting all existing products to have GST-inclusive prices...');
      const [result] = await pool.execute(`
        UPDATE products 
        SET price_includes_gst = TRUE 
        WHERE price_includes_gst IS NULL OR price_includes_gst = FALSE
      `);
      console.log(`✓ Updated ${result.affectedRows} products to have GST-inclusive prices`);
    } else {
      console.log('✓ All existing products default to GST-exclusive prices (price_includes_gst = FALSE)');
      console.log('  You can update individual products through the admin interface');
    }
    
    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Error adding price_includes_gst column:', error);
    throw error;
  }
}

// Run migration
const args = process.argv.slice(2);
const defaultToTrue = args.includes('--default-true');

addPriceIncludesGstColumn(defaultToTrue)
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
