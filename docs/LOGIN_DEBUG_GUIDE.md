# Login Debug Guide

## Quick Debugging Steps

### Step 1: Check if Server is Running

```bash
cd server
npm start
```

Look for these messages:
- `[Email API] Server running on port 3001`
- `[Database] Tables initialized successfully`
- `[Database] Default admin user created: username=admin, password=admin123`
- `[Email API] Database connected: 192.168.1.210/wainsodb`

### Step 2: Test Database Connection and Admin User

```bash
cd server
npm run test-login
```

This will:
- Check if admin user exists
- Create admin user if it doesn't exist
- Test password verification
- Reset password if needed

### Step 3: Test Login API Directly

Open a new terminal and test the login endpoint:

```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@wainso.com",
    "fullName": "Administrator",
    "role": "admin"
  }
}
```

### Step 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab - look for errors
3. Go to **Network** tab:
   - Try logging in
   - Find the `/api/admin/login` request
   - Check the **Status** code
   - Check the **Response** body

### Step 5: Verify Environment Variables

```bash
cd server
npm run check-env
```

Make sure all required variables are set, especially:
- `MYSQL_HOST=192.168.1.210`
- `MYSQL_PASSWORD=X9@uP!z1qF#D`

## Common Issues and Solutions

### Issue: "Invalid credentials"

**Possible causes:**
1. Admin user doesn't exist in database
2. Password hash doesn't match
3. User is inactive

**Solution:**
```bash
cd server
npm run test-login
```

This will create/reset the admin user.

### Issue: "Database connection failed"

**Check:**
1. Database server is running at `192.168.1.210`
2. Network connectivity to database server
3. Database credentials are correct
4. `.env` file exists in `server/` directory

**Solution:**
```bash
cd server
npm run check-env
```

### Issue: "Network Error" or "Failed to fetch"

**Check:**
1. Server is running on port 3001
2. Frontend is using correct API URL
3. No CORS errors in browser console

**Solution:**
- Make sure server is running: `cd server && npm start`
- Check browser console for CORS errors
- Verify API URL in Network tab

### Issue: "Access denied for user"

**Check:**
1. `.env` file exists in `server/` directory
2. `MYSQL_PASSWORD` is set correctly
3. Database user has proper permissions

**Solution:**
Create `server/.env` file:
```env
MYSQL_HOST=192.168.1.210
MYSQL_DATABASE=wainsodb
MYSQL_USER=dbuser
MYSQL_PASSWORD=X9@uP!z1qF#D
MYSQL_PORT=3306
```

## Manual Admin User Creation

If you need to manually create/reset the admin user:

```bash
cd server
node -e "
const bcrypt = require('bcrypt');
const { initDatabase, getPool } = require('./db');

(async () => {
  await initDatabase();
  const pool = getPool();
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  
  // Delete existing admin user
  await pool.execute('DELETE FROM admin_users WHERE username = ?', ['admin']);
  
  // Create new admin user
  await pool.execute(
    'INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
    ['admin', 'admin@wainso.com', hash, 'Administrator', 'admin']
  );
  
  console.log('Admin user created/reset!');
  console.log('Username: admin');
  console.log('Password: admin123');
  process.exit(0);
})();
"
```

## Verify Everything is Working

1. **Server running**: `cd server && npm start` - should show no errors
2. **Database connected**: Should see `Database connected: 192.168.1.210/wainsodb`
3. **Admin user exists**: Run `npm run test-login` - should show admin user exists
4. **API endpoint works**: Test with curl (see Step 3)
5. **Frontend can connect**: Check browser Network tab for successful API calls

## Still Having Issues?

1. Check server logs for detailed error messages
2. Check browser console for frontend errors
3. Verify database is accessible: `telnet 192.168.1.210 3306` (or use MySQL client)
4. Try resetting admin user: `npm run test-login`
5. Clear browser cache and localStorage
6. Restart both frontend and backend servers

