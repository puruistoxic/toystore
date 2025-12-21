/**
 * Test Admin Login Script
 * 
 * This script tests the login functionality directly.
 * 
 * Usage: node scripts/test-login.js [username] [password]
 * Example: node scripts/test-login.js anish admin123
 */

require('dotenv').config();
const { getPool } = require('../db');
const bcrypt = require('bcrypt');

async function testLogin() {
  try {
    const username = process.argv[2] || 'anish';
    const password = process.argv[3] || 'admin123';
    
    console.log('Testing login...');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log('');
    
    // Initialize database connection
    const { initDatabase } = require('../db');
    await initDatabase();
    
    const pool = getPool();
    
    // Check if user exists
    console.log('Checking user in database...');
    const [users] = await pool.execute(
      'SELECT * FROM admin_users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      console.error('❌ User not found');
      process.exit(1);
    }
    
    const user = users[0];
    console.log('✅ User found');
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}`);
    console.log(`   Has password_hash: ${user.password_hash ? 'Yes' : 'No'}`);
    
    if (!user.is_active) {
      console.error('❌ User is inactive');
      process.exit(1);
    }
    
    if (!user.password_hash) {
      console.error('❌ User has no password hash');
      process.exit(1);
    }
    
    // Test password
    console.log('');
    console.log('Testing password...');
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (passwordMatch) {
      console.log('✅ Password matches!');
      console.log('');
      console.log('Login should work with these credentials.');
    } else {
      console.error('❌ Password does not match');
      console.log('');
      console.log('The password you provided does not match the stored hash.');
      console.log('Try running: node scripts/create-user.js ' + username + ' ' + password);
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing login:');
    console.error(error);
    process.exit(1);
  }
}

testLogin();
