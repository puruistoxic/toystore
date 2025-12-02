# Environment Variables Setup

## Create .env File

Create a `.env` file in the `server` directory with the following content:

```env
# Database Configuration
MYSQL_HOST=192.168.1.210
MYSQL_DATABASE=wainsodb
MYSQL_USER=dbuser
MYSQL_PASSWORD=X9@uP!z1qF#D
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

## Quick Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create the `.env` file (copy the content above)

3. Initialize the database:
   ```bash
   npm run init-db
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Important Notes

- The `.env` file is in `.gitignore` and won't be committed to git
- Update `JWT_SECRET` with a strong random string in production
- Update `ADMIN_DEFAULT_PASSWORD` if needed
- Make sure the database credentials are correct for your setup

