import type { CartLine } from '../contexts/CartContext';
import type { OrderRequestPdfInput, OrderRequestPdfItem } from '../types/orderRequest';

export function pdfItemsFromCartLines(lines: CartLine[]): OrderRequestPdfItem[] {
  return lines.map((l) => ({
    product_name: l.name,
    quantity: l.quantity,
    product_slug: l.slug,
    unit_price: l.price > 0 ? l.price : null,
    brand: l.brand || null,
    line_note: l.note?.trim() || null,
  }));
}

function coercePdfItem(row: Record<string, unknown>): OrderRequestPdfItem {
  const qty = Math.max(1, parseInt(String(row.quantity ?? 1), 10) || 1);
  let unit_price: number | null = null;
  if (row.unit_price != null && row.unit_price !== '') {
    const p = parseFloat(String(row.unit_price));
    if (!Number.isNaN(p) && p >= 0) {
      unit_price = p;
    }
  }
  const line_note =
    row.line_note != null && String(row.line_note).trim() !== ''
      ? String(row.line_note).trim()
      : null;
  return {
    product_name: String(row.product_name ?? '').trim() || 'Item',
    quantity: qty,
    product_slug: row.product_slug != null ? String(row.product_slug).trim() : null,
    unit_price,
    brand: row.brand != null && String(row.brand).trim() !== '' ? String(row.brand).trim() : null,
    line_note,
  };
}

export function orderRequestPdfInputFromApi(data: {
  request_ref?: string | null;
  created_at?: string;
  items?: unknown;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  custom_message?: string | null;
  status?: string | null;
}): OrderRequestPdfInput {
  const rawItems = Array.isArray(data.items) ? data.items : [];
  return {
    request_ref: data.request_ref != null ? String(data.request_ref) : '',
    created_at: data.created_at || new Date().toISOString(),
    items: rawItems.map((it) => coercePdfItem(it as Record<string, unknown>)),
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    customer_email: data.customer_email,
    custom_message: data.custom_message,
    status: data.status,
  };
}

export function buildPdfInputAfterSubmit(params: {
  request_ref: string;
  created_at: string;
  lines: CartLine[];
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  custom_message: string;
}): OrderRequestPdfInput {
  return {
    request_ref: params.request_ref,
    created_at: params.created_at,
    items: pdfItemsFromCartLines(params.lines),
    customer_name: params.customer_name.trim() || null,
    customer_phone: params.customer_phone.trim() || null,
    customer_email: params.customer_email.trim() || null,
    custom_message: params.custom_message.trim() || null,
    status: 'new',
  };
}
