// Update HSN codes for existing products
// Run with: node server/scripts/update-product-hsn.js

const { initDatabase, getPool } = require('../db');

// HSN code mapping for products by name pattern
const hsnMapping = {
  // CCTV Cameras - 8528
  'camera': '8528',
  'dvr': '8528',
  'nvr': '8528',
  'cctv': '8528',
  'surveillance': '8528',
  'recorder': '8528',
  'ip camera': '8528',
  'analog camera': '8528',
  'wireless camera': '8528',
  
  // GPS Devices - 8526
  'gps': '8526',
  'tracker': '8526',
  'tracking': '8526',
  
  // Installation Services - 9983
  'installation': '9983',
  'install': '9983',
  'setup': '9983',
  'visit charge': '9983',
  'jiofiber': '9983',
  'jio wifi': '9983',
  'internet service': '9983',
  'connection': '9983',
  'software service': '9983',
  'network setup': '9983',
  
  // Maintenance Services - 9987
  'maintenance': '9987',
  'service': '9987',
  'repair': '9987',
  'troubleshooting': '9987',
  'cleaning': '9987',
  'upgrade': '9987',
  'recovery': '9987',
  'removal': '9987',
  'it support': '9987',
  
  // Security Systems - 8531
  'door phone': '8531',
  'door lock': '8531',
  'access control': '8531',
  'alarm': '8531',
  'security system': '8531',
  
  // Accessories - 8528
  'cable': '8528',
  'connector': '8528',
  'adapter': '8528',
  'mount': '8528',
  'bracket': '8528',
  'power supply': '8528',
  'switch': '8528',
  'hard disk': '8528',
  'hdd': '8528',
  'poe switch': '8528',
  'router': '8528',
  'extender': '8528'
};

function getHSNCode(productName, category, defaultHSN = null) {
  const nameLower = productName.toLowerCase();
  const categoryLower = (category || '').toLowerCase();
  
  // Check name patterns
  for (const [pattern, hsn] of Object.entries(hsnMapping)) {
    if (nameLower.includes(pattern) || categoryLower.includes(pattern)) {
      return hsn;
    }
  }
  
  return defaultHSN;
}

async function updateProductHSN() {
  try {
    console.log('[HSN Update] Initializing database...');
    await initDatabase();
    const pool = getPool();

    // Get all products
    const [products] = await pool.execute(
      'SELECT id, name, category, hsn_code FROM products'
    );

    console.log(`[HSN Update] Found ${products.length} products to check...`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const product of products) {
      try {
        // Skip if HSN code already exists
        if (product.hsn_code && product.hsn_code.trim() !== '') {
          skipped++;
          continue;
        }

        // Determine HSN code
        const hsnCode = getHSNCode(product.name, product.category);
        
        if (!hsnCode) {
          console.log(`[HSN Update] ⚠ No HSN code found for: ${product.name}`);
          skipped++;
          continue;
        }

        // Update product
        await pool.execute(
          'UPDATE products SET hsn_code = ? WHERE id = ?',
          [hsnCode, product.id]
        );

        console.log(`[HSN Update] ✓ Updated: ${product.name} → HSN: ${hsnCode}`);
        updated++;
      } catch (error) {
        console.error(`[HSN Update] ✗ Error updating ${product.name}:`, error.message);
        errors++;
      }
    }

    console.log('\n[HSN Update] ✓ Update completed!');
    console.log(`[HSN Update] Updated: ${updated}`);
    console.log(`[HSN Update] Skipped (already has HSN): ${skipped}`);
    console.log(`[HSN Update] Errors: ${errors}`);
    
    process.exit(0);
  } catch (error) {
    console.error('[HSN Update] ✗ Update failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  updateProductHSN();
}

module.exports = { updateProductHSN };


