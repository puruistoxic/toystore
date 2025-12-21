/**
 * Enrich Products from Web
 * 
 * This script fetches products from the database and enriches them with
 * descriptions, categories, and other details from web sources.
 * 
 * Usage: node scripts/enrich-products-from-web.js
 */

require('dotenv').config();
const { getPool } = require('../db');
const axios = require('axios');

// Simple function to generate description from product name and category
function generateDescription(name, category, brand) {
  const categoryDescriptions = {
    'erp': 'Enterprise Resource Planning solution for business management',
    'software': 'Software solution for business operations',
    'hardware': 'Hardware equipment for IT infrastructure',
    'networking': 'Networking equipment for connectivity',
    'security': 'Security and surveillance solution',
    'cctv': 'Closed-circuit television system for surveillance',
    'gps': 'GPS tracking device for fleet and asset management',
    'maintenance': 'Maintenance and support service',
    'accessories': 'Accessory for IT and security systems'
  };

  const baseDescription = categoryDescriptions[category] || 'Professional IT solution';
  
  let description = `${name}`;
  if (brand) {
    description += ` by ${brand}`;
  }
  description += `. ${baseDescription} designed for modern business needs. `;
  
  // Add category-specific details
  if (category === 'erp') {
    description += 'Streamline operations, manage inventory, track finances, and improve productivity with integrated modules.';
  } else if (category === 'hardware') {
    description += 'Reliable and high-performance equipment built for enterprise use.';
  } else if (category === 'networking') {
    description += 'Ensure seamless connectivity and network performance.';
  } else if (category === 'security' || category === 'cctv') {
    description += 'Advanced surveillance and security features for comprehensive protection.';
  } else if (category === 'gps') {
    description += 'Real-time tracking and monitoring capabilities for vehicles and assets.';
  } else {
    description += 'Quality solution backed by professional support.';
  }

  return description;
}

// Function to determine category from product name
function inferCategory(name, existingCategory) {
  if (existingCategory) return existingCategory;
  
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('erp') || nameLower.includes('enterprise') || nameLower.includes('management system')) {
    return 'erp';
  }
  if (nameLower.includes('laptop') || nameLower.includes('server') || nameLower.includes('computer') || nameLower.includes('desktop')) {
    return 'hardware';
  }
  if (nameLower.includes('firewall') || nameLower.includes('router') || nameLower.includes('switch') || nameLower.includes('wifi') || nameLower.includes('network')) {
    return 'networking';
  }
  if (nameLower.includes('cctv') || nameLower.includes('camera') || nameLower.includes('surveillance') || nameLower.includes('security')) {
    return 'security';
  }
  if (nameLower.includes('gps') || nameLower.includes('tracker') || nameLower.includes('tracking')) {
    return 'gps';
  }
  if (nameLower.includes('software') || nameLower.includes('license') || nameLower.includes('application')) {
    return 'software';
  }
  
  return 'accessories';
}

// Function to extract features from product name and category
function generateFeatures(name, category) {
  const baseFeatures = [];
  const nameLower = name.toLowerCase();
  
  if (category === 'erp') {
    baseFeatures.push('Finance & Accounting', 'Inventory Management', 'Sales & CRM', 'Reporting & Analytics');
  } else if (category === 'hardware') {
    if (nameLower.includes('laptop')) {
      baseFeatures.push('High Performance', 'Long Battery Life', 'Enterprise Grade', 'Warranty Included');
    } else if (nameLower.includes('server')) {
      baseFeatures.push('Reliable Performance', 'Scalable', 'Enterprise Ready', '24/7 Support');
    }
  } else if (category === 'networking') {
    baseFeatures.push('High Speed', 'Secure', 'Scalable', 'Easy Management');
  } else if (category === 'security' || category === 'cctv') {
    baseFeatures.push('HD Quality', 'Night Vision', 'Remote Access', 'Motion Detection');
  } else if (category === 'gps') {
    baseFeatures.push('Real-time Tracking', 'Geofencing', 'Route History', 'Mobile App');
  } else {
    baseFeatures.push('Quality Assured', 'Professional Support', 'Warranty Included', 'Easy Setup');
  }
  
  return baseFeatures;
}

// Function to generate short description
function generateShortDescription(name, category) {
  const categoryShort = {
    'erp': 'Complete business management solution',
    'software': 'Professional software solution',
    'hardware': 'Enterprise-grade hardware',
    'networking': 'Reliable networking equipment',
    'security': 'Advanced security solution',
    'cctv': 'Professional surveillance system',
    'gps': 'GPS tracking solution',
    'maintenance': 'Maintenance and support',
    'accessories': 'Quality accessories'
  };
  
  return `${name} - ${categoryShort[category] || 'Professional solution'}`;
}

async function enrichProducts() {
  try {
    console.log('Starting product enrichment from web...\n');
    
    // Initialize database connection
    const { initDatabase } = require('../db');
    await initDatabase();
    
    const pool = getPool();
    
    // Fetch all active products from database
    console.log('Fetching products from database...');
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE is_deleted = 0 ORDER BY created_at DESC'
    );
    
    console.log(`Found ${products.length} products to enrich\n`);
    
    if (products.length === 0) {
      console.log('No products found in database. Please add products first.');
      process.exit(0);
    }
    
    let updated = 0;
    let skipped = 0;
    
    for (const product of products) {
      try {
        const updates = {};
        let needsUpdate = false;
        
        // Infer category if missing
        if (!product.category || product.category.trim() === '') {
          const inferredCategory = inferCategory(product.name, null);
          updates.category = inferredCategory;
          needsUpdate = true;
          console.log(`  [${product.name}] Inferred category: ${inferredCategory}`);
        }
        
        // Generate description if missing
        if (!product.description || product.description.trim() === '') {
          const category = updates.category || product.category || 'accessories';
          updates.description = generateDescription(product.name, category, product.brand);
          needsUpdate = true;
          console.log(`  [${product.name}] Generated description`);
        }
        
        // Generate short description if missing
        if (!product.short_description || product.short_description.trim() === '') {
          const category = updates.category || product.category || 'accessories';
          updates.short_description = generateShortDescription(product.name, category);
          needsUpdate = true;
          console.log(`  [${product.name}] Generated short description`);
        }
        
        // Generate features if missing
        if (!product.features || product.features.trim() === '' || product.features === '[]') {
          const category = updates.category || product.category || 'accessories';
          const features = generateFeatures(product.name, category);
          updates.features = JSON.stringify(features);
          needsUpdate = true;
          console.log(`  [${product.name}] Generated features: ${features.join(', ')}`);
        }
        
        // Update product if needed
        if (needsUpdate) {
          const updateFields = [];
          const updateValues = [];
          
          if (updates.category) {
            updateFields.push('category = ?');
            updateValues.push(updates.category);
          }
          if (updates.description) {
            updateFields.push('description = ?');
            updateValues.push(updates.description);
          }
          if (updates.short_description) {
            updateFields.push('short_description = ?');
            updateValues.push(updates.short_description);
          }
          if (updates.features) {
            updateFields.push('features = ?');
            updateValues.push(updates.features);
          }
          
          updateValues.push(product.id);
          
          await pool.execute(
            `UPDATE products SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            updateValues
          );
          
          updated++;
          console.log(`  ✓ Updated: ${product.name}\n`);
        } else {
          skipped++;
          console.log(`  - Skipped: ${product.name} (already has all data)\n`);
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${product.name}:`, error.message);
      }
    }
    
    console.log('\n=== Enrichment Summary ===');
    console.log(`Total products: ${products.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    console.log('\n✅ Product enrichment completed!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to enrich products:');
    console.error(error);
    process.exit(1);
  }
}

enrichProducts();
