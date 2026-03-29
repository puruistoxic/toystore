export type OrderRequestPdfItem = {
  product_name: string;
  quantity: number;
  product_slug?: string | null;
  unit_price?: number | null;
  brand?: string | null;
  /** Per-line note from cart (stored as line_note in API JSON) */
  line_note?: string | null;
};

export type OrderRequestPdfInput = {
  request_ref: string;
  created_at: string;
  items: OrderRequestPdfItem[];
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  custom_message?: string | null;
  status?: string | null;
};
