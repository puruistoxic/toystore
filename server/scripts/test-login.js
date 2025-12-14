/**
 * Test Login Script
 * 
 * This script tests the admin login functionality directly.
 * 
 * Usage: node scripts/test-login.js
 */

require('dotenv').config();
const { getPool } = require('../db');
const bcrypt = require('bcrypt');

async function testLogin() {
  try {
    console.log('Testing admin login...');
    console.log('');
    
    // Initialize database connection
    const { initDatabase } = require('../db');
    await initDatabase();
    
    const pool = getPool();
    
    // Check if admin user exists
    console.log('1. Checking if admin user exists...');
    const [users] = await pool.execute(
      'SELECT * FROM admin_users WHERE username = ?',
      ['admin']
    );
    
    if (users.length === 0) {
      console.log('❌ Admin user does not exist!');
      console.log('');
      console.log('Creating admin user...');
      
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      
      await pool.execute(
        'INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@wainso.com', passwordHash, 'Administrator', 'admin']
      );
      
      console.log('✅ Admin user created!');
      console.log(`   Username: admin`);
      console.log(`   Password: ${defaultPassword}`);
    } else {
      console.log('✅ Admin user exists');
      const user = users[0];
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Active: ${user.is_active}`);
      console.log(`   Role: ${user.role}`);
    }
    
    console.log('');
    console.log('2. Testing password verification...');
    const testPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
    const [testUsers] = await pool.execute(
      'SELECT * FROM admin_users WHERE username = ?',
      ['admin']
    );
    
    if (testUsers.length > 0) {
      const user = testUsers[0];
      const passwordMatch = await bcrypt.compare(testPassword, user.password_hash);
      
      if (passwordMatch) {
        console.log('✅ Password verification successful!');
        console.log(`   Test password "${testPassword}" matches the stored hash.`);
      } else {
        console.log('❌ Password verification failed!');
        console.log(`   Test password "${testPassword}" does NOT match the stored hash.`);
        console.log('');
        console.log('Resetting password...');
        
        const newPasswordHash = await bcrypt.hash(testPassword, 10);
        await pool.execute(
          'UPDATE admin_users SET password_hash = ? WHERE username = ?',
          [newPasswordHash, 'admin']
        );
        
        console.log('✅ Password reset!');
        console.log(`   New password: ${testPassword}`);
      }
    }
    
    console.log('');
    console.log('3. Testing database connection...');
    const [test] = await pool.execute('SELECT 1 as test');
    if (test.length > 0) {
      console.log('✅ Database connection working!');
    }
    
    console.log('');
    console.log('✅ All tests completed!');
    console.log('');
    console.log('You can now try logging in with:');
    console.log('   Username: admin');
    console.log('   Password: ' + (process.env.ADMIN_DEFAULT_PASSWORD || 'admin123'));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

testLogin();



