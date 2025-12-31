/**
 * Add sequence_number column to invoices table
 * 
 * This script adds an auto-increment sequence_number column to the invoices table.
 * This sequence number will be used to generate invoice numbers in a simple,
 * straightforward way without complex queries or race conditions.
 * 
 * Usage: node scripts/add-invoice-sequence-number.js
 */

require('dotenv').config();
const { getPool } = require('../db');

async function addSequenceNumberColumn() {
  try {
    console.log('Adding sequence_number column to invoices table...\n');
    
    // Initialize database connection
    const { initDatabase } = require('../db');
    await initDatabase();
    
    const pool = getPool();
    
    // Check if column already exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'invoices' 
      AND COLUMN_NAME = 'sequence_number'
    `);
    
    let columnExists = columns.length > 0;
    
    if (columnExists) {
      console.log('✅ sequence_number column already exists in invoices table');
      console.log('Checking for invoices without sequence numbers...\n');
    }
    
    // Get the current maximum sequence number from existing invoices
    // We'll use this to set the AUTO_INCREMENT starting point
    const [maxSequenceRows] = await pool.execute(`
      SELECT MAX(CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(invoice_number, '/', -1), '/', -1) AS UNSIGNED)) as max_seq
      FROM invoices
      WHERE invoice_number REGEXP '^WGSS/[ST]/[0-9]{2}-[0-9]{2}/[0-9]+$'
    `);
    
    const maxSequence = maxSequenceRows[0]?.max_seq || 0;
    const startSequence = maxSequence + 1;
    
    if (!columnExists) {
      console.log(`Current maximum sequence found: ${maxSequence}`);
      console.log(`Will start AUTO_INCREMENT from: ${startSequence}`);
      
      // Add sequence_number column with AUTO_INCREMENT
      await pool.execute(`
        ALTER TABLE invoices 
        ADD COLUMN sequence_number INT AUTO_INCREMENT UNIQUE FIRST
      `);
      console.log('✓ Added sequence_number column');
      
      // Set AUTO_INCREMENT starting value (must use string interpolation, not parameterized query)
      await pool.execute(`
        ALTER TABLE invoices AUTO_INCREMENT = ${startSequence}
      `);
      console.log(`✓ Set AUTO_INCREMENT starting value to ${startSequence}`);
    } else {
      // Check current AUTO_INCREMENT value and update if needed
      const [autoIncrRows] = await pool.execute(`
        SELECT AUTO_INCREMENT 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'invoices'
      `);
      const currentAutoIncr = autoIncrRows[0]?.AUTO_INCREMENT || 1;
      
      if (currentAutoIncr < startSequence) {
        await pool.execute(`
          ALTER TABLE invoices AUTO_INCREMENT = ${startSequence}
        `);
        console.log(`✓ Updated AUTO_INCREMENT from ${currentAutoIncr} to ${startSequence}`);
      }
    }
    
    // Populate sequence_number for existing invoices based on their invoice_number
    // Only update invoices that don't have a sequence_number yet
    console.log('\nPopulating sequence_number for existing invoices...');
    const [existingInvoices] = await pool.execute(`
      SELECT id, invoice_number, sequence_number
      FROM invoices 
      WHERE invoice_number REGEXP '^WGSS/[ST]/[0-9]{2}-[0-9]{2}/[0-9]+$'
        AND (sequence_number IS NULL OR sequence_number = 0)
      ORDER BY invoice_number
    `);
    
    let updateCount = 0;
    for (const invoice of existingInvoices) {
      const parts = invoice.invoice_number.split('/');
      if (parts.length >= 4) {
        const sequence = parseInt(parts[3].trim());
        if (!isNaN(sequence)) {
          await pool.execute(`
            UPDATE invoices 
            SET sequence_number = ? 
            WHERE id = ?
          `, [sequence, invoice.id]);
          updateCount++;
        }
      }
    }
    
    if (updateCount > 0) {
      console.log(`✓ Updated ${updateCount} existing invoices with sequence numbers`);
    } else {
      console.log('✓ All invoices already have sequence numbers');
    }
    
    // Add index for performance
    try {
      await pool.execute(`
        CREATE INDEX idx_sequence_number ON invoices(sequence_number)
      `);
      console.log('✓ Added index on sequence_number');
    } catch (error) {
      // Index might already exist, ignore
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }
    
    console.log('\n✅ Successfully added sequence_number column to invoices table');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add sequence_number column:');
    console.error(error);
    process.exit(1);
  }
}

addSequenceNumberColumn();

