import type { CartLine } from '../contexts/CartContext';
import { getCanonicalUrl } from './seo';

export function buildCartEnquiryWhatsAppMessage(
  lines: CartLine[],
  note?: string,
  requestRef?: string | null,
): string {
  const totalQty = lines.reduce((s, l) => s + l.quantity, 0);
  let message = `Hello DigiDukaanLive Team,\n\n`;
  if (requestRef?.trim()) {
    message += `Order request reference: ${requestRef.trim()}\n\n`;
  }
  message += `I'd like to request an order / quote for my buying list (${lines.length} product(s), ${totalQty} item(s) total):\n\n`;

  lines.forEach((l, i) => {
    const url = getCanonicalUrl(`/products/${l.slug}`);
    message += `${i + 1}. ${l.name}\n`;
    if (l.brand) message += `   Brand: ${l.brand}\n`;
    message += `   Quantity: ${l.quantity}\n`;
    if (l.note?.trim()) message += `   Note: ${l.note.trim()}\n`;
    message += `   Link: ${url}\n\n`;
  });

  if (note?.trim()) {
    message += `Note: ${note.trim()}\n\n`;
  }

  message += `Please confirm availability, prices, and how I can order or visit.\n\nThank you!`;
  return message;
}
