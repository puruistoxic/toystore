import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Loader2,
  Copy,
  Package,
  MapPin,
  CreditCard,
  Truck,
  RotateCw,
  StickyNote,
  History,
  Phone,
  Mail,
  ShoppingCart,
  PackageOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { storefrontAdminApi } from '../../utils/api';
import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../contexts/AuthContext';
import { canManageOrders } from '../../utils/roles';
import { describeEvent, getEventToneClasses } from '../account/orderEvents';

const ORDER_STATUSES = [
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded',
  'failed',
] as const;

const PAYMENT_STATUSES = ['unpaid', 'paid', 'failed', 'refunded'] as const;

const STATUS_FLOW: Array<{ value: string; label: string; Icon: typeof ShoppingCart }> = [
  { value: 'pending_payment', label: 'Awaiting payment', Icon: CreditCard },
  { value: 'paid', label: 'Paid', Icon: CheckCircle2 },
  { value: 'processing', label: 'Processing', Icon: PackageOpen },
  { value: 'shipped', label: 'Shipped', Icon: Truck },
  { value: 'out_for_delivery', label: 'Out for delivery', Icon: Truck },
  { value: 'delivered', label: 'Delivered', Icon: CheckCircle2 },
];

function statusBadgeClasses(s: string): string {
  switch (s) {
    case 'pending_payment':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'paid':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'processing':
      return 'bg-sky-50 text-sky-800 border-sky-200';
    case 'shipped':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    case 'out_for_delivery':
      return 'bg-violet-50 text-violet-800 border-violet-200';
    case 'delivered':
      return 'bg-green-50 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'refunded':
      return 'bg-pink-50 text-pink-800 border-pink-200';
    case 'failed':
      return 'bg-red-50 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

function formatMoney(amount: number | string, cur = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: cur || 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

type OrderDetail = {
  order: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
  events: Array<{
    id: number | string;
    event_type: string;
    message?: string | null;
    meta_json?: Record<string, unknown> | null;
    created_at: string;
  }>;
  customer: Record<string, unknown> | null;
};

export default function StoreOrderDetailPage() {
  const { publicRef } = useParams<{ publicRef: string }>();
  const ref = publicRef ? decodeURIComponent(publicRef) : '';
  const qc = useQueryClient();
  const { showAlert, showConfirm } = useAlert();
  const { user } = useAuth();
  const canEdit = canManageOrders(user?.role);

  const [notesDraft, setNotesDraft] = useState('');
  const [shipDraft, setShipDraft] = useState({
    shipping_carrier: '',
    tracking_number: '',
    tracking_url: '',
  });
  const [eventDraft, setEventDraft] = useState('');
  const [eventVisibility, setEventVisibility] = useState<'internal' | 'customer'>('internal');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-store-order', ref],
    queryFn: async () => {
      const res = await storefrontAdminApi.getOrder(ref);
      return res.data as OrderDetail;
    },
    enabled: !!ref,
  });

  useEffect(() => {
    if (data?.order) {
      const o = data.order as Record<string, unknown>;
      setNotesDraft(typeof o.notes === 'string' ? (o.notes as string) : '');
      setShipDraft({
        shipping_carrier: typeof o.shipping_carrier === 'string' ? (o.shipping_carrier as string) : '',
        tracking_number: typeof o.tracking_number === 'string' ? (o.tracking_number as string) : '',
        tracking_url: typeof o.tracking_url === 'string' ? (o.tracking_url as string) : '',
      });
    }
  }, [data?.order]);

  const patchMutation = useMutation({
    mutationFn: (payload: Parameters<typeof storefrontAdminApi.patchOrder>[1]) =>
      storefrontAdminApi.patchOrder(ref, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin-store-order', ref] });
      qc.invalidateQueries({ queryKey: ['admin-store-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-store-order-stats'] });
    },
    onError: async (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      await showAlert({
        type: 'error',
        title: 'Update failed',
        message: msg || 'Could not save changes.',
      });
    },
  });

  const refundMutation = useMutation({
    mutationFn: (payload: { amount?: number | null; reason?: string | null; method?: string | null }) =>
      storefrontAdminApi.refundOrder(ref, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin-store-order', ref] });
      qc.invalidateQueries({ queryKey: ['admin-store-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-store-order-stats'] });
      await showAlert({ type: 'success', title: 'Refunded', message: 'Order marked as refunded.' });
    },
    onError: async (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      await showAlert({
        type: 'error',
        title: 'Refund failed',
        message: msg || 'Could not record refund.',
      });
    },
  });

  const eventMutation = useMutation({
    mutationFn: (payload: { message: string; visibility?: 'internal' | 'customer' }) =>
      storefrontAdminApi.addOrderEvent(ref, payload),
    onSuccess: async () => {
      setEventDraft('');
      await qc.invalidateQueries({ queryKey: ['admin-store-order', ref] });
    },
    onError: async (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      await showAlert({
        type: 'error',
        title: 'Note failed',
        message: msg || 'Could not save note.',
      });
    },
  });

  const trackUrl =
    typeof window !== 'undefined' && ref
      ? `${window.location.origin}/account/orders/${encodeURIComponent(ref)}`
      : '';

  const copyTrack = async () => {
    if (!trackUrl) return;
    try {
      await navigator.clipboard.writeText(trackUrl);
      await showAlert({
        type: 'success',
        title: 'Copied',
        message: 'Customer tracking link copied to clipboard.',
      });
    } catch {
      /* ignore */
    }
  };

  if (!ref) {
    return (
      <AdminLayout title="Order">
        <p className="text-gray-600">Invalid reference.</p>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout title="Order">
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  if (isError || !data?.order) {
    return (
      <AdminLayout title="Order">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
          {(error as Error)?.message || 'Order not found.'}
        </div>
        <Link
          to="/admin/store/orders"
          className="inline-block mt-4 text-primary-700 font-semibold hover:underline"
        >
          ← Back to orders
        </Link>
      </AdminLayout>
    );
  }

  const o = data.order as Record<string, unknown>;
  const status = String(o.status || '');
  const paymentStatus = String(o.payment_status || '');
  const customer = data.customer as Record<string, unknown> | null;

  // Pre-stringify common fields so JSX doesn't have to inspect `unknown` types.
  const orderRef = String(o.public_ref || '');
  const orderContactName = o.contact_name ? String(o.contact_name) : '';
  const orderContactEmail = o.contact_email ? String(o.contact_email) : '';
  const orderContactPhone = o.contact_phone ? String(o.contact_phone) : '';
  const orderCreatedAt = o.created_at ? String(o.created_at) : '';
  const customerEmail = customer?.email ? String(customer.email) : '';
  const customerPhone = customer?.phone ? String(customer.phone) : '';
  const customerName = customer?.full_name
    ? String(customer.full_name)
    : customerEmail || customerPhone || '—';

  const flowIndex = STATUS_FLOW.findIndex((s) => s.value === status);
  const isTerminalBad = status === 'cancelled' || status === 'refunded' || status === 'failed';

  const subtotal = Number(o.subtotal_amount) || 0;
  const shippingAmount = Number(o.shipping_amount) || 0;
  const discountAmount = Number(o.discount_amount) || 0;
  const taxAmount = Number(o.tax_amount) || 0;
  const totalAmount = Number(o.total_amount) || 0;
  const refundAmount = Number(o.refund_amount) || 0;

  const onRefund = async () => {
    if (!canEdit) return;
    const confirmed = await showConfirm({
      title: 'Refund order',
      message: `Mark this order as refunded? You can record the full ${formatMoney(totalAmount)} or a smaller amount.`,
      confirmText: 'Continue',
    });
    if (!confirmed) return;
    const reason = window.prompt('Reason (optional, max 500 chars):', '') || '';
    const amountStr = window.prompt(
      `Refund amount in INR (default ${totalAmount}):`,
      String(totalAmount),
    );
    if (amountStr === null) return;
    const amount = Number(amountStr);
    if (!Number.isFinite(amount) || amount < 0 || amount > totalAmount) {
      await showAlert({
        type: 'error',
        title: 'Invalid amount',
        message: `Enter a value between 0 and ${totalAmount}.`,
      });
      return;
    }
    refundMutation.mutate({ amount, reason: reason || null });
  };

  return (
    <AdminLayout title={String(o.public_ref || 'Order')}>
      <div className="space-y-6">
        <Link
          to="/admin/store/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          All orders
        </Link>

        {/* Header card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-display font-bold text-gray-900">{orderRef}</h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadgeClasses(status)}`}
                >
                  {status.replace(/_/g, ' ')}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    paymentStatus === 'paid'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : paymentStatus === 'refunded'
                        ? 'bg-pink-50 text-pink-800 border-pink-200'
                        : paymentStatus === 'failed'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  Payment: {paymentStatus}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Created{' '}
                {orderCreatedAt
                  ? new Date(orderCreatedAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : ''}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium">{orderContactName || '—'}</span>
                {orderContactEmail ? (
                  <>
                    {' · '}
                    <a
                      href={`mailto:${orderContactEmail}`}
                      className="text-primary-700 hover:underline"
                    >
                      {orderContactEmail}
                    </a>
                  </>
                ) : null}
                {orderContactPhone ? (
                  <>
                    {' · '}
                    <a
                      href={`tel:${orderContactPhone}`}
                      className="text-primary-700 hover:underline"
                    >
                      {orderContactPhone}
                    </a>
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={trackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4" />
                Open customer view
              </a>
              <button
                type="button"
                onClick={copyTrack}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Copy className="h-4 w-4" />
                Copy link
              </button>
            </div>
          </div>

          {/* Stepper */}
          {!isTerminalBad && (
            <div className="mt-6 overflow-x-auto">
              <ol className="flex items-center gap-2 min-w-fit">
                {STATUS_FLOW.map((step, idx) => {
                  const passed = idx <= flowIndex;
                  const current = idx === flowIndex;
                  const Icon = step.Icon;
                  return (
                    <li key={step.value} className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold border whitespace-nowrap ${
                          current
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : passed
                              ? 'bg-primary-50 text-primary-700 border-primary-200'
                              : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {step.label}
                      </div>
                      {idx < STATUS_FLOW.length - 1 && (
                        <div
                          className={`h-px w-6 ${passed ? 'bg-primary-300' : 'bg-gray-200'}`}
                          aria-hidden
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
          {isTerminalBad && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {status === 'cancelled' ? (
                <XCircle className="h-4 w-4 text-gray-600" />
              ) : status === 'refunded' ? (
                <RotateCw className="h-4 w-4 text-pink-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              This order ended as <strong className="ml-1 capitalize">{status}</strong>.
              {refundAmount > 0 && status === 'refunded' && (
                <span className="text-pink-700 font-semibold ml-1">
                  Refund {formatMoney(refundAmount)}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary-600" />
                Line items ({data.items?.length || 0})
              </h2>
              <ul className="mt-4 divide-y divide-gray-100">
                {(data.items || []).map((it) => {
                  const itr = it as Record<string, unknown>;
                  return (
                    <li key={String(itr.id)} className="py-3 flex gap-4">
                      {itr.image_url ? (
                        <img
                          src={String(itr.image_url)}
                          alt=""
                          className="h-16 w-16 rounded-lg object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-100 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900">{String(itr.product_name || '')}</p>
                        <p className="text-xs text-gray-500">
                          ×{String(itr.quantity || 1)} @ {formatMoney(Number(itr.unit_price) || 0)}
                          {itr.brand ? ` · ${String(itr.brand)}` : ''}
                        </p>
                        {itr.line_note ? (
                          <p className="text-xs text-gray-600 italic mt-0.5">
                            “{String(itr.line_note)}”
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right font-semibold text-gray-900">
                        {formatMoney(Number(itr.line_total) || 0)}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <dl className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Subtotal</dt>
                  <dd className="text-gray-900">{formatMoney(subtotal)}</dd>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Discount</dt>
                    <dd>− {formatMoney(discountAmount)}</dd>
                  </div>
                )}
                {shippingAmount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Shipping</dt>
                    <dd className="text-gray-900">{formatMoney(shippingAmount)}</dd>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Tax</dt>
                    <dd className="text-gray-900">{formatMoney(taxAmount)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-base font-display font-bold pt-1.5 border-t border-gray-100 mt-1.5">
                  <dt className="text-gray-900">Total</dt>
                  <dd className="text-gray-900">{formatMoney(totalAmount)}</dd>
                </div>
                {refundAmount > 0 && (
                  <div className="flex justify-between text-pink-700">
                    <dt>Refunded</dt>
                    <dd>− {formatMoney(refundAmount)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Shipping address */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary-600" />
                Shipping address
              </h2>
              <div className="mt-3 text-sm text-gray-700 space-y-0.5">
                <p className="font-medium text-gray-900">
                  {String(o.ship_full_name || o.contact_name || '—')}
                </p>
                <p>{String(o.ship_phone || o.contact_phone || '')}</p>
                <p>{[o.ship_line1, o.ship_line2, o.ship_landmark].filter(Boolean).join(', ') || '—'}</p>
                <p>
                  {[o.ship_city, o.ship_state, o.ship_postal_code].filter(Boolean).join(', ')}{' '}
                  {String(o.ship_country || '')}
                </p>
              </div>
            </div>

            {/* Activity */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
                <History className="h-5 w-5 text-primary-600" />
                Activity
              </h2>

              {canEdit && (
                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-600">New note</span>
                    <div className="ml-auto inline-flex rounded-lg border border-gray-200 bg-white p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setEventVisibility('internal')}
                        className={`px-2 py-1 rounded-md font-semibold ${
                          eventVisibility === 'internal'
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Internal
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventVisibility('customer')}
                        className={`px-2 py-1 rounded-md font-semibold ${
                          eventVisibility === 'customer'
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Customer-visible
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={eventDraft}
                    onChange={(e) => setEventDraft(e.target.value)}
                    rows={2}
                    placeholder={
                      eventVisibility === 'customer'
                        ? 'Will appear on the customer tracking page…'
                        : 'Only visible to the team…'
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={!eventDraft.trim() || eventMutation.isPending}
                      onClick={() =>
                        eventMutation.mutate({ message: eventDraft.trim(), visibility: eventVisibility })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                    >
                      {eventMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      Add note
                    </button>
                  </div>
                </div>
              )}

              <ul className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {(data.events || []).map((ev) => {
                  const style = describeEvent(String(ev.event_type || ''));
                  const Icon = style.Icon;
                  return (
                    <li key={String(ev.id)} className="flex gap-3">
                      <div
                        className={`shrink-0 mt-0.5 h-8 w-8 rounded-full border flex items-center justify-center ${getEventToneClasses(style.tone)}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{style.label}</p>
                        {ev.message ? (
                          <p className="text-sm text-gray-600">{ev.message}</p>
                        ) : null}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {ev.created_at
                            ? new Date(ev.created_at).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : ''}
                          {(() => {
                            const meta =
                              ev.meta_json && typeof ev.meta_json === 'object'
                                ? (ev.meta_json as Record<string, unknown>)
                                : null;
                            const adminUser = meta?.admin_user ? String(meta.admin_user) : '';
                            if (!adminUser) return null;
                            return (
                              <>
                                {' · '}
                                by{' '}
                                <span className="font-medium text-gray-500">{adminUser}</span>
                              </>
                            );
                          })()}
                        </p>
                      </div>
                    </li>
                  );
                })}
                {!data.events?.length && (
                  <li className="text-sm text-gray-500 text-center py-4">
                    No activity recorded yet.
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            {/* Fulfilment */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary-600" />
                Fulfilment
              </h2>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Order status</label>
                <select
                  value={status}
                  onChange={(e) => patchMutation.mutate({ status: e.target.value })}
                  disabled={!canEdit || patchMutation.isPending}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Payment status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => patchMutation.mutate({ payment_status: e.target.value })}
                  disabled={!canEdit || patchMutation.isPending}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Razorpay webhooks set this automatically for online payments. Use manual updates for COD or
                  reconciliation.
                </p>
              </div>
              {canEdit && status !== 'refunded' && (
                <button
                  type="button"
                  onClick={onRefund}
                  disabled={refundMutation.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-pink-200 bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-800 hover:bg-pink-100 disabled:opacity-50"
                >
                  {refundMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCw className="h-4 w-4" />
                  )}
                  Mark refunded
                </button>
              )}
            </div>

            {/* Shipment tracking */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
              <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary-600" />
                Shipment
              </h2>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Carrier</label>
                <input
                  value={shipDraft.shipping_carrier}
                  onChange={(e) =>
                    setShipDraft((d) => ({ ...d, shipping_carrier: e.target.value }))
                  }
                  disabled={!canEdit}
                  placeholder="Delhivery, BlueDart, DTDC…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tracking number / AWB</label>
                <input
                  value={shipDraft.tracking_number}
                  onChange={(e) =>
                    setShipDraft((d) => ({ ...d, tracking_number: e.target.value }))
                  }
                  disabled={!canEdit}
                  className="w-full font-mono rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tracking URL</label>
                <input
                  value={shipDraft.tracking_url}
                  onChange={(e) => setShipDraft((d) => ({ ...d, tracking_url: e.target.value }))}
                  disabled={!canEdit}
                  placeholder="https://…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
                />
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() =>
                    patchMutation.mutate({
                      shipping_carrier: shipDraft.shipping_carrier || null,
                      tracking_number: shipDraft.tracking_number || null,
                      tracking_url: shipDraft.tracking_url || null,
                    })
                  }
                  disabled={patchMutation.isPending}
                  className="w-full rounded-xl bg-primary-600 text-white py-2.5 text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
                >
                  {patchMutation.isPending ? 'Saving…' : 'Save shipment'}
                </button>
              )}
            </div>

            {/* Notes */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
              <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-primary-600" />
                Internal notes
              </h2>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={4}
                disabled={!canEdit}
                placeholder="Only visible inside admin & support…"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
              />
              {canEdit && (
                <button
                  type="button"
                  onClick={() => patchMutation.mutate({ notes: notesDraft })}
                  disabled={patchMutation.isPending}
                  className="w-full rounded-xl bg-gray-900 text-white py-2.5 text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
                >
                  Save notes
                </button>
              )}
            </div>

            {/* Customer */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-3">Customer</h2>
              {customer ? (
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-gray-900">{customerName}</p>
                  {customerEmail ? (
                    <p className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a
                        href={`mailto:${customerEmail}`}
                        className="text-primary-700 hover:underline truncate"
                      >
                        {customerEmail}
                      </a>
                    </p>
                  ) : null}
                  {customerPhone ? (
                    <p className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a
                        href={`tel:${customerPhone}`}
                        className="text-primary-700 hover:underline"
                      >
                        {customerPhone}
                      </a>
                    </p>
                  ) : null}
                  <Link
                    to={`/admin/store/customers/${String(customer.id ?? '')}`}
                    className="text-primary-700 font-semibold text-sm hover:underline mt-1 inline-block"
                  >
                    View customer →
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Guest checkout — no linked customer account yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
