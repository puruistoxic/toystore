const nodemailer = require('nodemailer');

function createSmtpTransporter() {
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zeptomail.eu',
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: {
      user: process.env.SMTP_USER || 'emailapikey',
      pass: process.env.SMTP_PASSWORD || '',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

module.exports = { createSmtpTransporter };
