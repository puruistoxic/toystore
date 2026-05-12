import React from 'react';
import {
  Check,
  CreditCard,
  PackageOpen,
  ShoppingBag,
  Truck,
  XCircle,
  Home,
  Undo2,
} from 'lucide-react';

type StepKey = 'placed' | 'paid' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';

const STEPS: Array<{ key: StepKey; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'placed', label: 'Placed', Icon: ShoppingBag },
  { key: 'paid', label: 'Paid', Icon: CreditCard },
  { key: 'processing', label: 'Processing', Icon: PackageOpen },
  { key: 'shipped', label: 'Shipped', Icon: Truck },
  { key: 'out_for_delivery', label: 'Out for delivery', Icon: Truck },
  { key: 'delivered', label: 'Delivered', Icon: Home },
];

type Status =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'failed';

type Props = {
  status: Status | string;
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded' | string;
  createdAt: string;
  paidAt: string | null;
  cancelledAt?: string | null;
};

const STATUS_INDEX: Record<string, number> = {
  pending_payment: 0,
  paid: 1,
  processing: 2,
  shipped: 3,
  out_for_delivery: 4,
  delivered: 5,
};

function formatStepDate(value: string | null | undefined): string {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

const OrderTimeline: React.FC<Props> = ({
  status,
  paymentStatus,
  createdAt,
  paidAt,
  cancelledAt,
}) => {
  // Terminal "bad" states get a dedicated callout strip instead of the stepper.
  if (status === 'cancelled') {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 flex items-start gap-3">
        <div className="rounded-xl bg-gray-200 text-gray-700 p-2.5 shrink-0">
          <XCircle className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-display font-bold text-gray-900">Order cancelled</p>
          <p className="text-xs text-gray-600 mt-0.5">
            {cancelledAt ? `Cancelled on ${formatStepDate(cancelledAt)}` : 'This order is no longer being processed.'}
          </p>
        </div>
      </div>
    );
  }
  if (status === 'refunded') {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 flex items-start gap-3">
        <div className="rounded-xl bg-blue-100 text-blue-700 p-2.5 shrink-0">
          <Undo2 className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-display font-bold text-blue-900">Order refunded</p>
          <p className="text-xs text-blue-800 mt-0.5">
            Your payment has been refunded. Allow 5–7 business days for it to reflect in your account.
          </p>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_INDEX[status] ?? 0;
  // Payment-status acts as a soft override — if the order is still
  // "pending_payment" but webhook updated payment_status to paid first,
  // we still light up the Paid step.
  const paidStepDone = paymentStatus === 'paid' || currentIdx >= 1;
  const dateMap: Partial<Record<StepKey, string | null>> = {
    placed: createdAt,
    paid: paidAt,
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-display font-bold text-gray-900">Order progress</h2>
        {status === 'failed' && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 text-[11px] font-semibold">
            Payment failed
          </span>
        )}
      </div>

      {/* Mobile: vertical list */}
      <ol className="md:hidden space-y-3">
        {STEPS.map(({ key, label, Icon }, idx) => {
          const done = key === 'paid' ? paidStepDone : idx <= currentIdx;
          const current = idx === currentIdx && !(idx === 1 && paidStepDone && currentIdx === 0);
          return (
            <li key={key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`h-9 w-9 rounded-full border-2 flex items-center justify-center transition-colors ${
                    done
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : current
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-0.5 h-6 mt-1 ${done && idx + 1 <= currentIdx ? 'bg-emerald-600' : 'bg-gray-200'}`}
                  />
                )}
              </div>
              <div className="pt-1.5">
                <p
                  className={`text-sm font-semibold ${
                    done
                      ? 'text-gray-900'
                      : current
                      ? 'text-primary-800'
                      : 'text-gray-500'
                  }`}
                >
                  {label}
                </p>
                {done && dateMap[key] && (
                  <p className="text-xs text-gray-500">{formatStepDate(dateMap[key])}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Desktop: horizontal stepper */}
      <ol className="hidden md:flex items-start justify-between gap-2">
        {STEPS.map(({ key, label, Icon }, idx) => {
          const done = key === 'paid' ? paidStepDone : idx <= currentIdx;
          const current = idx === currentIdx;
          const nextDone =
            STEPS[idx + 1] &&
            (STEPS[idx + 1].key === 'paid' ? paidStepDone : idx + 1 <= currentIdx);
          return (
            <li key={key} className="flex-1 min-w-0 flex flex-col items-center relative">
              {idx < STEPS.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 right-0 h-0.5 ${
                    nextDone ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}
                  style={{ width: 'calc(100% - 2.5rem)', marginLeft: '1.25rem' }}
                  aria-hidden
                />
              )}
              <div
                className={`relative z-10 h-10 w-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                  done
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : current
                    ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <p
                className={`text-[11px] sm:text-xs font-semibold text-center mt-2 ${
                  done
                    ? 'text-gray-900'
                    : current
                    ? 'text-primary-800'
                    : 'text-gray-500'
                }`}
              >
                {label}
              </p>
              {done && dateMap[key] && (
                <p className="text-[10px] text-gray-500 text-center mt-0.5">
                  {formatStepDate(dateMap[key])}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default OrderTimeline;
