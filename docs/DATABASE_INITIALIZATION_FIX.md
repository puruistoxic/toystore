# Database Initialization Fix

## Problem
The database tables were not being initialized because the `initializeTables()` function was async but wasn't being awaited.

## ✅ Fixed Issues

1. **Async/Await Fix**: Made `initDatabase()` async and properly await `initializeTables()`
2. **Server Startup**: Updated server to wait for database initialization before starting
3. **Error Handling**: Added better error messages and warnings
4. **Environment Variables**: Added script to check if environment variables are set

## 🔧 Setup Required

### Step 1: Create .env File

Create a `.env` file in the `server` directory with your database credentials:

```env
# Database Configuration
MYSQL_HOST=192.168.1.210
MYSQL_DATABASE=toystoredb
MYSQL_USER=dbuser
MYSQL_PASSWORD='X9@uP!z1qF#D'
MYSQL_PORT=3306

# Server Configuration
NODE_ENV=development
PORT=3001

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production-use-strong-random-string
ADMIN_DEFAULT_PASSWORD=admin123

# SMTP Configuration
SMTP_HOST=smtp.zeptomail.eu
SMTP_PORT=587
SMTP_USER=emailapikey
SMTP_PASSWORD=yA6KbHtb4gihy2xRREVuhJKC+4sx/q0xiiSy4CHhfpYleNiz3KE20BFqINPuJ2CI0YfY5atVb45AI4266IsPfJlmPYUFLJTGTuv4P2uV48xh8ciEYNYkjJWuBrkWGqFPdx8jDioyQvMgWA==
```

### Step 2: Check Environment Variables

```bash
cd server
npm run check-env
```

This will verify all required environment variables are set.

### Step 3: Initialize Database

```bash
npm run init-db
```

This will:
- Create all database tables
- Create the default admin user
- Verify the database connection

### Step 4: Start Server

```bash
npm start
```

The server will now:
- Wait for database initialization to complete
- Show clear error messages if something fails
- Automatically create tables and admin user on first run

## 📋 What Gets Created

The initialization script creates the following tables:

1. **admin_users** - Admin user accounts
2. **services** - Service offerings
3. **products** - Product catalog
4. **locations** - Service locations
5. **brands** - Brand partnerships
6. **industries** - Industry sectors
7. **case_studies** - Case studies
8. **testimonials** - Customer testimonials
9. **verification_codes** - Email verification codes
10. **enquiries** - Website enquiries

And creates a default admin user:
- Username: `admin`
- Password: `admin123` (or value from `ADMIN_DEFAULT_PASSWORD`)

## 🐛 Troubleshooting

### Error: "Access denied for user"
- Check that the `.env` file exists in the `server` directory
- Verify database credentials are correct
- Make sure the database user has proper permissions

### Error: "Database not initialized"
- Run `npm run init-db` first
- Check that the database server is running
- Verify network connectivity to the database

### Error: "MYSQL_PASSWORD is not set"
- Create the `.env` file (see Step 1)
- Make sure the file is in the `server` directory
- Restart the server after creating the file

## 📝 Files Changed

- `server/db.js` - Fixed async initialization
- `server/index.js` - Updated server startup to await database init
- `server/scripts/init-db.js` - Standalone initialization script
- `server/scripts/check-env.js` - Environment variable checker
- `server/package.json` - Added npm scripts

## ✅ Verification

After initialization, you should see:
```
[Database] Tables initialized successfully
[Database] Default admin user created: username=admin, password=admin123
✅ Database connection successful!
```

You can then login to the admin panel with:
- Username: `admin`
- Password: `admin123`

