/**
 * Send storefront login OTP via Zavu (WhatsApp Cloud API path).
 *
 * Env:
 *   ZAVUDEV_API_KEY or WHATSAPP_OTP_API_KEY — Zavu project API key
 *   WHATSAPP_OTP_SENDER or ZAVU_SENDER_ID — optional Zavu sender profile id
 *   WHATSAPP_OTP_TEMPLATE_ID — Zavu / Meta-approved WhatsApp template id (tmpl_…).
 *       Body should include {{1}} for the 6-digit OTP (AUTHENTICATION templates work well).
 *   WHATSAPP_OTP_BRAND_NAME — optional short name shown in session-text fallback (default DigiDukaanLive)
 *   WHATSAPP_OTP_DEFAULT_CC — default country calling code without + (default 91)
 *
 * Without WHATSAPP_OTP_TEMPLATE_ID we attempt a free-form WhatsApp text message. That only
 * works inside the customer’s 24-hour service window; for cold OTP you must set a template id.
 */
const DEFAULT_CC = () => String(process.env.WHATSAPP_OTP_DEFAULT_CC || '91').replace(/\D/g, '') || '91';

/**
 * @param {string} digits — digits only, no +
 * @returns {string} E.164
 */
function toE164(digits) {
  const d = String(digits || '').replace(/\D/g, '');
  if (!d) throw new Error('Phone number is empty');
  const cc = DEFAULT_CC();
  if (d.length === 10 && /^[6-9]/.test(d) && cc === '91') {
    return `+${cc}${d}`;
  }
  if (d.length === 11 && d.startsWith('0') && cc === '91') {
    const rest = d.slice(1);
    if (/^[6-9]\d{9}$/.test(rest)) return `+${cc}${rest}`;
  }
  if (d.length >= 11 && d.length <= 15 && !d.startsWith('+')) {
    return `+${d}`;
  }
  if (d.length >= 8 && d.length <= 15) {
    return `+${d}`;
  }
  throw new Error('Unsupported phone number format');
}

/**
 * @param {{ phoneDigits: string, code: string, idempotencyKey?: string }} opts
 * @returns {Promise<{ messageId?: string, status?: string }>}
 */
async function sendZavuWhatsappOtp(opts) {
  const apiKey = (process.env.ZAVUDEV_API_KEY || process.env.WHATSAPP_OTP_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('Zavu API key is not configured');
  }

  const pkg = require('@zavudev/sdk');
  const Zavudev = pkg.default || pkg.Zavudev;
  const client = new Zavudev({ apiKey });

  const to = toE164(opts.phoneDigits);
  const code = String(opts.code || '').trim();
  const templateId = (process.env.WHATSAPP_OTP_TEMPLATE_ID || '').trim();
  const sender = (process.env.WHATSAPP_OTP_SENDER || process.env.ZAVU_SENDER_ID || '').trim();
  const brand = (process.env.WHATSAPP_OTP_BRAND_NAME || 'DigiDukaanLive').slice(0, 48);

  const params = {
    to,
    channel: 'whatsapp',
    fallbackEnabled: false,
    idempotencyKey: opts.idempotencyKey || `otp-${opts.phoneDigits}-${Date.now()}`,
  };
  if (sender) {
    params['Zavu-Sender'] = sender;
  }

  if (templateId) {
    params.messageType = 'template';
    params.content = {
      templateId,
      templateVariables: { 1: code },
    };
    const extra = parseExtraTemplateVars();
    if (extra) {
      params.content.templateVariables = { ...params.content.templateVariables, ...extra };
    }
  } else {
    params.messageType = 'text';
    params.text = `${brand}: your verification code is ${code}. Do not share this code. It expires in 5 minutes.`;
  }

  const resp = await client.messages.send(params);
  const msg = resp && resp.message;
  const status = msg && msg.status;
  if (status === 'failed') {
    const err = msg.errorMessage || msg.errorCode || 'WhatsApp delivery failed';
    throw new Error(String(err));
  }
  return { messageId: msg && msg.id, status: status || 'queued' };
}

/**
 * Optional JSON in WHATSAPP_OTP_TEMPLATE_VARS: {"2":"DigiDukaanLive"} for templates with variables beyond {{1}}.
 * Key "1" is always the OTP and is ignored here.
 */
function parseExtraTemplateVars() {
  const raw = (process.env.WHATSAPP_OTP_TEMPLATE_VARS || '').trim();
  if (!raw) return null;
  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
    const out = {};
    for (const [k, v] of Object.entries(o)) {
      if (k === '1') continue;
      if (typeof v === 'string' && v.length) out[k] = v.slice(0, 200);
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

module.exports = { sendZavuWhatsappOtp, toE164 };
