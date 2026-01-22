# Admin Login Troubleshooting Guide

## Issue: Login Failed

If you're experiencing login failures, follow these troubleshooting steps:

## ✅ Fixed Issues

### 1. API URL Configuration
**Problem**: In development, the frontend was trying to connect to `/api` which doesn't work without a proxy.

**Solution**: Updated `AuthContext.tsx` and `api.ts` to automatically detect development mode and use `http://localhost:3001/api` when running locally.

## 🔍 Troubleshooting Steps

### Step 1: Verify Server is Running

Make sure the backend server is running:

```bash
cd server
npm start
```

You should see:
```
[Email API] Server running on port 3001
[Database] Tables initialized successfully
[Database] Default admin user created: username=admin, password=admin123
```

### Step 2: Check Database Connection

The server should show:
```
[Email API] Database connected: wainso.com/wainsodb
```

If you see a database connection error:
- Verify database credentials in `docker-compose.yml` or `.env`
- Check if the database server is accessible
- Verify network connectivity

### Step 3: Verify Admin User Exists

The default admin user should be created automatically. To verify:

1. Connect to your database
2. Run: `SELECT * FROM admin_users;`
3. You should see a user with username `admin`

If the user doesn't exist, the server will create it on startup. Check server logs for:
```
[Database] Default admin user created: username=admin, password=admin123
```

### Step 4: Check API Endpoint

Test the login endpoint directly:

```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
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

### Step 5: Check Browser Console

Open browser DevTools (F12) and check:
1. **Console tab**: Look for any JavaScript errors
2. **Network tab**: 
   - Check if the request to `/api/admin/login` is being made
   - Check the response status and body
   - Verify the request URL is correct

### Step 6: Verify CORS

If you see CORS errors in the browser console:
- The server has CORS enabled by default
- Make sure the server is running on port 3001
- Check that the frontend is making requests to the correct URL

### Step 7: Check Environment Variables

For local development, create a `.env` file in the `server` directory:

```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key-here
ADMIN_DEFAULT_PASSWORD=admin123
MYSQL_HOST=192.168.1.210
MYSQL_DATABASE=toystoredb
MYSQL_USER=dbuser
MYSQL_PASSWORD='X9@uP!z1qF#D'
MYSQL_PORT=3306
```

## 🐛 Common Issues

### Issue: "Network Error" or "Failed to fetch"
**Cause**: Server is not running or not accessible
**Solution**: 
- Start the server: `cd server && npm start`
- Verify it's running on port 3001
- Check firewall settings

### Issue: "Invalid credentials"
**Cause**: Wrong username/password or user doesn't exist
**Solution**:
- Use: username: `admin`, password: `admin123`
- Check server logs for user creation
- Verify user exists in database

### Issue: "Database connection failed"
**Cause**: Database is not accessible
**Solution**:
- Check database credentials
- Verify database server is running
- Check network connectivity
- Verify database host/port

### Issue: "CORS error"
**Cause**: CORS not configured properly
**Solution**:
- Server has CORS enabled by default
- Make sure frontend is using correct API URL
- In development, use `http://localhost:3001/api`

### Issue: "Token verification failed"
**Cause**: JWT_SECRET mismatch or token expired
**Solution**:
- Check JWT_SECRET is set correctly
- Tokens expire after 24 hours
- Try logging in again

## 🔧 Quick Fixes

### Reset Admin Password

If you need to reset the admin password:

1. Connect to database
2. Generate a new password hash:
   ```javascript
   const bcrypt = require('bcrypt');
   const hash = await bcrypt.hash('newpassword', 10);
   console.log(hash);
   ```
3. Update database:
   ```sql
   UPDATE admin_users SET password_hash = 'YOUR_HASH_HERE' WHERE username = 'admin';
   ```

### Recreate Admin User

Delete and let the server recreate:
```sql
DELETE FROM admin_users WHERE username = 'admin';
```
Then restart the server - it will create a new admin user.

## 📝 Testing Login

### Using curl:
```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Using Postman:
1. Method: POST
2. URL: `http://localhost:3001/api/admin/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```

## ✅ Success Indicators

When login works correctly, you should:
1. See a JWT token in the response
2. Be redirected to `/admin/dashboard`
3. See the admin dashboard with navigation menu
4. Have a token stored in localStorage (check DevTools > Application > Local Storage)

## 🆘 Still Having Issues?

1. Check server logs for detailed error messages
2. Check browser console for frontend errors
3. Verify all dependencies are installed: `npm install` in both root and server directories
4. Make sure you're using the correct credentials: `admin` / `admin123`
5. Try clearing browser cache and localStorage
6. Restart both frontend and backend servers

## 📞 Debug Checklist

- [ ] Server is running on port 3001
- [ ] Database is connected
- [ ] Admin user exists in database
- [ ] API endpoint is accessible: `http://localhost:3001/api/admin/login`
- [ ] Frontend is using correct API URL
- [ ] No CORS errors in browser console
- [ ] No JavaScript errors in browser console
- [ ] Network request shows correct status (200 OK)
- [ ] JWT_SECRET is set (if using custom environment)

