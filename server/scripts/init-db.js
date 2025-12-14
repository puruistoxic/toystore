/**
 * Database Initialization Script
 * 
 * This script initializes all database tables and creates the default admin user.
 * 
 * Usage: node scripts/init-db.js
 */

require('dotenv').config();
const { initDatabase, testConnection } = require('../db');

async function main() {
  try {
    console.log('Starting database initialization...');
    console.log('');
    
    // Initialize database
    await initDatabase();
    
    // Test connection
    console.log('');
    console.log('Testing database connection...');
    const connected = await testConnection();
    
    if (connected) {
      console.log('✅ Database connection successful!');
      console.log('');
      console.log('Database initialization completed successfully!');
      console.log('');
      console.log('Default admin credentials:');
      console.log('  Username: admin');
      console.log('  Password: ' + (process.env.ADMIN_DEFAULT_PASSWORD || 'admin123'));
      console.log('');
      console.log('⚠️  Please change the default password after first login!');
    } else {
      console.error('❌ Database connection test failed!');
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:');
    console.error(error);
    process.exit(1);
  }
}

main();



