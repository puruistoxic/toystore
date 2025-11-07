const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory store for verification codes
const verificationStore = new Map();

// Create SMTP transporter
const createTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT || '587');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zeptomail.eu',
    port: port,
    secure: port === 465, // true for 465 (SSL), false for 587 (TLS)
    requireTLS: port === 587, // Require TLS for port 587
    auth: {
      user: process.env.SMTP_USER || 'emailapikey',
      pass: process.env.SMTP_PASSWORD || ''
    },
    tls: {
      // Do not fail on invalid certificates
      rejectUnauthorized: false
    }
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'wainso-email-api' });
});

// Send verification code endpoint
app.post('/api/verify/send', async (req, res) => {
  try {
    const { email, name, itemName, messagePreview } = req.body;

    if (!email || !name) {
      return res.status(400).json({ 
        error: 'Email and name are required' 
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const reference = `WV-${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store verification data
    verificationStore.set(email.toLowerCase(), {
      code,
      expiresAt,
      attempts: 0,
      reference,
      name,
      itemName
    });

    // Send email
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"WAINSO GPS & Security System" <noreply@wainso.com>`,
      to: email,
      subject: 'Your Quote Request Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #006767 0%, #004d4d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">WAINSO</h1>
            <p style="color: #e6f7f7; margin: 10px 0 0 0; font-size: 14px;">GPS & Security System</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #006767; margin-top: 0;">Email Verification</h2>
            
            <p>Hello ${name},</p>
            
            <p>Thank you for requesting a quote for <strong>${itemName || 'our services'}</strong>.</p>
            
            <p>Please use the verification code below to complete your quote request:</p>
            
            <div style="background: #f5f5f5; border: 2px dashed #006767; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <div style="font-size: 36px; font-weight: bold; color: #006767; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              <strong>This code will expire in 10 minutes.</strong>
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you didn't request this code, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; margin: 0;">
              <strong>WAINSO GPS & Security System</strong><br>
              Room No-9, 1st Floor, Yadav Complex<br>
              Near Block Chawck, Block Chowk, Ramgarh Cantt - 829122, Jharkhand<br>
              Phone: +91 98998 60975 | Email: wainsogps@gmail.com<br>
              Website: <a href="https://wainso.com" style="color: #006767;">wainso.com</a>
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        WAINSO GPS & Security System
        
        Email Verification
        
        Hello ${name},
        
        Thank you for requesting a quote for ${itemName || 'our services'}.
        
        Please use the verification code below to complete your quote request:
        
        Verification Code: ${code}
        
        This code will expire in 10 minutes.
        
        If you didn't request this code, please ignore this email.
        
        ---
        WAINSO GPS & Security System
        Room No-9, 1st Floor, Yadav Complex
        Near Block Chawck, Block Chowk, Ramgarh Cantt - 829122, Jharkhand
        Phone: +91 98998 60975 | Email: wainsogps@gmail.com
        Website: https://wainso.com
      `
    };

    await transporter.sendMail(mailOptions);

    console.log(`[Email API] Verification code sent to ${email}, reference: ${reference}`);

    res.json({
      success: true,
      reference,
      expiresAt,
      message: 'Verification code sent successfully'
    });

  } catch (error) {
    console.error('[Email API] Error sending verification code:', error);
    res.status(500).json({
      error: 'Failed to send verification code',
      message: error.message
    });
  }
});

// Verify code endpoint
app.post('/api/verify/check', (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: 'Email and code are required'
      });
    }

    const record = verificationStore.get(email.toLowerCase());

    if (!record) {
      return res.json({
        status: 'not_found',
        message: 'No verification code found for this email'
      });
    }

    if (Date.now() > record.expiresAt) {
      verificationStore.delete(email.toLowerCase());
      return res.json({
        status: 'expired',
        message: 'Verification code has expired'
      });
    }

    if (record.code !== code.trim()) {
      record.attempts += 1;
      if (record.attempts >= 5) {
        verificationStore.delete(email.toLowerCase());
        return res.json({
          status: 'invalid',
          message: 'Too many failed attempts. Please request a new code.'
        });
      }
      return res.json({
        status: 'invalid',
        message: 'Invalid verification code',
        attemptsRemaining: 5 - record.attempts
      });
    }

    // Code is valid
    verificationStore.delete(email.toLowerCase());
    return res.json({
      status: 'verified',
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('[Email API] Error verifying code:', error);
    res.status(500).json({
      error: 'Failed to verify code',
      message: error.message
    });
  }
});

// Enquiry submission endpoint
app.post('/api/enquiry', async (req, res) => {
  try {
    const { name, mobile, email } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({
        error: 'Name and mobile number are required'
      });
    }

    // Send notification email to business
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"WAINSO GPS & Security System" <noreply@wainso.com>`,
      to: 'wainsogps@gmail.com', // Business email
      subject: `New Website Enquiry from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Enquiry</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #006767 0%, #004d4d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">New Website Enquiry</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #006767; margin-top: 0;">Enquiry Details</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; font-weight: bold; width: 150px;">Name:</td>
                <td style="padding: 10px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Mobile:</td>
                <td style="padding: 10px;"><a href="tel:${mobile}">${mobile}</a></td>
              </tr>
              ${email ? `
              <tr>
                <td style="padding: 10px; font-weight: bold;">Email:</td>
                <td style="padding: 10px;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px; font-weight: bold;">Source:</td>
                <td style="padding: 10px;">Website Popup Enquiry</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Time:</td>
                <td style="padding: 10px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
              </tr>
            </table>
            
            <div style="margin-top: 30px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Action Required:</strong> Please contact this prospect to provide quotes and follow up.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        New Website Enquiry
        
        Name: ${name}
        Mobile: ${mobile}
        ${email ? `Email: ${email}` : ''}
        Source: Website Popup Enquiry
        Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        
        Please contact this prospect to provide quotes and follow up.
      `
    };

    await transporter.sendMail(mailOptions);

    console.log(`[Email API] Enquiry email sent successfully from ${name} (${mobile}) to wainsogps@gmail.com`);

    res.json({
      success: true,
      message: 'Enquiry submitted successfully'
    });

  } catch (error) {
    console.error('[Email API] Error submitting enquiry:', error);
    console.error('[Email API] Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    res.status(500).json({
      error: 'Failed to submit enquiry',
      message: error.message
    });
  }
});

// Cleanup expired codes periodically (every 15 minutes)
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [email, record] of verificationStore.entries()) {
    if (now > record.expiresAt) {
      verificationStore.delete(email);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`[Email API] Cleaned up ${cleaned} expired verification codes`);
  }
}, 15 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`[Email API] Server running on port ${PORT}`);
  console.log(`[Email API] SMTP Host: ${process.env.SMTP_HOST || 'smtp.zeptomail.eu'}`);
});

