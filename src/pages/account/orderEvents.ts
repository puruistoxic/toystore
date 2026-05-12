import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Info,
  PackageCheck,
  PackageOpen,
  PackagePlus,
  Receipt,
  RotateCw,
  ShieldAlert,
  ShoppingBag,
  Truck,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export type EventStyle = {
  label: string;
  Icon: LucideIcon;
  tone: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
};

const TONE_CLASSES: Record<EventStyle['tone'], string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function getEventToneClasses(tone: EventStyle['tone']): string {
  return TONE_CLASSES[tone];
}

const MAP: Record<string, EventStyle> = {
  'order.created': { label: 'Order placed', Icon: ShoppingBag, tone: 'info' },
  'order.updated': { label: 'Order updated', Icon: PackagePlus, tone: 'info' },
  'order.cancelled': { label: 'Order cancelled', Icon: XCircle, tone: 'neutral' },
  'order.refunded': { label: 'Order refunded', Icon: RotateCw, tone: 'info' },

  'razorpay.order_created': {
    label: 'Payment session started',
    Icon: CreditCard,
    tone: 'info',
  },
  'payment.captured': {
    label: 'Payment received',
    Icon: CheckCircle2,
    tone: 'success',
  },
  'webhook.payment_captured': {
    label: 'Payment confirmed by bank',
    Icon: CheckCircle2,
    tone: 'success',
  },
  'payment.failed': { label: 'Payment failed', Icon: AlertTriangle, tone: 'danger' },
  'payment.signature_invalid': {
    label: 'Payment verification failed',
    Icon: ShieldAlert,
    tone: 'danger',
  },
  'payment.refunded': { label: 'Refund issued', Icon: Receipt, tone: 'info' },

  'order.processing': { label: 'Preparing your order', Icon: PackageOpen, tone: 'info' },
  'order.shipped': { label: 'Shipped', Icon: Truck, tone: 'info' },
  'order.out_for_delivery': {
    label: 'Out for delivery',
    Icon: Truck,
    tone: 'info',
  },
  'order.delivered': { label: 'Delivered', Icon: PackageCheck, tone: 'success' },
};

export function describeEvent(eventType: string): EventStyle {
  const found = MAP[eventType];
  if (found) return found;
  return {
    label: (eventType || '').replace(/_/g, ' ').replace(/\./g, ' → '),
    Icon: Info,
    tone: 'neutral',
  };
}
