/**
 * Migration Script: JSON Items to Line Items Table
 * 
 * This script creates a line_items table and migrates data from JSON items
 * to the new table structure. This provides better query performance and
 * easier reporting.
 * 
 * WARNING: This is a one-way migration. Make sure to backup your database first!
 * 
 * Usage: node server/scripts/migrate-to-line-items.js [--dry-run]
 */

const { getPool } = require('../db');

async function createLineItemsTable(pool) {
  console.log('Creating line_items table...');
  
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS invoice_line_items (
      id VARCHAR(50) PRIMARY KEY,
      invoice_id VARCHAR(50) NOT NULL,
      proposal_id VARCHAR(50) NULL,
      product_id VARCHAR(255) NULL,
      description VARCHAR(500) NOT NULL,
      hsn_code VARCHAR(50) NULL,
      quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      total DECIMAL(10,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_invoice (invoice_id),
      INDEX idx_proposal (proposal_id),
      INDEX idx_product (product_id),
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS proposal_line_items (
      id VARCHAR(50) PRIMARY KEY,
      proposal_id VARCHAR(50) NOT NULL,
      product_id VARCHAR(255) NULL,
      description VARCHAR(500) NOT NULL,
      hsn_code VARCHAR(50) NULL,
      quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      total DECIMAL(10,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_proposal (proposal_id),
      INDEX idx_product (product_id),
      FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  
  console.log('✓ Line items tables created');
}

async function migrateInvoiceItems(pool, dryRun = false) {
  console.log('\nMigrating invoice items...');
  
  const [invoices] = await pool.execute(`
    SELECT id, invoice_number, items, proposal_id
    FROM invoices
    WHERE is_deleted = 0
  `);
  
  let migrated = 0;
  let skipped = 0;
  
  for (const invoice of invoices) {
    try {
      const items = typeof invoice.items === 'string' 
        ? JSON.parse(invoice.items) 
        : invoice.items;
      
      if (!Array.isArray(items) || items.length === 0) {
        skipped++;
        continue;
      }
      
      if (!dryRun) {
        // Delete existing line items for this invoice (if any)
        await pool.execute('DELETE FROM invoice_line_items WHERE invoice_id = ?', [invoice.id]);
        
        // Insert new line items
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const lineItemId = `${invoice.id}-${i}`;
          
          await pool.execute(`
            INSERT INTO invoice_line_items 
            (id, invoice_id, proposal_id, product_id, description, hsn_code, quantity, price, total)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            lineItemId,
            invoice.id,
            invoice.proposal_id || null,
            item.product_id || null,
            item.description || '',
            item.hsn_code || null,
            parseFloat(item.quantity || 1),
            parseFloat(item.price || 0),
            parseFloat(item.quantity || 1) * parseFloat(item.price || 0)
          ]);
        }
      }
      
      migrated++;
      if (migrated % 100 === 0) {
        console.log(`  Processed ${migrated} invoices...`);
      }
    } catch (error) {
      console.error(`  Error migrating invoice ${invoice.invoice_number}:`, error.message);
      skipped++;
    }
  }
  
  console.log(`✓ Migrated ${migrated} invoices (${skipped} skipped)`);
}

async function migrateProposalItems(pool, dryRun = false) {
  console.log('\nMigrating proposal items...');
  
  const [proposals] = await pool.execute(`
    SELECT id, proposal_number, items
    FROM proposals
    WHERE is_deleted = 0
  `);
  
  let migrated = 0;
  let skipped = 0;
  
  for (const proposal of proposals) {
    try {
      const items = typeof proposal.items === 'string' 
        ? JSON.parse(proposal.items) 
        : proposal.items;
      
      if (!Array.isArray(items) || items.length === 0) {
        skipped++;
        continue;
      }
      
      if (!dryRun) {
        // Delete existing line items for this proposal (if any)
        await pool.execute('DELETE FROM proposal_line_items WHERE proposal_id = ?', [proposal.id]);
        
        // Insert new line items
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const lineItemId = `${proposal.id}-${i}`;
          
          await pool.execute(`
            INSERT INTO proposal_line_items 
            (id, proposal_id, product_id, description, hsn_code, quantity, price, total)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            lineItemId,
            proposal.id,
            item.product_id || null,
            item.description || '',
            item.hsn_code || null,
            parseFloat(item.quantity || 1),
            parseFloat(item.price || 0),
            parseFloat(item.quantity || 1) * parseFloat(item.price || 0)
          ]);
        }
      }
      
      migrated++;
      if (migrated % 100 === 0) {
        console.log(`  Processed ${migrated} proposals...`);
      }
    } catch (error) {
      console.error(`  Error migrating proposal ${proposal.proposal_number}:`, error.message);
      skipped++;
    }
  }
  
  console.log(`✓ Migrated ${migrated} proposals (${skipped} skipped)`);
}

async function migrate(dryRun = false) {
  const pool = getPool();
  
  try {
    console.log('=== Migration: JSON Items to Line Items Table ===\n');
    
    if (dryRun) {
      console.log('⚠️  DRY RUN MODE - No changes will be made\n');
    } else {
      console.log('⚠️  WARNING: This will modify your database!');
      console.log('⚠️  Make sure you have a backup before proceeding!\n');
    }
    
    await createLineItemsTable(pool);
    await migrateInvoiceItems(pool, dryRun);
    await migrateProposalItems(pool, dryRun);
    
    if (dryRun) {
      console.log('\n✓ Dry run completed. No changes were made.');
      console.log('Run without --dry-run to perform the actual migration.');
    } else {
      console.log('\n✓ Migration completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Update your API routes to use line_items table');
      console.log('2. Test thoroughly before removing JSON items column');
      console.log('3. Consider keeping JSON items as backup for a while');
    }
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  
  migrate(dryRun)
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

module.exports = { migrate, createLineItemsTable, migrateInvoiceItems, migrateProposalItems };
