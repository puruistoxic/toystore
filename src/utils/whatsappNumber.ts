/**
 * WhatsApp numbers for wa.me — prefer Company Settings → WhatsApp Number (public API).
 * Admin typically stores a 10-digit Indian mobile without country code; we prefix 91 when needed.
 */

const DEFAULT_DIGITS = '919911484404'; // +91 99114 84404

export function getFallbackWhatsAppDigits(): string {
  const env =
    typeof process !== 'undefined' && process.env.REACT_APP_WHATSAPP_FALLBACK
      ? String(process.env.REACT_APP_WHATSAPP_FALLBACK).replace(/\D/g, '')
      : '';
  if (env.length >= 10 && env.length <= 15) return env;
  return DEFAULT_DIGITS;
}

/** Digits only, suitable for `https://wa.me/{digits}` */
export function normalizeWhatsAppDigits(raw: string | undefined | null): string {
  let d = (raw ?? '').replace(/\D/g, '');
  if (!d) d = getFallbackWhatsAppDigits();
  else if (d.length === 10) d = `91${d}`;
  return d;
}

/** Fallback `tel:` when pages do not load company settings */
export const STORE_PHONE_TEL_HREF = 'tel:+919911484404';
