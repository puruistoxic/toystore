/**
 * Check Environment Variables
 * 
 * This script checks if all required environment variables are set.
 * 
 * Usage: node scripts/check-env.js
 */

require('dotenv').config();

const requiredVars = {
  'MYSQL_HOST': process.env.MYSQL_HOST,
  'MYSQL_DATABASE': process.env.MYSQL_DATABASE,
  'MYSQL_USER': process.env.MYSQL_USER,
  'MYSQL_PASSWORD': process.env.MYSQL_PASSWORD,
  'MYSQL_PORT': process.env.MYSQL_PORT,
};

const optionalVars = {
  'JWT_SECRET': process.env.JWT_SECRET,
  'ADMIN_DEFAULT_PASSWORD': process.env.ADMIN_DEFAULT_PASSWORD,
  'PORT': process.env.PORT,
};

console.log('Checking environment variables...');
console.log('');

let hasErrors = false;

// Check required variables
console.log('Required Variables:');
for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    // Mask password
    const displayValue = key === 'MYSQL_PASSWORD' ? '***' : value;
    console.log(`  ✅ ${key}: ${displayValue}`);
  } else {
    console.log(`  ❌ ${key}: NOT SET`);
    hasErrors = true;
  }
}

console.log('');
console.log('Optional Variables:');
for (const [key, value] of Object.entries(optionalVars)) {
  if (value) {
    console.log(`  ✅ ${key}: ${value}`);
  } else {
    console.log(`  ⚠️  ${key}: NOT SET (using default)`);
  }
}

console.log('');

if (hasErrors) {
  console.log('❌ Some required environment variables are missing!');
  console.log('');
  console.log('Please create a .env file in the server directory.');
  console.log('See docs/ENV_SETUP.md for instructions.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set!');
  process.exit(0);
}

