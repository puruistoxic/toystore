import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CreditCard,
  Package,
  RefreshCcw,
  Search,
  ShoppingCart,
  Sparkles,
  X,
} from 'lucide-react';
import customerApi from '../../utils/customerApi';
import { handleImageError } from '../../utils/imagePlaceholder';
import { useCart } from '../../contexts/CartContext';
import { loadRazorpayScript } from '../../utils/razorpay';
import {
  ORDER_STATUS_BADGE,
  ORDER_STATUS_LABEL,
  OrderListItem,
  formatDateTime,
  formatINR,
} from './accountTypes';
import type { Product } from '../../types/catalog';

type StatusFilter =
  | 'all'
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

type SortValue = 'newest' | 'oldest' | 'highest' | 'lowest';
type RangeValue = 'all' | '30d' | '90d' | '180d' | '365d';

const FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending_payment', label: 'Awaiting payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const SORTS: Array<{ value: SortValue; label: string }> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest amount' },
  { value: 'lowest', label: 'Lowest amount' },
];

const RANGES: Array<{ value: RangeValue; label: string }> = [
  { value: 'all', label: 'All time' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 3 months' },
  { value: '180d', label: 'Last 6 months' },
  { value: '365d', label: 'Last year' },
];

const PAGE_SIZE = 10;

const OrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addProduct } = useCart();

  const statusFromUrl = (searchParams.get('status') || 'all') as StatusFilter;
  const sortFromUrl = (searchParams.get('sort') || 'newest') as SortValue;
  const rangeFromUrl = (searchParams.get('range') || 'all') as RangeValue;
  const initialQ = searchParams.get('q') || '';
  const initialPage = Math.max(1, Number(searchParams.get('page')) || 1);

  const [status, setStatus] = useState<StatusFilter>(statusFromUrl);
  const [sort, setSort] = useState<SortValue>(sortFromUrl);
  const [range, setRange] = useState<RangeValue>(rangeFromUrl);
  const [q, setQ] = useState(initialQ);
  const [debouncedQ, setDebouncedQ] = useState(initialQ);
  const [page, setPage] = useState<number>(initialPage);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionRef, setActionRef] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);

  // Sync URL <-> local state (after debouncing q)
  useEffect(() => {
    const next = new URLSearchParams();
    if (status !== 'all') next.set('status', status);
    if (sort !== 'newest') next.set('sort', sort);
    if (range !== 'all') next.set('range', range);
    if (debouncedQ) next.set('q', debouncedQ);
    if (page > 1) next.set('page', String(page));
    setSearchParams(next, { replace: true });
  }, [status, sort, range, debouncedQ, page, setSearchParams]);

  // Debounce the search box
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setDebouncedQ(q.trim());
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (sort !== 'newest') params.set('sort', sort);
      if (range !== 'all') params.set('range', range);
      if (debouncedQ) params.set('q', debouncedQ);
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      const res = await customerApi.get<{ orders: OrderListItem[]; total: number }>(
        `/orders?${params.toString()}`,
      );
      setOrders(res.data.orders || []);
      setTotal(res.data.total || 0);
    } catch {
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [status, sort, range, debouncedQ, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleRetry = async (order: OrderListItem) => {
    setActionRef(order.public_ref);
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
            /* webhook may settle separately */
          }
          setActionRef(null);
          navigate(`/account/orders/${encodeURIComponent(order.public_ref)}?paid=1`);
        },
        modal: { ondismiss: () => setActionRef(null) },
      });
      inst.on('payment.failed', (r: unknown) => {
        setActionRef(null);
        const desc =
          (r as { error?: { description?: string } })?.error?.description ||
          'Payment failed. Please try again.';
        setActionError(desc);
      });
      inst.open();
    } catch (err: unknown) {
      setActionRef(null);
      setActionError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          (err as Error)?.message ||
          'Could not start payment.',
      );
    }
  };

  const handleCancel = async (order: OrderListItem) => {
    if (!window.confirm(`Cancel order ${order.public_ref}? This cannot be undone.`)) return;
    setActionRef(order.public_ref);
    setActionError(null);
    try {
      await customerApi.post(`/orders/${encodeURIComponent(order.public_ref)}/cancel`);
      await fetchOrders();
    } catch (err: unknown) {
      setActionError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Could not cancel order.',
      );
    } finally {
      setActionRef(null);
    }
  };

  const handleReorder = async (order: OrderListItem) => {
    setActionRef(order.public_ref);
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

      const items = res.data.items || [];
      let added = 0;
      for (const it of items) {
        if (!it.product_id) continue;
        const productLike: Product = {
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
      setActionRef(null);
      if (added === 0) {
        setActionError('These items are no longer available to reorder.');
      } else {
        navigate('/cart');
      }
    } catch (err: unknown) {
      setActionRef(null);
      setActionError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Could not reorder.',
      );
    }
  };

  const hasFilters = useMemo(
    () =>
      status !== 'all' ||
      debouncedQ !== '' ||
      sort !== 'newest' ||
      range !== 'all',
    [status, debouncedQ, sort, range],
  );

  const clearAllFilters = useCallback(() => {
    setStatus('all');
    setSort('newest');
    setRange('all');
    setQ('');
    setPage(1);
  }, []);

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by order reference (e.g. KTS-2025...)"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="relative">
              <span className="sr-only">Sort orders</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortValue);
                  setPage(1);
                }}
                className="appearance-none pl-3 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    Sort: {s.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                ▾
              </span>
            </label>
            <label className="relative">
              <span className="sr-only">Date range</span>
              <select
                value={range}
                onChange={(e) => {
                  setRange(e.target.value as RangeValue);
                  setPage(1);
                }}
                className="appearance-none pl-3 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                ▾
              </span>
            </label>
            {hasFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4" /> Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="-mx-1 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = status === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setStatus(f.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  active
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-900 text-sm px-4 py-3 flex items-start gap-3">
          <span className="flex-1">{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-red-700 hover:text-red-900"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <ul className="divide-y divide-gray-100">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="p-5 animate-pulse">
                <div className="h-24 bg-gray-100 rounded-xl" />
              </li>
            ))}
          </ul>
        ) : orders.length === 0 ? (
          <div className="text-center py-14 px-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-3">
              <Sparkles className="h-7 w-7" />
            </div>
            <p className="text-gray-900 font-display font-bold text-lg mb-1">
              {hasFilters ? 'No orders match your filters' : 'No orders yet'}
            </p>
            <p className="text-sm text-gray-500 mb-5">
              {hasFilters
                ? 'Try clearing filters or searching for a different reference.'
                : 'When you place an order it will show up here — even if payment is still pending.'}
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center justify-center rounded-xl bg-primary-600 text-white px-5 py-2.5 font-display font-semibold hover:bg-primary-700"
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-xl bg-primary-600 text-white px-5 py-2.5 font-display font-semibold hover:bg-primary-700"
              >
                Start shopping
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {orders.map((o) => {
              const isWorking = actionRef === o.public_ref;
              const canRetry = o.status === 'pending_payment';
              const canCancel = o.status === 'pending_payment';
              const canReorder = ['paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].includes(o.status);
              return (
                <li key={o.public_ref} className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnails */}
                    <div className="flex -space-x-2 shrink-0">
                      {o.items_preview.slice(0, 3).map((it, idx) => (
                        <div
                          key={it.id}
                          className="h-14 w-14 rounded-xl border-2 border-white bg-gray-50 overflow-hidden shadow-sm"
                          style={{ zIndex: 3 - idx }}
                        >
                          {it.image_url ? (
                            <img
                              src={it.image_url}
                              alt=""
                              className="h-full w-full object-contain p-0.5"
                              onError={(e) => handleImageError(e, it.name)}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      ))}
                      {o.item_count > 3 && (
                        <div className="h-14 w-14 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm">
                          +{o.item_count - 3}
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/account/orders/${encodeURIComponent(o.public_ref)}`}
                          className="text-sm font-mono font-bold text-gray-900 hover:text-primary-700"
                        >
                          {o.public_ref}
                        </Link>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            ORDER_STATUS_BADGE[o.status] ||
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {ORDER_STATUS_LABEL[o.status] || o.status}
                        </span>
                        {o.payment_status === 'paid' && o.status !== 'paid' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-50 text-emerald-900 border-emerald-200">
                            Payment received
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {o.item_count} item{o.item_count !== 1 ? 's' : ''} · {formatDateTime(o.created_at)}
                      </p>
                      {(o.ship_city || o.ship_state) && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Ship to {o.ship_city}
                          {o.ship_city && o.ship_state ? ', ' : ''}
                          {o.ship_state}
                          {o.ship_postal_code ? ` — ${o.ship_postal_code}` : ''}
                        </p>
                      )}
                    </div>

                    {/* Right rail: total + actions */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 sm:gap-3">
                      <p className="text-lg font-bold text-gray-900 tabular-nums">
                        {formatINR(o.total_amount)}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {canRetry && (
                          <button
                            type="button"
                            onClick={() => handleRetry(o)}
                            disabled={isWorking}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 disabled:opacity-50"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            {isWorking ? 'Opening…' : 'Retry payment'}
                          </button>
                        )}
                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => handleCancel(o)}
                            disabled={isWorking}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        )}
                        {canReorder && (
                          <button
                            type="button"
                            onClick={() => handleReorder(o)}
                            disabled={isWorking}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
                          >
                            {isWorking ? (
                              <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ShoppingCart className="h-3.5 w-3.5" />
                            )}
                            Reorder
                          </button>
                        )}
                        <Link
                          to={`/account/orders/${encodeURIComponent(o.public_ref)}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary-200 text-primary-800 bg-primary-50 hover:bg-primary-100 text-xs font-semibold"
                        >
                          Details
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
          <p className="text-sm text-gray-600">
            Page {page} of {totalPages} · {total} order{total !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
