const { createSmtpTransporter } = require('../utils/smtpTransporter');

function escapeHtml(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {import('mysql2/promise').Pool} pool
 * @param {object} payload
 */
async function notifyAdminProductEnquiry(pool, payload) {
  const adminTo =
    (process.env.ADMIN_ALERT_EMAIL && String(process.env.ADMIN_ALERT_EMAIL).trim()) || null;
  let to = adminTo;
  if (!to) {
    try {
      const [rows] = await pool.execute(
        'SELECT email FROM company_settings WHERE email IS NOT NULL AND TRIM(email) != "" ORDER BY id DESC LIMIT 1',
      );
      if (rows.length && rows[0].email) {
        to = String(rows[0].email).trim();
      }
    } catch (e) {
      console.warn('[EnquiryLead] Could not load company_settings.email:', e.message);
    }
  }
  if (!to) {
    console.warn(
      '[EnquiryLead] No admin email: set ADMIN_ALERT_EMAIL or company_settings.email — skipping lead email',
    );
    return { sent: false, reason: 'no_recipient' };
  }

  const from =
    process.env.SMTP_FROM ||
    process.env.NOTIFICATION_FROM ||
    '"Khandelwal Toy Store" <noreply@khandelwaltoystore.com>';

  const {
    enquiryId,
    product_name,
    product_slug,
    quantity,
    customer_name,
    customer_phone,
    customer_email,
    custom_message,
  } = payload;

  const subject = `New product lead #${enquiryId}: ${product_name || 'Enquiry'}`;

  const rows = [
    ['Enquiry ID', String(enquiryId)],
    ['Product', escapeHtml(product_name)],
    ['Slug', escapeHtml(product_slug || '—')],
    ['Quantity', String(quantity ?? '—')],
    ['Name', escapeHtml(customer_name || '—')],
    ['Phone', escapeHtml(customer_phone || '—')],
    ['Email', escapeHtml(customer_email || '—')],
    ['Message', escapeHtml(custom_message || '—')],
    ['Time', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
  ];

  const tableHtml = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px;font-weight:bold;width:140px;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:8px;">${v}</td></tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:640px;">
<p style="font-size:16px;margin:0 0 12px;">A customer submitted a <strong>WhatsApp product enquiry</strong> on the website. Details are saved in <code>enquiries</code>.</p>
<table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">${tableHtml}</table>
<p style="margin-top:16px;font-size:14px;color:#444;">Reply via WhatsApp when they send the chat, or reach out using the phone/email above if provided.</p>
</body></html>`;

  const text = `New product lead #${enquiryId}
Product: ${product_name}
Quantity: ${quantity}
Name: ${customer_name || '—'}
Phone: ${customer_phone || '—'}
Email: ${customer_email || '—'}
Message: ${custom_message || '—'}
`;

  try {
    const transporter = createSmtpTransporter();
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      replyTo: customer_email || undefined,
    });
    console.log(`[EnquiryLead] Admin alert sent to ${to} for enquiry #${enquiryId}`);
    return { sent: true };
  } catch (err) {
    console.error('[EnquiryLead] Failed to send admin email:', err.message);
    return { sent: false, reason: err.message };
  }
}

/**
 * @param {import('mysql2/promise').Pool} pool
 * @param {object} payload
 */
async function notifyAdminCartEnquiry(pool, payload) {
  const adminTo =
    (process.env.ADMIN_ALERT_EMAIL && String(process.env.ADMIN_ALERT_EMAIL).trim()) || null;
  let to = adminTo;
  if (!to) {
    try {
      const [rows] = await pool.execute(
        'SELECT email FROM company_settings WHERE email IS NOT NULL AND TRIM(email) != "" ORDER BY id DESC LIMIT 1',
      );
      if (rows.length && rows[0].email) {
        to = String(rows[0].email).trim();
      }
    } catch (e) {
      console.warn('[CartEnquiry] Could not load company_settings.email:', e.message);
    }
  }
  if (!to) {
    console.warn('[CartEnquiry] No admin email — skipping cart lead email');
    return { sent: false, reason: 'no_recipient' };
  }

  const from =
    process.env.SMTP_FROM ||
    process.env.NOTIFICATION_FROM ||
    '"Khandelwal Toy Store" <noreply@khandelwaltoystore.com>';

  const {
    cartId,
    public_ref,
    items,
    customer_name,
    customer_phone,
    customer_email,
    custom_message,
  } = payload;

  const linesText = (items || [])
    .map((it, i) => {
      let line = `${i + 1}. ${it.product_name} × ${it.quantity}${it.product_slug ? ` — slug: ${it.product_slug}` : ''}`;
      if (it.line_note && String(it.line_note).trim()) {
        line += `\n   Note: ${String(it.line_note).trim()}`;
      }
      return line;
    })
    .join('\n');

  const refLabel = public_ref ? String(public_ref) : `#${cartId}`;
  const subject = `New order request ${refLabel} (${(items || []).length} item(s))`;

  const listItemsHtml = (items || [])
    .map((it, i) => {
      const note =
        it.line_note && String(it.line_note).trim()
          ? `<div style="margin-top:4px;font-size:13px;color:#444;">Note: ${escapeHtml(String(it.line_note).trim())}</div>`
          : '';
      return `<li style="margin:6px 0;">${escapeHtml(String(i + 1))}. ${escapeHtml(it.product_name)} × <strong>${escapeHtml(String(it.quantity))}</strong>${it.product_slug ? ` <span style="color:#666;">(${escapeHtml(it.product_slug)})</span>` : ''}${note}</li>`;
    })
    .join('');

  const metaRows = [
    ['Reference', public_ref ? String(public_ref) : '—'],
    ['Internal ID', String(cartId)],
    ['Name', customer_name || '—'],
    ['Phone', customer_phone || '—'],
    ['Email', customer_email || '—'],
    ['Note', custom_message || '—'],
    ['Time', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px;font-weight:bold;width:120px;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:8px;">${escapeHtml(v)}</td></tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:640px;">
<p style="font-size:16px;margin:0 0 12px;">A customer submitted an <strong>order request</strong> (buying list) on the website. Saved in <code>cart_enquiries</code>.</p>
<p style="font-weight:bold;margin:16px 0 8px;">Items</p>
<ol style="margin:0;padding-left:20px;">${listItemsHtml}</ol>
<table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;margin-top:20px;">${metaRows}</table>
</body></html>`;

  const text = `New order request ${refLabel}
${linesText}

Name: ${customer_name || '—'}
Phone: ${customer_phone || '—'}
Email: ${customer_email || '—'}
Note: ${custom_message || '—'}
`;

  try {
    const transporter = createSmtpTransporter();
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      replyTo: customer_email || undefined,
    });
    console.log(`[CartEnquiry] Admin alert sent to ${to} for cart #${cartId}`);
    return { sent: true };
  } catch (err) {
    console.error('[CartEnquiry] Failed to send admin email:', err.message);
    return { sent: false, reason: err.message };
  }
}

module.exports = { notifyAdminProductEnquiry, notifyAdminCartEnquiry };

