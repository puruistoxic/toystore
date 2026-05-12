export type OrderListItem = {
  public_ref: string;
  status: string;
  payment_status: string;
  subtotal_amount: number;
  total_amount: number;
  currency: string;
  item_count: number;
  items_preview: Array<{
    id: number;
    name: string;
    image_url: string | null;
    quantity: number;
  }>;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  paid_at: string | null;
  cancelled_at: string | null;
  ship_city: string | null;
  ship_state: string | null;
  ship_postal_code: string | null;
};

export type OrderStats = {
  total_orders: number;
  paid_orders: number;
  pending_payment_orders: number;
  lifetime_spent: number;
  status_counts: Record<string, number>;
  payment_counts: Record<string, number>;
};

export type CustomerAddress = {
  id: number;
  label: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: number | boolean;
  created_at: string;
};

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Awaiting payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  failed: 'Payment failed',
};

export const ORDER_STATUS_BADGE: Record<string, string> = {
  pending_payment: 'bg-amber-50 text-amber-900 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  processing: 'bg-blue-50 text-blue-900 border-blue-200',
  shipped: 'bg-sky-50 text-sky-900 border-sky-200',
  out_for_delivery: 'bg-violet-50 text-violet-900 border-violet-200',
  delivered: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
  refunded: 'bg-gray-100 text-gray-700 border-gray-200',
  failed: 'bg-red-50 text-red-900 border-red-200',
};

export function formatINR(value: number): string {
  return `₹${(value || 0).toLocaleString('en-IN')}`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      dateStyle: 'medium',
    });
  } catch {
    return value;
  }
}
