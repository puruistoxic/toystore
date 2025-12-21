/**
 * Create or Reset Admin User Script
 * 
 * This script creates or resets the password for an admin user.
 * 
 * Usage: node scripts/create-user.js [username] [password]
 * Example: node scripts/create-user.js anish mypassword123
 */

require('dotenv').config();
const { getPool } = require('../db');
const bcrypt = require('bcrypt');

async function createOrResetUser() {
  try {
    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
    
    console.log('Creating/Resetting admin user...');
    console.log('');
    
    // Initialize database connection
    const { initDatabase } = require('../db');
    await initDatabase();
    
    const pool = getPool();
    
    // Check if user exists
    console.log(`Checking if user "${username}" exists...`);
    const [users] = await pool.execute(
      'SELECT * FROM admin_users WHERE username = ?',
      [username]
    );
    
    if (users.length > 0) {
      console.log(`✅ User "${username}" exists`);
      console.log('Resetting password...');
      
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.execute(
        'UPDATE admin_users SET password_hash = ?, is_active = TRUE WHERE username = ?',
        [passwordHash, username]
      );
      
      console.log(`✅ Password reset for user "${username}"`);
    } else {
      console.log(`User "${username}" does not exist. Creating new user...`);
      
      const passwordHash = await bcrypt.hash(password, 10);
      const email = `${username}@wainso.com`;
      const fullName = username.charAt(0).toUpperCase() + username.slice(1);
      
      await pool.execute(
        'INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, passwordHash, fullName, 'admin', true]
      );
      
      console.log(`✅ User "${username}" created`);
    }
    
    console.log('');
    console.log('✅ User setup completed!');
    console.log('');
    console.log('Login credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create/reset user:');
    console.error(error);
    process.exit(1);
  }
}

createOrResetUser();


