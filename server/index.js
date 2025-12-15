const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { initDatabase, getPool, testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
const adminRoutes = require('./routes/admin');
const contentRoutes = require('./routes/content');
const uploadRoutes = require('./routes/upload');
const invoicingRoutes = require('./routes/invoicing');

app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/invoicing', invoicingRoutes);

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
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({ 
    status: 'ok', 
    service: 'wainso-email-api',
    database: dbStatus ? 'connected' : 'disconnected'
  });
});


// Quote request submission endpoint
app.post('/api/quote-request', async (req, res) => {
  try {
    const { name, email, phone, company, itemName, itemType, category, budget, timeline, location, industry, quantity, notes, message } = req.body;

    if (!name || !phone || !itemName) {
      return res.status(400).json({
        error: 'Name, phone number, and item/service name are required'
      });
    }

    // Send quote request email to business
    const transporter = createTransporter();
    
    // Format the message as HTML with better structure
    const formatMessageForEmail = (msg) => {
      return msg
        .split('\n')
        .map(line => {
          if (line.trim().startsWith('•')) {
            return `<li style="margin: 8px 0;">${line.replace('•', '').trim()}</li>`;
          } else if (line.trim() === '') {
            return '<br>';
          } else {
            return `<p style="margin: 8px 0;">${line}</p>`;
          }
        })
        .join('');
    };
    
    const htmlMessage = formatMessageForEmail(message);
    
    // Email to business
    const businessMailOptions = {
      from: `"WAINSO" <noreply@wainso.com>`,
      to: 'wainsogps@gmail.com', // Business email
      replyTo: email || undefined,
      subject: `New Quote Request - ${itemName || 'WAINSO'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Quote Request</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #006767 0%, #004d4d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">WAINSO</h1>
            <p style="color: #e6f7f7; margin: 10px 0 0 0; font-size: 14px;">IT & ERP Solutions</p>
            <h2 style="color: #ffffff; margin: 20px 0 0 0; font-size: 20px; font-weight: normal;">New Quote Request</h2>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #006767;">
              <div style="font-size: 15px; line-height: 1.8; color: #333;">
                ${htmlMessage}
              </div>
            </div>
            
            <h3 style="color: #006767; margin-top: 0; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #006767; padding-bottom: 10px;">Contact Information</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td style="padding: 12px; font-weight: bold; width: 150px; border-bottom: 1px solid #e0e0e0; background-color: #f8f9fa;">Name:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${name}</td>
              </tr>
              ${company ? `
              <tr>
                <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #e0e0e0; background-color: #f8f9fa;">Company:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${company}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #e0e0e0; background-color: #f8f9fa;">Phone:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;"><a href="tel:${phone}" style="color: #006767; text-decoration: none;">${phone}</a></td>
              </tr>
              ${email ? `
              <tr>
                <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #e0e0e0; background-color: #f8f9fa;">Email:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;"><a href="mailto:${email}" style="color: #006767; text-decoration: none;">${email}</a></td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #e0e0e0; background-color: #f8f9fa;">Source:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">Website Quote Request Form</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-weight: bold; background-color: #f8f9fa;">Time:</td>
                <td style="padding: 12px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
              </tr>
            </table>
            
            <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #e6f7f7 0%, #d4f1f1 100%); border-left: 4px solid #006767; border-radius: 4px;">
              <p style="margin: 0; font-size: 15px; color: #004d4d; font-weight: bold;">
                ⚡ Action Required
              </p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #006767;">
                Please review this quote request and contact the prospect to provide pricing and next steps.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>WAINSO | <a href="https://wainso.com" style="color: #006767;">wainso.com</a></p>
          </div>
        </body>
        </html>
      `,
      text: message
    };

    await transporter.sendMail(businessMailOptions);
    
    // Send confirmation email to the sender (if email provided)
    if (email && email.trim()) {
      const confirmationMailOptions = {
        from: `"WAINSO" <noreply@wainso.com>`,
        to: email,
        subject: `Thank you for your quote request - ${itemName || 'WAINSO'}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Quote Request Confirmation</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background: linear-gradient(135deg, #006767 0%, #004d4d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">WAINSO</h1>
              <p style="color: #e6f7f7; margin: 10px 0 0 0; font-size: 14px;">IT & ERP Solutions</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #006767; margin-top: 0;">Thank You for Your Quote Request!</h2>
              
              <p>Dear ${name},</p>
              
              <p>We have successfully received your quote request for <strong>${itemName || 'our services'}</strong>.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #006767;">
                <h3 style="color: #006767; margin-top: 0; font-size: 16px;">Request Summary</h3>
                <ul style="margin: 10px 0; padding-left: 20px; color: #555;">
                  ${itemName ? `<li><strong>Item/Service:</strong> ${itemName}</li>` : ''}
                  ${itemType ? `<li><strong>Type:</strong> ${itemType}</li>` : ''}
                  ${budget ? `<li><strong>Budget:</strong> ${budget}</li>` : ''}
                  ${timeline ? `<li><strong>Timeline:</strong> ${timeline}</li>` : ''}
                  ${location ? `<li><strong>Location:</strong> ${location}</li>` : ''}
                </ul>
              </div>
              
              <p><strong>What happens next?</strong></p>
              <ol style="color: #555; line-height: 1.8;">
                <li>Our team will review your requirements</li>
                <li>We'll prepare a detailed quote based on your specifications</li>
                <li>You'll receive a response within 24-48 hours</li>
                <li>For urgent requests, we'll prioritize and respond faster</li>
              </ol>
              
              <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #e6f7f7 0%, #d4f1f1 100%); border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #006767;">
                  <strong>Need immediate assistance?</strong><br>
                  Call us at <a href="tel:+919899860975" style="color: #004d4d; font-weight: bold; text-decoration: none;">+91 98998 60975</a>
                </p>
              </div>
              
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                If you have any questions or need to modify your request, please don't hesitate to contact us.
              </p>
              
              <p style="margin-top: 20px;">
                Best regards,<br>
                <strong>WAINSO</strong>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px; padding: 20px; background: #ffffff; border-radius: 10px;">
              <p style="margin: 5px 0;"><strong>WAINSO</strong></p>
              <p style="margin: 5px 0;">Room No-9, 1st Floor, Yadav Complex</p>
              <p style="margin: 5px 0;">Near Block Chawck, Block Chowk, Ramgarh Cantt - 829122, Jharkhand</p>
              <p style="margin: 5px 0;">
                Phone: <a href="tel:+919899860975" style="color: #006767;">+91 98998 60975</a> | 
                <a href="tel:+918292717044" style="color: #006767;">+91 82927 17044</a>
              </p>
              <p style="margin: 5px 0;">
                Email: <a href="mailto:wainsogps@gmail.com" style="color: #006767;">wainsogps@gmail.com</a>
              </p>
              <p style="margin: 5px 0;">
                Website: <a href="https://wainso.com" style="color: #006767;">wainso.com</a>
              </p>
            </div>
          </body>
          </html>
        `,
        text: `
          WAINSO
          
          Thank You for Your Quote Request!
          
          Dear ${name},
          
          We have successfully received your quote request for ${itemName || 'our services'}.
          
          Request Summary:
          ${itemName ? `- Item/Service: ${itemName}` : ''}
          ${itemType ? `- Type: ${itemType}` : ''}
          ${budget ? `- Budget: ${budget}` : ''}
          ${timeline ? `- Timeline: ${timeline}` : ''}
          ${location ? `- Location: ${location}` : ''}
          
          What happens next?
          1. Our team will review your requirements
          2. We'll prepare a detailed quote based on your specifications
          3. You'll receive a response within 24-48 hours
          4. For urgent requests, we'll prioritize and respond faster
          
          Need immediate assistance?
          Call us at +91 98998 60975
          
          If you have any questions or need to modify your request, please don't hesitate to contact us.
          
          Best regards,
          WAINSO
          
          ---
          WAINSO
          Room No-9, 1st Floor, Yadav Complex
          Near Block Chawck, Block Chowk, Ramgarh Cantt - 829122, Jharkhand
          Phone: +91 98998 60975 | +91 82927 17044
          Email: wainsogps@gmail.com
          Website: https://wainso.com
        `
      };
      
      try {
        await transporter.sendMail(confirmationMailOptions);
        console.log(`[Email API] Confirmation email sent to ${email}`);
      } catch (confirmationError) {
        // Don't fail the main request if confirmation email fails
        console.error('[Email API] Failed to send confirmation email (non-critical):', confirmationError);
      }
    }

    // Store quote request in database
    const pool = getPool();
    try {
      await pool.execute(
        `INSERT INTO quote_requests 
         (name, email, phone, company, item_name, item_type, category, budget, timeline, location, industry, quantity, notes, message, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          email || null,
          phone,
          company || null,
          itemName,
          itemType || null,
          category || null,
          budget || null,
          timeline || null,
          location || null,
          industry || null,
          quantity || null,
          notes || null,
          message || null,
          'Website Quote Request Form'
        ]
      );
      console.log(`[Email API] Quote request saved to database and email sent successfully from ${name} (${phone}) to wainsogps@gmail.com`);
    } catch (dbError) {
      // Log error but don't fail the request if database insert fails
      console.error('[Email API] Database error (non-critical):', dbError);
      console.log(`[Email API] Email sent successfully but database save failed for ${name} (${phone})`);
    }

    res.json({
      success: true,
      message: 'Quote request sent successfully'
    });

  } catch (error) {
    console.error('[Email API] Error sending quote request:', error);
    console.error('[Email API] Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    res.status(500).json({
      error: 'Failed to send quote request',
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
      from: `"WAINSO" <noreply@wainso.com>`,
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

    // Store enquiry in database
    const pool = getPool();
    await pool.execute(
      'INSERT INTO enquiries (name, mobile, email, source) VALUES (?, ?, ?, ?)',
      [name, mobile, email || null, 'Website Popup Enquiry']
    );

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


// Initialize database and start server
(async () => {
  try {
    // Initialize database first
    console.log('[Server] Initializing database...');
    try {
      await initDatabase();
      console.log('[Server] ✅ Database initialized successfully');
      
      // Test database connection
      const dbConnected = await testConnection();
      if (dbConnected) {
        console.log(
          `[Server] ✅ Database connected: ${process.env.MYSQL_HOST || '192.168.1.210'}/${process.env.MYSQL_DATABASE || 'wainsodb'}`
        );
      } else {
        console.error(`[Server] ⚠️  WARNING: Database connection test failed!`);
        console.error(`[Server] The server will start but database operations may fail.`);
      }
    } catch (dbError) {
      console.error('[Server] ❌ Database initialization failed:', dbError.message);
      console.error('[Server] ⚠️  The server will start but database operations will fail.');
      console.error('[Server] Please check your database configuration and restart the server.');
    }
    
    // Start server - bind to 0.0.0.0 to accept connections from Docker network
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] ✅ Server running on 0.0.0.0:${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Server] SMTP Host: ${process.env.SMTP_HOST || 'smtp.zeptomail.eu'}`);
      console.log(`[Server] Available endpoints:`);
      console.log(`  - POST /api/admin/login`);
      console.log(`  - GET /api/admin/verify`);
      console.log(`  - POST /api/quote-request`);
      console.log(`  - POST /api/enquiry`);
      console.log(`  - GET /health`);
      console.log(`  - All /api/content/* routes`);
      console.log(`  - All /api/upload/* routes`);
    });
  } catch (error) {
    console.error('[Server] ❌ Failed to start server:', error);
    console.error('[Server] Error details:', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
})();

