/**
 * Fire-and-forget lead activity logger.
 *
 * Use this anywhere the user initiates outreach we'd otherwise lose track of:
 * floating WhatsApp button, "Send via WhatsApp" CTAs, support links, popup
 * forms, etc. Source-of-truth tables (orders, enquiries, cart_enquiries) still
 * exist for the heavy flows — this logs lightweight context to `lead_logs`
 * so the admin "Leads" inbox catches everything.
 *
 * - Never throws; never blocks the action it's logging.
 * - Always best-effort: if the API fails, we still let the user open WhatsApp.
 */
import api from './api';

export type LeadChannel =
  | 'whatsapp'
  | 'email'
  | 'phone'
  | 'contact_form'
  | 'quote_request'
  | 'product_enquiry'
  | 'cart_enquiry'
  | 'order'
  | 'other';

export interface LogLeadInput {
  channel: LeadChannel;
  /** Component / page identifier — keep short, e.g. 'WhatsAppButton-floating' */
  source?: string;
  /** Freeform intent — 'product_enquiry', 'general_enquiry', 'support', etc. */
  intent?: string;
  product?: { id?: string | number | null; name?: string | null; slug?: string | null };
  contact?: { name?: string | null; email?: string | null; phone?: string | null };
  /** Destination WA number (digits only). */
  whatsapp_number?: string | null;
  /** Message body the customer will send / submitted. Will be clipped server-side. */
  message?: string | null;
  delivery_pincode?: string | null;
  related_type?: string | null;
  related_ref?: string | null;
  context?: Record<string, unknown> | null;
  customer_id?: number | null;
}

export async function logLead(input: LogLeadInput): Promise<void> {
  try {
    const payload = {
      ...input,
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
    };
    await api.post('/content/lead-logs', payload);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[leadLogger] failed', err);
    }
  }
}
