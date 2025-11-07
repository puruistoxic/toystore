# Local Development Setup

## Running the Backend API Locally

The backend API needs to be running for the enquiry form and email verification to work.

### 1. Navigate to the server directory
```bash
cd server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
Create a `.env` file in the `server/` directory with the following content:

```env
SMTP_HOST=smtp.zeptomail.eu
SMTP_PORT=587
SMTP_USER=emailapikey
SMTP_PASSWORD=yA6KbHtb4gihy2xRREVuhJKC+4sx/q0xiiSy4CHhfpYleNiz3KE20BFqINPuJ2CI0YfY5atVb45AI4266IsPfJlmPYUFLJTGTuv4P2uV48xh8ciEYNYkjJWuBrkWGqFPdx8jDioyQvMgWA==
PORT=3001
NODE_ENV=development
```

### 4. Start the backend server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### 5. Start the frontend (in a separate terminal)
```bash
cd ..  # Go back to project root
npm start
```

The frontend will automatically detect local development and use `http://localhost:3001/api` for API calls.

## Testing

1. Open `http://localhost:3000` in your browser
2. The enquiry popup should appear
3. Fill in the form and submit
4. Check the backend console for logs
5. Check `wainsogps@gmail.com` for the enquiry email

## Troubleshooting

### Backend not starting
- Check if port 3001 is already in use
- Verify `.env` file exists and has correct SMTP credentials
- Check console for error messages

### API calls failing
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify the API URL in the browser's Network tab

### Email not sending
- Verify SMTP credentials in `.env` file
- Check backend console for SMTP errors
- Ensure SMTP server is accessible from your network

