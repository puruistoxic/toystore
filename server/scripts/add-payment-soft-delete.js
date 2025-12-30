/**
 * Add soft delete fields to invoice_payments table
 * 
 * This script adds is_deleted, deleted_by, and deleted_at columns
 * to the invoice_payments table for audit trail purposes.
 * 
 * Usage: node scripts/add-payment-soft-delete.js
 */

require('dotenv').config();
const { getPool } = require('../db');

async function addSoftDeleteFields() {
  try {
    console.log('Adding soft delete fields to invoice_payments table...\n');
    
    // Initialize database connection
    const { initDatabase } = require('../db');
    await initDatabase();
    
    const pool = getPool();
    
    // Check if columns already exist
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'invoice_payments' 
      AND COLUMN_NAME IN ('is_deleted', 'deleted_by', 'deleted_at')
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    
    if (existingColumns.includes('is_deleted') && 
        existingColumns.includes('deleted_by') && 
        existingColumns.includes('deleted_at')) {
      console.log('✅ Soft delete fields already exist in invoice_payments table');
      process.exit(0);
    }
    
    // Add is_deleted column if it doesn't exist
    if (!existingColumns.includes('is_deleted')) {
      await pool.execute(`
        ALTER TABLE invoice_payments 
        ADD COLUMN is_deleted TINYINT(1) DEFAULT 0 NOT NULL
      `);
      console.log('✓ Added is_deleted column');
    }
    
    // Add deleted_by column if it doesn't exist
    if (!existingColumns.includes('deleted_by')) {
      await pool.execute(`
        ALTER TABLE invoice_payments 
        ADD COLUMN deleted_by INT NULL
      `);
      console.log('✓ Added deleted_by column');
    }
    
    // Add deleted_at column if it doesn't exist
    if (!existingColumns.includes('deleted_at')) {
      await pool.execute(`
        ALTER TABLE invoice_payments 
        ADD COLUMN deleted_at TIMESTAMP NULL
      `);
      console.log('✓ Added deleted_at column');
    }
    
    // Add index for performance
    try {
      await pool.execute(`
        CREATE INDEX idx_is_deleted ON invoice_payments(is_deleted)
      `);
      console.log('✓ Added index on is_deleted');
    } catch (error) {
      // Index might already exist, ignore
      if (!error.message.includes('Duplicate key name')) {
        throw error;
      }
    }
    
    console.log('\n✅ Successfully added soft delete fields to invoice_payments table');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add soft delete fields:');
    console.error(error);
    process.exit(1);
  }
}

addSoftDeleteFields();



