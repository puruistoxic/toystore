/**
 * Migration script to import data from static files to database
 * 
 * Usage: node scripts/migrate-data.js
 * 
 * This script reads data from the frontend data files and imports them into the database.
 * Make sure the database is running and accessible before running this script.
 */

require('dotenv').config();
const { getPool, initDatabase } = require('../db');
const fs = require('fs');
const path = require('path');

// Initialize database
initDatabase();

async function migrateServices() {
  try {
    const servicesPath = path.join(__dirname, '../../src/data/services.ts');
    if (!fs.existsSync(servicesPath)) {
      console.log('Services file not found, skipping...');
      return;
    }

    const content = fs.readFileSync(servicesPath, 'utf8');
    // Extract the services array (simplified - in production, use a proper parser)
    const match = content.match(/export const services[^=]*=\s*(\[[\s\S]*?\]);/);
    if (!match) {
      console.log('Could not parse services file');
      return;
    }

    // Note: This is a simplified migration. For production, you'd want to:
    // 1. Use a TypeScript parser or
    // 2. Export data as JSON from the TypeScript files
    // 3. Import the JSON files here

    console.log('Services migration - Manual import recommended');
    console.log('Please use the admin panel or API to import services data');
  } catch (error) {
    console.error('Error migrating services:', error);
  }
}

async function migrateAll() {
  console.log('Starting data migration...');
  console.log('');
  console.log('NOTE: This is a basic migration script.');
  console.log('For full migration, you can:');
  console.log('1. Use the admin panel to manually add items');
  console.log('2. Use the API endpoints with Postman/curl');
  console.log('3. Export data from TypeScript files as JSON and import via API');
  console.log('');
  
  await migrateServices();
  
  console.log('');
  console.log('Migration script completed.');
  console.log('Please use the admin panel at /admin/login to manage your content.');
}

// Run migration
migrateAll().catch(console.error);

