# Email Verification Setup

## Overview
Email verification is now integrated using SMTP (ZeptoMail) to send verification codes to users when they request quotes via email.

## Architecture

### Backend API (`server/`)
- Express.js server running on port 3001
- Handles email sending via SMTP
- Stores verification codes in memory
- Endpoints:
  - `POST /api/verify/send` - Send verification code
  - `POST /api/verify/check` - Verify code
  - `GET /health` - Health check

### Frontend Integration
- Updated `src/api/quoteVerification.ts` to call backend API
- Frontend makes requests to `/api/verify/*` which are proxied by Nginx to the backend

### Docker Setup
- `wainso-api` service: Backend API server
- `wainso-web` service: Frontend React app with Nginx
- Nginx proxies `/api/*` requests to `wainso-api:3001`

## SMTP Configuration

**Server:** smtp.zeptomail.eu  
**Port:** 587 (TLS) or 465 (SSL)  
**Domain:** wainso.com  
**Username:** emailapikey  
**Password:** (configured in docker-compose.yml)

## Environment Variables

The SMTP credentials are configured in `docker-compose.yml` as environment variables:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`

For local development, create a `server/.env` file with these variables.

## Deployment

1. Build and start services:
```bash
docker compose up -d --build
```

2. Verify services are running:
```bash
docker compose ps
docker compose logs wainso-api
```

3. Test the API:
```bash
curl http://localhost/api/health
```

## Email Template

The verification email includes:
- WAINSO branding with teal color (#006767)
- Personalized greeting with user's name
- 6-digit verification code in large, easy-to-read format
- 10-minute expiration notice
- Company contact information

## Security Notes

- Verification codes expire after 10 minutes
- Maximum 5 verification attempts per code
- Codes are stored in memory (cleared after expiration or successful verification)
- No verification codes are returned in API responses (only sent via email)

## Troubleshooting

1. **Email not sending:**
   - Check SMTP credentials in docker-compose.yml
   - Verify port (587 for TLS, 465 for SSL)
   - Check backend logs: `docker compose logs wainso-api`

2. **API not reachable:**
   - Verify nginx proxy configuration
   - Check that both services are running: `docker compose ps`
   - Test backend directly: `curl http://wainso-api:3001/health`

3. **CORS issues:**
   - Backend has CORS enabled for all origins
   - If issues persist, check nginx proxy headers

