import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  CreditCard,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  Printer,
  RefreshCcw,
  Share2,
  ShoppingCart,
  X,
  XCircle,
} from 'lucide-react';
import SEO from '../../components/SEO';
import customerApi from '../../utils/customerApi';
import api from '../../utils/api';
import { loadRazorpayScript } from '../../utils/razorpay';
import { useCart } from '../../contexts/CartContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { handleImageError } from '../../utils/imagePlaceholder';
import {
  ORDER_STATUS_BADGE,
  ORDER_STATUS_LABEL,
  formatDateTime,
  formatINR,
} from './accountTypes';
import OrderTimeline from './OrderTimeline';
import { describeEvent, getEventToneClasses } from './orderEvents';
import { normalizeWhatsAppDigits } from '../../utils/whatsappNumber';
import { logLead } from '../../utils/leadLogger';
import type { Product } from '../../types/catalog';

type OrderDetail = {
  public_ref: string;
  contact: { email: string | null; phone: string | null; name: string | null };
  shipping_address: {
    full_name: string;
    phone: string;
    line1: string;
    line2: string | null;
    landmark: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  } | null;
  amounts: {
    subtotal: number;
    shipping: number;
    discount: number;
    tax: number;
    total: number;
    currency: string;
  };
  status: string;
  payment_status: string;
  payment: {
    method: string | null;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    paid_at: string | null;
  };
  items: Array<{
    id: number;
    product_id: string | null;
    product_slug: string | null;
    product_name: string;
    brand: string | null;
    unit_price: number;
    quantity: number;
    line_total: number;
    image_url: string | null;
    line_note: string | null;
  }>;
  events: Array<{
    id: number;
    event_type: string;
    message: string | null;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
  cancelled_at?: string | null;
};

const PAYMENT_BADGE: Record<string, { label: string; className: string }> = {
  paid: {
    label: 'Paid',
    className: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  },
  unpaid: {
    label: 'Unpaid',
    className: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  failed: {
    label: 'Payment failed',
    className: 'bg-red-50 text-red-900 border-red-200',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-blue-50 text-blue-900 border-blue-200',
  },
};

const OrderTrackPage: React.FC = () => {
  const { publicRef } = useParams<{ publicRef: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { addProduct } = useCart();
  const { customer } = useCustomerAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyDone, setCopyDone] = useState(false);
  const [shareDone, setShareDone] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [whatsappDigits, setWhatsappDigits] = useState<string>('');

  const flag = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const fetchOrder = useCallback(async () => {
    if (!publicRef) return;
    try {
      const res = await customerApi.get<{ order: OrderDetail }>(
        `/orders/${encodeURIComponent(publicRef)}`,
      );
      setOrder(res.data.order);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(status === 404 ? 'Order not found.' : 'Could not load order.');
    } finally {
      setLoading(false);
    }
  }, [publicRef]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Pick up the company WhatsApp number for the "Get help" deep link.
  useEffect(() => {
    let cancelled = false;
    api
      .get<{ whatsapp_number?: string }>('/content/company-settings/public')
      .then((res) => {
        if (cancelled) return;
        setWhatsappDigits(normalizeWhatsAppDigits(res.data?.whatsapp_number));
      })
      .catch(() => {
        if (cancelled) return;
        setWhatsappDigits(normalizeWhatsAppDigits(null));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // If we just came back from Razorpay, poll briefly for the webhook to land.
  useEffect(() => {
    if (!order) return;
    if (order.payment_status !== 'paid' && flag.get('paid') === '1') {
      const t = window.setInterval(fetchOrder, 3000);
      const stop = window.setTimeout(() => window.clearInterval(t), 30_000);
      return () => {
        window.clearInterval(t);
        window.clearTimeout(stop);
      };
    }
  }, [order, flag, fetchOrder]);

  async function retryPayment() {
    if (!order) return;
    setRetrying(true);
    setActionError(null);
    try {
      const payRes = await customerApi.post<{
        key_id: string;
        razorpay_order_id: string;
        amount: number;
        currency: string;
        prefill?: { name?: string; email?: string; contact?: string };
      }>(`/orders/${encodeURIComponent(order.public_ref)}/pay`);

      await loadRazorpayScript();
      const w = window as unknown as {
        Razorpay?: new (opts: unknown) => {
          open: () => void;
          on: (e: string, cb: (r: unknown) => void) => void;
        };
      };
      if (!w.Razorpay) throw new Error('Razorpay failed to load');
      const inst = new w.Razorpay({
        key: payRes.data.key_id,
        amount: payRes.data.amount,
        currency: payRes.data.currency,
        name: 'DigiDukaanLive',
        description: `Order ${order.public_ref}`,
        order_id: payRes.data.razorpay_order_id,
        prefill: payRes.data.prefill,
        theme: { color: '#0d9488' },
        handler: async (resp: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await customerApi.post(
              `/orders/${encodeURIComponent(order.public_ref)}/confirm`,
              resp,
            );
          } catch {
            /* webhook may catch */
          }
          await fetchOrder();
          setRetrying(false);
        },
        modal: { ondismiss: () => setRetrying(false) },
      });
      inst.on('payment.failed', (r: unknown) => {
        setRetrying(false);
        const desc =
          (r as { error?: { description?: string } })?.error?.description ||
          'Payment failed. Please try again.';
        setActionError(desc);
      });
      inst.open();
    } catch (err: unknown) {
      setRetrying(false);
      setActionError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          (err as Error)?.message ||
          'Could not start payment.',
      );
    }
  }

  async function cancelOrder() {
    if (!order) return;
    if (!window.confirm(`Cancel order ${order.public_ref}? This cannot be undone.`)) return;
    setCancelling(true);
    setActionError(null);
    try {
      await customerApi.post(`/orders/${encodeURIComponent(order.public_ref)}/cancel`);
      await fetchOrder();
    } catch (err: unknown) {
      setActionError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Could not cancel order.',
      );
    } finally {
      setCancelling(false);
    }
  }

  async function reorderItems() {
    if (!order) return;
    setReordering(true);
    setActionError(null);
    try {
      const res = await customerApi.post<{
        items: Array<{
          product_id: string | null;
          product_slug: string | null;
          product_name: string;
          brand: string | null;
          unit_price: number;
          quantity: number;
          image_url: string | null;
        }>;
      }>(`/orders/${encodeURIComponent(order.public_ref)}/reorder`);
      let added = 0;
      for (const it of res.data.items || []) {
        if (!it.product_id) continue;
        const productLike = {
          id: it.product_id,
          slug: it.product_slug || '',
          name: it.product_name,
          brand: it.brand || undefined,
          price: it.unit_price,
          images: it.image_url ? [it.image_url] : [],
        } as unknown as Product;
        addProduct(productLike, { quantity: it.quantity });
        added += 1;
      }
      if (added === 0) {
        setActionError('These items are no longer available to reorder.');
      } else {
        navigate('/cart');
      }
    } catch (err: unknown) {
      setActionError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Could not reorder.',
      );
    } finally {
      setReordering(false);
    }
  }

  const onCopyRef = useCallback(() => {
    if (!publicRef) return;
    navigator.clipboard.writeText(publicRef).then(() => {
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 1500);
    });
  }, [publicRef]);

  const onShare = useCallback(async () => {
    if (!order) return;
    const shareUrl = `${window.location.origin}/account/orders/${encodeURIComponent(order.public_ref)}`;
    const shareData = {
      title: `Order ${order.public_ref}`,
      text: `Order ${order.public_ref} on DigiDukaanLive`,
      url: shareUrl,
    };
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    try {
      if (nav.share) {
        await nav.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareDone(true);
        window.setTimeout(() => setShareDone(false), 2000);
      }
    } catch {
      /* user cancelled — no-op */
    }
  }, [order]);

  const onPrint = useCallback(() => {
    window.print();
  }, []);

  const supportMessage = useMemo(() => {
    if (!order) return '';
    return `Hi DigiDukaanLive,\n\nI need help with order ${order.public_ref} (₹${order.amounts.total.toLocaleString(
      'en-IN',
    )}). Status: ${order.status.replace(/_/g, ' ')}.\n\n`;
  }, [order]);

  const supportHref = useMemo(() => {
    if (!supportMessage) return '';
    return whatsappDigits
      ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(supportMessage)}`
      : '';
  }, [supportMessage, whatsappDigits]);

  const onSupportClick = useCallback(() => {
    if (!order || !supportMessage) return;
    void logLead({
      channel: 'whatsapp',
      source: 'OrderTrackPage-support',
      intent: 'order_support',
      contact: {
        name: order.contact?.name || null,
        email: order.contact?.email || null,
        phone: order.contact?.phone || null,
      },
      whatsapp_number: whatsappDigits || null,
      message: supportMessage,
      related_type: 'order',
      related_ref: order.public_ref,
      context: { status: order.status, payment_status: order.payment_status },
    });
  }, [order, supportMessage, whatsappDigits]);

  const canRetry = order?.status === 'pending_payment';
  const canCancel = order?.status === 'pending_payment';
  const canReorder =
    order &&
    ['paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].includes(
      order.status,
    );

  const paymentBadge =
    order && (PAYMENT_BADGE[order.payment_status] || PAYMENT_BADGE.unpaid);
  const orderStatusBadgeClass = order
    ? ORDER_STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'
    : '';

  return (
    <>
      <SEO
        title={publicRef ? `Order ${publicRef}` : 'Order'}
        description="Track your DigiDukaanLive order, view delivery details, and download your receipt."
        path={`/account/orders/${publicRef || ''}`}
        robots="noindex, nofollow"
      />

      {/* Print stylesheet — keep the body clean and white when printing */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .print-card { box-shadow: none !important; border: 1px solid #e5e7eb !important; break-inside: avoid; }
          .print-hide-bg { background: #fff !important; color: #111 !important; box-shadow: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg print-hide-bg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <Link
              to={customer ? '/account/orders' : '/'}
              className="no-print inline-flex items-center gap-2 text-primary-100 hover:text-white text-sm font-medium mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              {customer ? 'Back to my orders' : 'Back to home'}
            </Link>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-primary-100 text-xs sm:text-sm uppercase tracking-wider font-semibold">
                  Order details
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold font-display mt-1 flex items-center gap-2">
                  <Package className="h-7 w-7 shrink-0" />
                  <span className="font-mono text-xl sm:text-2xl break-all">
                    {publicRef}
                  </span>
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 space-y-5">
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-600">
              Loading…
            </div>
          ) : error || !order ? (
            <div className="bg-white rounded-2xl border border-red-100 p-8 text-center text-gray-700">
              {error || 'Order not found.'}
            </div>
          ) : (
            <>
              {/* Top status bar — distinct order status vs payment status */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 print-card">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onCopyRef}
                    className="no-print inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copyDone ? 'Copied' : 'Copy reference'}
                  </button>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${orderStatusBadgeClass}`}
                  >
                    <span className="text-[10px] uppercase tracking-wider opacity-70">
                      Order
                    </span>
                    <span aria-hidden>·</span>
                    {ORDER_STATUS_LABEL[order.status] || order.status}
                  </span>
                  {paymentBadge && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${paymentBadge.className}`}
                    >
                      <span className="text-[10px] uppercase tracking-wider opacity-70">
                        Payment
                      </span>
                      <span aria-hidden>·</span>
                      {order.payment_status === 'paid' ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : order.payment_status === 'failed' ? (
                        <XCircle className="h-3.5 w-3.5" />
                      ) : (
                        <Loader2 className="h-3.5 w-3.5" />
                      )}
                      {paymentBadge.label}
                    </span>
                  )}
                </div>

                {/* Recent-success or payment-pending callouts */}
                {flag.get('paid') === '1' && order.payment_status === 'paid' && (
                  <div className="no-print mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    Thank you! Your payment has been received. We’ll confirm dispatch
                    over WhatsApp and email.
                  </div>
                )}
                {order.payment_status !== 'paid' &&
                  order.status === 'pending_payment' && (
                    <div className="no-print mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-2">
                      <p>
                        Payment is not yet recorded for this order. You can retry payment below. Your order stays open until
                        payment is confirmed — see our{' '}
                        <Link to="/policies" className="font-semibold text-amber-950 underline hover:no-underline">
                          payment &amp; cancellation policy
                        </Link>
                        .
                      </p>
                      {actionError && (
                        <p className="text-red-800 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                          {actionError}
                        </p>
                      )}
                    </div>
                  )}

                {/* Action toolbar */}
                <div className="no-print flex flex-wrap gap-2 mt-4">
                  {canRetry && (
                    <button
                      type="button"
                      onClick={retryPayment}
                      disabled={retrying}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60"
                    >
                      <CreditCard className="h-4 w-4" />
                      {retrying ? 'Opening Razorpay…' : 'Retry payment'}
                    </button>
                  )}
                  {canReorder && (
                    <button
                      type="button"
                      onClick={reorderItems}
                      disabled={reordering}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
                    >
                      {reordering ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                      Reorder
                    </button>
                  )}
                  {canCancel && (
                    <button
                      type="button"
                      onClick={cancelOrder}
                      disabled={cancelling}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 text-sm font-semibold hover:bg-red-100 disabled:opacity-60"
                    >
                      <X className="h-4 w-4" />
                      {cancelling ? 'Cancelling…' : 'Cancel order'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onPrint}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                  >
                    <Printer className="h-4 w-4" />
                    Print / save PDF
                  </button>
                  <button
                    type="button"
                    onClick={onShare}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                  >
                    <Share2 className="h-4 w-4" />
                    {shareDone ? 'Link copied' : 'Share'}
                  </button>
                  {supportHref && (
                    <a
                      href={supportHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onSupportClick}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-semibold hover:bg-emerald-100"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Get help
                    </a>
                  )}
                </div>

                {/* Action error (for retry/cancel/reorder outside the pending banner) */}
                {actionError && order.payment_status === 'paid' && (
                  <p className="no-print mt-3 text-sm text-red-800 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                    {actionError}
                  </p>
                )}

                <dl className="grid sm:grid-cols-3 gap-3 text-sm mt-5 pt-4 border-t border-gray-100">
                  <div>
                    <dt className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                      Placed
                    </dt>
                    <dd className="font-medium text-gray-900 mt-0.5">
                      {formatDateTime(order.created_at)}
                    </dd>
                  </div>
                  {order.payment.paid_at && (
                    <div>
                      <dt className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                        Paid
                      </dt>
                      <dd className="font-medium text-gray-900 mt-0.5">
                        {formatDateTime(order.payment.paid_at)}
                      </dd>
                    </div>
                  )}
                  {order.payment.razorpay_payment_id && (
                    <div className="min-w-0">
                      <dt className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                        Payment ID
                      </dt>
                      <dd className="font-mono text-xs text-gray-900 mt-0.5 truncate">
                        {order.payment.razorpay_payment_id}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Progress timeline */}
              <OrderTimeline
                status={order.status}
                paymentStatus={order.payment_status}
                createdAt={order.created_at}
                paidAt={order.payment.paid_at}
                cancelledAt={order.cancelled_at}
              />

              {/* Items + price breakdown */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm print-card">
                <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-base font-display font-bold text-gray-900">
                    Items ({order.items.length})
                  </h2>
                  <span className="text-xs text-gray-500">
                    Currency: {order.amounts.currency}
                  </span>
                </header>
                <ul className="divide-y divide-gray-100">
                  {order.items.map((it) => (
                    <li key={it.id} className="px-5 py-4 flex gap-3 items-start">
                      <div className="h-14 w-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                        {it.image_url ? (
                          <img
                            src={it.image_url}
                            alt=""
                            className="h-full w-full object-contain p-0.5"
                            onError={(e) => handleImageError(e, it.product_name)}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {it.product_slug ? (
                            <Link
                              to={`/products/${it.product_slug}`}
                              className="hover:text-primary-700 hover:underline"
                            >
                              {it.product_name}
                            </Link>
                          ) : (
                            it.product_name
                          )}
                        </p>
                        {it.brand && (
                          <p className="text-xs text-gray-500 mt-0.5">{it.brand}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
                          {formatINR(it.unit_price)} × {it.quantity}
                        </p>
                        {it.line_note && (
                          <p className="text-xs text-primary-800 bg-primary-50 border border-primary-100 rounded-lg px-2 py-1 mt-1.5">
                            {it.line_note}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm shrink-0">
                        <div className="font-semibold text-gray-900 tabular-nums">
                          {formatINR(it.line_total)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <dl className="px-5 py-4 border-t border-gray-100 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatINR(order.amounts.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="tabular-nums">
                      {order.amounts.shipping > 0
                        ? formatINR(order.amounts.shipping)
                        : 'Calculated at delivery'}
                    </span>
                  </div>
                  {order.amounts.tax > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span className="tabular-nums">{formatINR(order.amounts.tax)}</span>
                    </div>
                  )}
                  {order.amounts.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount</span>
                      <span className="tabular-nums">
                        -{formatINR(order.amounts.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 mt-1 border-t border-gray-100">
                    <span>Total</span>
                    <span className="tabular-nums text-primary-700">
                      {formatINR(order.amounts.total)}
                    </span>
                  </div>
                </dl>
              </div>

              {/* Two-column: address + payment */}
              <div className="grid md:grid-cols-2 gap-5">
                {order.shipping_address && (
                  <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 print-card">
                    <h2 className="text-base font-display font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary-600" />
                      Delivery address
                    </h2>
                    <p className="text-sm text-gray-900 font-medium mt-2">
                      {order.shipping_address.full_name}
                    </p>
                    <p className="text-xs text-gray-500">{order.shipping_address.phone}</p>
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                      {order.shipping_address.line1}
                      {order.shipping_address.line2
                        ? `, ${order.shipping_address.line2}`
                        : ''}
                      {order.shipping_address.landmark
                        ? `, ${order.shipping_address.landmark}`
                        : ''}
                      <br />
                      {order.shipping_address.city}, {order.shipping_address.state}{' '}
                      {order.shipping_address.postal_code}
                      <br />
                      {order.shipping_address.country}
                    </p>
                  </section>
                )}

                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 print-card">
                  <h2 className="text-base font-display font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary-600" />
                    Payment
                  </h2>
                  <dl className="mt-2 text-sm space-y-2">
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Method</dt>
                      <dd className="text-gray-900 font-medium text-right truncate">
                        {order.payment.method
                          ? order.payment.method.toUpperCase()
                          : 'Razorpay'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Status</dt>
                      <dd className="text-gray-900 font-medium text-right">
                        {paymentBadge?.label || 'Unpaid'}
                      </dd>
                    </div>
                    {order.payment.razorpay_order_id && (
                      <div className="flex justify-between gap-3 min-w-0">
                        <dt className="text-gray-500 shrink-0">Order ID</dt>
                        <dd className="font-mono text-xs text-gray-700 truncate">
                          {order.payment.razorpay_order_id}
                        </dd>
                      </div>
                    )}
                    {order.payment.razorpay_payment_id && (
                      <div className="flex justify-between gap-3 min-w-0">
                        <dt className="text-gray-500 shrink-0">Payment ID</dt>
                        <dd className="font-mono text-xs text-gray-700 truncate">
                          {order.payment.razorpay_payment_id}
                        </dd>
                      </div>
                    )}
                    {order.contact.email && (
                      <div className="flex justify-between gap-3 min-w-0">
                        <dt className="text-gray-500 shrink-0">Receipt to</dt>
                        <dd className="text-gray-900 text-right truncate">
                          {order.contact.email}
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>
              </div>

              {/* Activity log */}
              {order.events && order.events.length > 0 && (
                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 no-print">
                  <h2 className="text-base font-display font-bold text-gray-900 mb-3">
                    Activity
                  </h2>
                  <ol className="relative space-y-4">
                    {/* Vertical line behind the markers */}
                    <span
                      aria-hidden
                      className="absolute left-4 top-2 bottom-2 w-px bg-gray-200"
                    />
                    {order.events.map((ev) => {
                      const e = describeEvent(ev.event_type);
                      return (
                        <li key={ev.id} className="relative pl-12">
                          <span
                            className={`absolute left-0 top-0 h-9 w-9 rounded-full flex items-center justify-center border ${getEventToneClasses(
                              e.tone,
                            )}`}
                          >
                            <e.Icon className="h-4 w-4" />
                          </span>
                          <p className="text-sm font-semibold text-gray-900">
                            {e.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(ev.created_at)}
                          </p>
                          {ev.message && (
                            <p className="text-xs text-gray-600 mt-1">{ev.message}</p>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}

              {/* Help footer (also shown when no support number is set so we always offer a path) */}
              <div className="no-print rounded-2xl border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-700 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <span>
                  Something off? Our team typically responds within an hour during business
                  hours.
                </span>
                {supportHref ? (
                  <a
                    href={supportHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onSupportClick}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat on WhatsApp
                  </a>
                ) : (
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50"
                  >
                    Contact us
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderTrackPage;
