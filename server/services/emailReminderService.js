const nodemailer = require('nodemailer');
const { getPool } = require('../db');

// Create SMTP transporter
const createTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT || '587');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zeptomail.eu',
    port: port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: {
      user: process.env.SMTP_USER || 'emailapikey',
      pass: process.env.SMTP_PASSWORD || ''
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Generate email template for payment reminder
 */
function generateReminderEmail(invoice, client, companySettings, reminderType = 'after_due') {
  const dueDate = new Date(invoice.due_date);
  const today = new Date();
  const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
  
  let subject = '';
  let urgency = '';
  
  switch (reminderType) {
    case 'before_due':
      subject = `Payment Reminder: Invoice ${invoice.invoice_number} - Due Soon`;
      urgency = 'friendly';
      break;
    case 'on_due':
      subject = `Payment Due Today: Invoice ${invoice.invoice_number}`;
      urgency = 'important';
      break;
    case 'after_due':
      subject = `Payment Overdue: Invoice ${invoice.invoice_number} - ${daysOverdue} Day${daysOverdue !== 1 ? 's' : ''} Overdue`;
      urgency = 'urgent';
      break;
    default:
      subject = `Payment Reminder: Invoice ${invoice.invoice_number}`;
      urgency = 'friendly';
  }

  const companyName = companySettings?.company_name || 'WAINSO';
  const companyEmail = companySettings?.email || 'wainsogps@gmail.com';
  const companyPhone = companySettings?.phone || '';
  const companyAddress = [
    companySettings?.address_line1,
    companySettings?.address_line2,
    companySettings?.address_line3,
    companySettings?.city,
    companySettings?.state,
    companySettings?.postal_code
  ].filter(Boolean).join(', ');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #006767; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">${companyName}</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Payment Reminder</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear ${client.name || 'Valued Customer'},
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${reminderType === 'before_due' 
                  ? `This is a friendly reminder that payment for Invoice <strong>${invoice.invoice_number}</strong> is due on <strong>${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.`
                  : reminderType === 'on_due'
                  ? `This is to remind you that payment for Invoice <strong>${invoice.invoice_number}</strong> is due <strong>today</strong> (${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}).`
                  : `This is a reminder that payment for Invoice <strong>${invoice.invoice_number}</strong> is now <strong>${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue</strong>. The due date was ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`
                }
              </p>
              
              <!-- Invoice Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 6px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #333333;">Invoice Number:</strong>
                    <span style="color: #666666; margin-left: 10px;">${invoice.invoice_number}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #333333;">Invoice Date:</strong>
                    <span style="color: #666666; margin-left: 10px;">${new Date(invoice.issue_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #333333;">Due Date:</strong>
                    <span style="color: ${reminderType === 'after_due' ? '#d32f2f' : '#666666'}; margin-left: 10px; font-weight: ${reminderType === 'after_due' ? 'bold' : 'normal'};">
                      ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #333333;">Amount Due:</strong>
                    <span style="color: #006767; margin-left: 10px; font-size: 18px; font-weight: bold;">
                      ₹${parseFloat(invoice.total - (invoice.paid_amount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
                ${invoice.paid_amount > 0 ? `
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #333333;">Amount Paid:</strong>
                    <span style="color: #666666; margin-left: 10px;">₹${parseFloat(invoice.paid_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </td>
                </tr>
                ` : ''}
              </table>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                ${reminderType === 'after_due' 
                  ? 'We would appreciate your immediate attention to this matter. Please arrange payment at your earliest convenience to avoid any inconvenience.'
                  : 'Please ensure payment is made by the due date to avoid any late fees or service interruptions.'
                }
              </p>
              
              ${invoice.payment_terms ? `
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0; padding: 15px; background-color: #f0f0f0; border-left: 4px solid #006767; border-radius: 4px;">
                <strong>Payment Terms:</strong> ${invoice.payment_terms}
              </p>
              ` : ''}
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                If you have already made the payment, please disregard this reminder. If you have any questions or concerns, please don't hesitate to contact us.
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0 10px 0;">
                Thank you for your business.
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0;">
                Best regards,<br>
                <strong>${companyName}</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 12px; line-height: 1.6; margin: 0 0 10px 0;">
                ${companyAddress ? `${companyAddress}<br>` : ''}
                ${companyPhone ? `Phone: ${companyPhone}<br>` : ''}
                ${companyEmail ? `Email: ${companyEmail}` : ''}
              </p>
              <p style="color: #999999; font-size: 11px; margin: 10px 0 0 0;">
                This is an automated payment reminder. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
${companyName} - Payment Reminder

Dear ${client.name || 'Valued Customer'},

${reminderType === 'before_due' 
  ? `This is a friendly reminder that payment for Invoice ${invoice.invoice_number} is due on ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`
  : reminderType === 'on_due'
  ? `This is to remind you that payment for Invoice ${invoice.invoice_number} is due today (${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}).`
  : `This is a reminder that payment for Invoice ${invoice.invoice_number} is now ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue. The due date was ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`
}

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Invoice Date: ${new Date(invoice.issue_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
- Due Date: ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
- Amount Due: ₹${parseFloat(invoice.total - (invoice.paid_amount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
${invoice.paid_amount > 0 ? `- Amount Paid: ₹${parseFloat(invoice.paid_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}

${invoice.payment_terms ? `Payment Terms: ${invoice.payment_terms}\n` : ''}

If you have already made the payment, please disregard this reminder.

Thank you for your business.

Best regards,
${companyName}

${companyAddress ? `${companyAddress}\n` : ''}${companyPhone ? `Phone: ${companyPhone}\n` : ''}${companyEmail ? `Email: ${companyEmail}` : ''}
  `;

  return { subject, html, text };
}

/**
 * Send payment reminder email
 */
async function sendReminderEmail(invoiceId, reminderId = null) {
  const pool = getPool();
  
  try {
    // Get invoice with client and company settings
    const [invoiceRows] = await pool.execute(`
      SELECT i.*, c.name as client_name, c.email as client_email, c.phone as client_phone, c.company as client_company
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.id = ? AND i.is_deleted = 0
    `, [invoiceId]);
    
    if (invoiceRows.length === 0) {
      throw new Error('Invoice not found');
    }
    
    const invoice = invoiceRows[0];
    const client = {
      name: invoice.client_name,
      email: invoice.client_email,
      phone: invoice.client_phone,
      company: invoice.client_company
    };
    
    if (!client.email) {
      throw new Error('Client email not found');
    }
    
    // Get company settings
    const [settingsRows] = await pool.execute('SELECT * FROM company_settings LIMIT 1');
    const companySettings = settingsRows[0] || {};
    
    // Get reminder details if reminderId provided
    let reminderType = 'after_due';
    if (reminderId) {
      const [reminderRows] = await pool.execute(
        'SELECT * FROM invoice_reminders WHERE id = ?',
        [reminderId]
      );
      if (reminderRows.length > 0) {
        reminderType = reminderRows[0].reminder_type;
      }
    }
    
    // Generate email
    const { subject, html, text } = generateReminderEmail(invoice, client, companySettings, reminderType);
    
    // Send email
    const transporter = createTransporter();
    const mailOptions = {
      from: `"${companySettings.company_name || 'WAINSO'}" <${process.env.SMTP_FROM_EMAIL || companySettings.email || 'noreply@wainso.com'}>`,
      to: client.email,
      subject: subject,
      html: html,
      text: text
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // Update reminder record if exists
    if (reminderId) {
      await pool.execute(
        'UPDATE invoice_reminders SET email_sent = 1, email_sent_at = NOW() WHERE id = ?',
        [reminderId]
      );
    }
    
    return {
      success: true,
      messageId: info.messageId,
      subject,
      sentTo: client.email
    };
  } catch (error) {
    console.error('[Email Reminder] Error sending reminder:', error);
    throw error;
  }
}

/**
 * Create and schedule a reminder
 */
async function createReminder(invoiceId, reminderType, reminderDate, daysBeforeAfter = 0, createdBy = null) {
  const pool = getPool();
  
  try {
    // Get invoice to generate email content
    const [invoiceRows] = await pool.execute(
      'SELECT * FROM invoices WHERE id = ? AND is_deleted = 0',
      [invoiceId]
    );
    
    if (invoiceRows.length === 0) {
      throw new Error('Invoice not found');
    }
    
    const invoice = invoiceRows[0];
    const [clientRows] = await pool.execute(
      'SELECT name, email FROM clients WHERE id = ?',
      [invoice.client_id]
    );
    
    if (clientRows.length === 0 || !clientRows[0].email) {
      throw new Error('Client email not found');
    }
    
    const [settingsRows] = await pool.execute('SELECT * FROM company_settings LIMIT 1');
    const companySettings = settingsRows[0] || {};
    
    const { subject, text } = generateReminderEmail(
      invoice,
      { name: clientRows[0].name, email: clientRows[0].email },
      companySettings,
      reminderType
    );
    
    // Insert reminder
    const [result] = await pool.execute(`
      INSERT INTO invoice_reminders 
      (invoice_id, reminder_type, reminder_date, days_before_after, email_subject, email_body, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      invoiceId,
      reminderType,
      reminderDate,
      daysBeforeAfter,
      subject,
      text,
      createdBy
    ]);
    
    return {
      success: true,
      reminderId: result.insertId
    };
  } catch (error) {
    console.error('[Email Reminder] Error creating reminder:', error);
    throw error;
  }
}

/**
 * Get reminders for an invoice
 */
async function getInvoiceReminders(invoiceId) {
  const pool = getPool();
  
  const [rows] = await pool.execute(`
    SELECT * FROM invoice_reminders 
    WHERE invoice_id = ? 
    ORDER BY reminder_date ASC, created_at DESC
  `, [invoiceId]);
  
  return rows;
}

/**
 * Delete a reminder
 */
async function deleteReminder(reminderId) {
  const pool = getPool();
  
  await pool.execute('DELETE FROM invoice_reminders WHERE id = ?', [reminderId]);
  
  return { success: true };
}

module.exports = {
  sendReminderEmail,
  createReminder,
  getInvoiceReminders,
  deleteReminder,
  generateReminderEmail
};
