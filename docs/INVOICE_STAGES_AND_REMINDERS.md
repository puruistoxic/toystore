# Invoice Stages and Payment Reminders

## Overview

This document describes the enhanced invoice management system with elaborate status tracking and automated payment reminders.

## Features

### 1. Enhanced Invoice Status Stages

The system now supports 12 different invoice statuses:

- **Draft** - Initial creation, not yet finalized
- **Pending Approval** - Awaiting internal approval
- **Approved** - Approved and ready to send
- **Sent** - Sent to client
- **Viewed** - Client has viewed the invoice
- **Partial** - Partially paid
- **Paid** - Fully paid
- **Overdue** - Past due date, not paid
- **Disputed** - Client has disputed the invoice
- **On Hold** - Temporarily on hold
- **Cancelled** - Invoice cancelled
- **Refunded** - Payment refunded

### 2. Payment Reminder System

#### Reminder Types

- **Before Due Date** - Send reminder X days before due date
- **On Due Date** - Send reminder on the due date
- **After Due Date** - Send reminder X days after due date
- **Custom Date** - Schedule reminder for a specific date

#### Features

- Schedule multiple reminders per invoice
- Send reminders immediately or schedule for later
- Track which reminders have been sent
- Professional email templates with invoice details
- Automatic email tracking

### 3. Email Reminders

#### Email Template Includes

- Professional branded design
- Invoice number and details
- Due date (highlighted if overdue)
- Amount due (with partial payment info if applicable)
- Payment terms
- Company contact information
- Responsive design for mobile devices

#### Email Content

The email automatically adjusts based on:
- Reminder type (before/on/after due)
- Days overdue (for after due reminders)
- Payment status (partial payments shown)
- Payment terms (if configured)

## Database Schema

### invoice_reminders Table

```sql
CREATE TABLE invoice_reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id VARCHAR(50) NOT NULL,
  reminder_type ENUM('before_due', 'on_due', 'after_due', 'custom'),
  reminder_date DATE NOT NULL,
  days_before_after INT DEFAULT 0,
  email_sent TINYINT(1) DEFAULT 0,
  email_sent_at TIMESTAMP NULL,
  email_subject VARCHAR(255),
  email_body TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_invoice (invoice_id),
  INDEX idx_reminder_date (reminder_date),
  INDEX idx_email_sent (email_sent),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);
```

### Updated invoices Table

The `status` column now supports:
```sql
status ENUM('draft', 'pending_approval', 'approved', 'sent', 'viewed', 
            'partial', 'paid', 'overdue', 'disputed', 'on_hold', 
            'cancelled', 'refunded')
```

## API Endpoints

### Reminders

- `GET /api/invoicing/invoices/:id/reminders` - Get all reminders for an invoice
- `POST /api/invoicing/invoices/:id/reminders` - Create a new reminder
- `POST /api/invoicing/invoices/:id/reminders/:reminderId/send` - Send a scheduled reminder
- `POST /api/invoicing/invoices/:id/send-reminder` - Send reminder immediately
- `DELETE /api/invoicing/invoices/:id/reminders/:reminderId` - Delete a reminder

## Usage

### In Invoice List Page

1. Click the **Mail** icon (orange) next to any invoice
2. View scheduled reminders or send one immediately
3. Schedule new reminders with custom dates

### In Invoice Edit Page

1. Click the **"Reminders"** button in the top right
2. Manage all reminders for the invoice
3. Send immediate reminders or schedule future ones

### Scheduling a Reminder

1. Click "Schedule Reminder" button
2. Select reminder type:
   - **Before Due Date**: Enter days before (e.g., 3 days before)
   - **On Due Date**: Automatically set to due date
   - **After Due Date**: Enter days after (e.g., 1 day after)
   - **Custom Date**: Select any specific date
3. Click "Schedule" to save

### Sending Reminders

- **Send Now**: Click "Send Now" button for immediate delivery
- **Send Scheduled**: Click the send icon on a scheduled reminder
- Reminders are automatically marked as sent after delivery

## Email Configuration

The system uses the existing SMTP configuration:

- **SMTP Host**: Configured in environment variables
- **From Email**: Uses company email from settings
- **Templates**: Professional HTML templates with fallback text

## Status Workflow Recommendations

### Standard Workflow

1. **Draft** → Create invoice
2. **Pending Approval** → Submit for review (optional)
3. **Approved** → Ready to send
4. **Sent** → Email sent to client
5. **Viewed** → Client viewed (if tracking enabled)
6. **Partial** → Partial payment received
7. **Paid** → Full payment received

### Problem Resolution Workflow

1. **Overdue** → Past due date
2. **Disputed** → Client disputes invoice
3. **On Hold** → Temporarily paused
4. **Cancelled** → Invoice cancelled
5. **Refunded** → Payment refunded

## Payment Terms

Payment terms can be configured in the invoice form:
- Net 30, Net 15, etc.
- Custom terms
- Displayed in reminder emails

## Best Practices

1. **Schedule Multiple Reminders**
   - 3 days before due date (friendly reminder)
   - On due date (important reminder)
   - 1 day after (urgent reminder)
   - 7 days after (final reminder)

2. **Status Management**
   - Update status as invoice progresses
   - Use "Disputed" for client concerns
   - Use "On Hold" for temporary pauses

3. **Email Tracking**
   - Monitor which reminders have been sent
   - Resend if needed using "Send Now"

## Future Enhancements

Potential improvements:
- Automated status updates based on due dates
- Recurring reminder schedules
- SMS reminders
- Reminder analytics and reports
- Custom email templates per client
- Bulk reminder scheduling

## Troubleshooting

### Reminders Not Sending

1. Check SMTP configuration in environment variables
2. Verify client email address is present
3. Check server logs for email errors
4. Verify SMTP credentials are correct

### Status Not Updating

1. Ensure database migration ran successfully
2. Check status enum values match database
3. Clear browser cache if UI not updating

## Migration Notes

When upgrading:
1. Database will automatically add new status enum values
2. Existing invoices keep their current status
3. Reminder table is created automatically
4. No data loss during migration
