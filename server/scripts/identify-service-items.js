/**
 * Identify Service Items in Products Table
 * 
 * This script identifies products that are actually services and should be
 * moved to the services table or have their category updated.
 * 
 * Usage: node scripts/identify-service-items.js [--fix]
 *   --fix: Automatically update categories for identified service items
 */

require('dotenv').config();
const { getPool } = require('../db');

// Service indicators
const SERVICE_KEYWORDS = [
  'installation',
  'service',
  'visit charge',
  'visit',
  'maintenance',
  'repair',
  'consultation',
  'support',
  'setup',
  'configuration',
  'training',
  'amc',
  'annual maintenance'
];

const SERVICE_CATEGORIES = [
  'Installation Service',
  'Maintenance Service',
  'Visit Charge',
  'Software Service',
  'Internet Service',
  'Service'
];

function isServiceItem(product) {
  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  
  // Check category
  if (SERVICE_CATEGORIES.some(cat => category.includes(cat.toLowerCase()))) {
    return true;
  }
  
  // Check name for service keywords
  if (SERVICE_KEYWORDS.some(keyword => name.includes(keyword))) {
    // But allow if it's clearly a product (e.g., "Service Router" is a product)
    if (name.includes('router') || name.includes('switch') || name.includes('server') || 
        name.includes('camera') || name.includes('device') || name.includes('equipment')) {
      return false;
    }
    return true;
  }
  
  // Check description
  if (description.includes('service') && (
    description.includes('installation') ||
    description.includes('visit') ||
    description.includes('maintenance') ||
    description.includes('support') ||
    description.includes('setup')
  )) {
    return true;
  }
  
  return false;
}

async function identifyServiceItems() {
  try {
    console.log('Identifying service items in products table...\n');
    
    // Initialize database connection
    const { initDatabase } = require('../db');
    await initDatabase();
    
    const pool = getPool();
    
    // Fetch all products
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE is_deleted = 0 ORDER BY name'
    );
    
    console.log(`Analyzing ${products.length} products...\n`);
    
    const serviceItems = [];
    const productItems = [];
    
    for (const product of products) {
      if (isServiceItem(product)) {
        serviceItems.push(product);
      } else {
        productItems.push(product);
      }
    }
    
    console.log('=== ANALYSIS RESULTS ===\n');
    console.log(`✅ Actual Products: ${productItems.length}`);
    console.log(`⚠️  Service Items (should be in services table): ${serviceItems.length}\n`);
    
    if (serviceItems.length > 0) {
      console.log('SERVICE ITEMS FOUND:\n');
      serviceItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
        console.log(`   Category: ${item.category || 'N/A'}`);
        console.log(`   ID: ${item.id}`);
        console.log('');
      });
      
      // Check if --fix flag is provided
      const shouldFix = process.argv.includes('--fix');
      
      if (shouldFix) {
        console.log('\n=== UPDATING CATEGORIES ===\n');
        let updated = 0;
        
        for (const item of serviceItems) {
          // Determine appropriate service category
          let newCategory = 'Service';
          const name = (item.name || '').toLowerCase();
          
          if (name.includes('installation')) {
            newCategory = 'Installation Service';
          } else if (name.includes('maintenance') || name.includes('amc')) {
            newCategory = 'Maintenance Service';
          } else if (name.includes('visit')) {
            newCategory = 'Visit Charge';
          } else if (name.includes('software') || name.includes('windows') || name.includes('antivirus')) {
            newCategory = 'Software Service';
          } else if (name.includes('internet') || name.includes('jio') || name.includes('broadband')) {
            newCategory = 'Internet Service';
          }
          
          if (item.category !== newCategory) {
            await pool.execute(
              'UPDATE products SET category = ?, updated_at = NOW() WHERE id = ?',
              [newCategory, item.id]
            );
            console.log(`✓ Updated: ${item.name} -> ${newCategory}`);
            updated++;
          }
        }
        
        console.log(`\n✅ Updated ${updated} items`);
      } else {
        console.log('\n💡 Tip: Run with --fix flag to automatically update categories');
        console.log('   Example: node scripts/identify-service-items.js --fix');
      }
    } else {
      console.log('✅ No service items found. All products are correctly categorized!');
    }
    
    console.log('\n✅ Analysis completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to identify service items:');
    console.error(error);
    process.exit(1);
  }
}

identifyServiceItems();

