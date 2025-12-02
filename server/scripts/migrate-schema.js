/**
 * Database Schema Migration Script
 * 
 * This script migrates the database schema to add brands column to categories
 * and remove category column from brands.
 * 
 * Usage: node scripts/migrate-schema.js
 */

require('dotenv').config();
const { getPool, initDatabase } = require('../db');

async function migrateSchema() {
  try {
    console.log('Starting database schema migration...');
    console.log('');
    
    // Initialize database connection
    await initDatabase();
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      // Check if brands column exists in categories table
      const [categoryColumns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'categories' 
        AND COLUMN_NAME = 'brands'
      `);
      
      if (categoryColumns.length === 0) {
        console.log('Adding brands column to categories table...');
        await connection.execute(`
          ALTER TABLE categories 
          ADD COLUMN brands JSON NULL AFTER products
        `);
        console.log('✅ Added brands column to categories table');
      } else {
        console.log('✅ brands column already exists in categories table');
      }
      
      // Check if category column exists in brands table
      const [brandColumns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'brands' 
        AND COLUMN_NAME = 'category'
      `);
      
      if (brandColumns.length > 0) {
        console.log('Removing category column from brands table...');
        // First, drop the index if it exists
        try {
          await connection.execute(`ALTER TABLE brands DROP INDEX idx_category`);
        } catch (e) {
          // Index might not exist, ignore
        }
        await connection.execute(`
          ALTER TABLE brands 
          DROP COLUMN category
        `);
        console.log('✅ Removed category column from brands table');
      } else {
        console.log('✅ category column does not exist in brands table (already removed)');
      }
      
      // Check if partnership_type enum includes 'others'
      const [enumValues] = await connection.execute(`
        SELECT COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'brands' 
        AND COLUMN_NAME = 'partnership_type'
      `);
      
      if (enumValues.length > 0) {
        const columnType = enumValues[0].COLUMN_TYPE;
        if (!columnType.includes("'others'")) {
          console.log('Updating partnership_type enum to include "others"...');
          await connection.execute(`
            ALTER TABLE brands 
            MODIFY COLUMN partnership_type ENUM('authorized-dealer', 'partner', 'distributor', 'reseller', 'others') NULL
          `);
          console.log('✅ Updated partnership_type enum');
        } else {
          console.log('✅ partnership_type enum already includes "others"');
        }
      }
      
      // Check if audit_logs table exists
      const [auditTable] = await connection.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'audit_logs'
      `);
      
      if (auditTable.length === 0) {
        console.log('Creating audit_logs table...');
        await connection.execute(`
          CREATE TABLE audit_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            username VARCHAR(100) NOT NULL,
            action VARCHAR(20) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id VARCHAR(50),
            entity_name VARCHAR(255),
            changes JSON,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user (user_id),
            INDEX idx_action (action),
            INDEX idx_entity (entity_type, entity_id),
            INDEX idx_created_at (created_at),
            INDEX idx_username (username)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✅ Created audit_logs table');
      } else {
        console.log('✅ audit_logs table already exists');
      }
      
      // Check if quote_requests table exists
      const [quoteTable] = await connection.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'quote_requests'
      `);
      
      if (quoteTable.length === 0) {
        console.log('Creating quote_requests table...');
        await connection.execute(`
          CREATE TABLE quote_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(20) NOT NULL,
            company VARCHAR(255),
            item_name VARCHAR(255) NOT NULL,
            item_type VARCHAR(50),
            category VARCHAR(255),
            budget VARCHAR(100),
            timeline VARCHAR(100),
            location VARCHAR(255),
            industry VARCHAR(255),
            quantity VARCHAR(50),
            notes TEXT,
            message TEXT,
            source VARCHAR(100) DEFAULT 'Website Quote Request Form',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_created_at (created_at),
            INDEX idx_email (email),
            INDEX idx_phone (phone)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✅ Created quote_requests table');
      } else {
        console.log('✅ quote_requests table already exists');
      }
      
      console.log('');
      console.log('✅ Database schema migration completed successfully!');
      
    } finally {
      connection.release();
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database schema migration failed:');
    console.error(error);
    process.exit(1);
  }
}

migrateSchema();

