# WAINSO Email Verification API

Backend API server for sending email verification codes via SMTP.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your SMTP credentials:
```
SMTP_HOST=smtp.zeptomail.eu
SMTP_PORT=587
SMTP_USER=emailapikey
SMTP_PASSWORD=your_password_here
PORT=3001
NODE_ENV=production
```

## Running Locally

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### POST `/api/verify/send`
Send verification code via email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "itemName": "CCTV Installation",
  "messagePreview": "Quote request preview..."
}
```

**Response:**
```json
{
  "success": true,
  "reference": "WV-ABC123",
  "expiresAt": 1234567890,
  "message": "Verification code sent successfully"
}
```

### POST `/api/verify/check`
Verify the code entered by user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "status": "verified",
  "message": "Email verified successfully"
}
```

Status values: `verified`, `invalid`, `expired`, `not_found`

### GET `/health`
Health check endpoint.

## Docker

Build and run with Docker Compose (see root `docker-compose.yml`).

The service will be available at `http://wainso-api:3001` within the Docker network, and proxied through Nginx at `/api/`.

## Environment Variables

- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP port (587 for TLS, 465 for SSL)
- `SMTP_USER` - SMTP username
- `SMTP_PASSWORD` - SMTP password
- `PORT` - API server port (default: 3001)
- `NODE_ENV` - Environment (production/development)

