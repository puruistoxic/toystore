import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Search,
  ExternalLink,
  ShoppingCart,
  CreditCard,
  PackageOpen,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ListFilter,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { storefrontAdminApi } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { canManageOrders } from '../../utils/roles';

type OrderRow = {
  id: number;
  public_ref: string;
  customer_id: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  status: string;
  payment_status: string;
  payment_method: string | null;
  total_amount: string | number;
  currency: string;
  created_at: string;
  item_count: number;
  shipping_carrier?: string | null;
  tracking_number?: string | null;
  customer_account_email?: string | null;
};

type OrderStats = {
  total: number;
  pending_payment: number;
  active_fulfillment: number;
  delivered: number;
  cancelled: number;
  revenue_paid_sum: number;
};

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'pending_payment', label: 'Awaiting payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' },
];

const PAY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const SORT_OPTIONS: Array<{ value: 'newest' | 'oldest' | 'total_desc' | 'total_asc'; label: string }> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'total_desc', label: 'Total — high to low' },
  { value: 'total_asc', label: 'Total — low to high' },
];

const RANGE_OPTIONS: Array<{ value: string; label: string; days?: number }> = [
  { value: 'all', label: 'All time' },
  { value: '30', label: 'Last 30 days', days: 30 },
  { value: '90', label: 'Last 90 days', days: 90 },
  { value: '365', label: 'Last year', days: 365 },
];

const PAGE_SIZE = 25;

function formatMoney(n: string | number, cur: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: cur || 'INR',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
}

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

function statusIcon(s: string) {
  switch (s) {
    case 'pending_payment':
      return CreditCard;
    case 'paid':
      return CheckCircle2;
    case 'processing':
      return PackageOpen;
    case 'shipped':
    case 'out_for_delivery':
      return Truck;
    case 'delivered':
      return CheckCircle2;
    case 'cancelled':
      return XCircle;
    case 'refunded':
      return RotateCw;
    case 'failed':
      return AlertTriangle;
    default:
      return ShoppingCart;
  }
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-display font-bold tabular-nums ${accent}`}>{value}</p>
    </div>
  );
}

export default function StoreOrdersPage() {
  const { user } = useAuth();
  const canEdit = canManageOrders(user?.role);

  const [statuses, setStatuses] = useState<string[]>([]);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [range, setRange] = useState('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'total_desc' | 'total_asc'>('newest');
  const [q, setQ] = useState('');
  const [submittedQ, setSubmittedQ] = useState('');
  const [page, setPage] = useState(0);
  const offset = page * PAGE_SIZE;

  const fromDate = useMemo(() => {
    const opt = RANGE_OPTIONS.find((r) => r.value === range);
    if (!opt?.days) return undefined;
    const d = new Date();
    d.setDate(d.getDate() - opt.days);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  }, [range]);

  const { data: stats } = useQuery({
    queryKey: ['admin-store-order-stats'],
    queryFn: async () => {
      const res = await storefrontAdminApi.getOrderStats();
      return res.data as OrderStats;
    },
  });

  const queryKey = [
    'admin-store-orders',
    statuses.join(','),
    paymentStatus,
    submittedQ,
    sort,
    range,
    page,
  ];

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await storefrontAdminApi.getOrders({
        statuses: statuses.length ? statuses.join(',') : undefined,
        payment_status: paymentStatus || undefined,
        q: submittedQ || undefined,
        from: fromDate,
        sort,
        limit: PAGE_SIZE,
        offset,
      });
      return res.data as { orders: OrderRow[]; total: number };
    },
  });

  const total = data?.total ?? 0;
  const lastPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  const toggleStatus = (value: string) => {
    setPage(0);
    setStatuses((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    );
  };

  const clearFilters = () => {
    setStatuses([]);
    setPaymentStatus('');
    setRange('all');
    setSort('newest');
    setQ('');
    setSubmittedQ('');
    setPage(0);
  };

  const activeFilterCount =
    statuses.length + (paymentStatus ? 1 : 0) + (range !== 'all' ? 1 : 0) + (submittedQ ? 1 : 0);

  return (
    <AdminLayout title="Orders">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900">Orders</h2>
            <p className="text-sm text-gray-600 max-w-2xl mt-1">
              All checkout orders from the website. Update status, payment, shipment, and notes — every change
              is timestamped on the customer-facing tracking page.
            </p>
            {!canEdit && (
              <p className="mt-2 text-xs text-gray-500">
                You have read-only access to orders. Ask an administrator for the Order Processor role to make
                changes.
              </p>
            )}
          </div>
          <a
            href="/policies"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:underline shrink-0"
          >
            Payment policy
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Total" value={stats.total} accent="text-gray-900" />
            <StatCard label="Awaiting pay" value={stats.pending_payment} accent="text-amber-700" />
            <StatCard label="Fulfilling" value={stats.active_fulfillment} accent="text-indigo-700" />
            <StatCard label="Delivered" value={stats.delivered} accent="text-emerald-700" />
            <StatCard label="Cancelled" value={stats.cancelled} accent="text-gray-600" />
            <StatCard
              label="Paid revenue"
              value={formatMoney(stats.revenue_paid_sum, 'INR')}
              accent="text-primary-700"
            />
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
          <form
            className="flex flex-col xl:flex-row flex-wrap gap-3 xl:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(0);
              setSubmittedQ(q.trim());
            }}
          >
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Reference, email, phone, name…"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Payment</label>
              <select
                value={paymentStatus}
                onChange={(e) => {
                  setPage(0);
                  setPaymentStatus(e.target.value);
                }}
                className="w-full min-w-[160px] rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All payment</option>
                {PAY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Range</label>
              <select
                value={range}
                onChange={(e) => {
                  setPage(0);
                  setRange(e.target.value);
                }}
                className="w-full min-w-[140px] rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
              >
                {RANGE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Sort</label>
              <select
                value={sort}
                onChange={(e) => {
                  setPage(0);
                  setSort(e.target.value as typeof sort);
                }}
                className="w-full min-w-[180px] rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-xl bg-primary-600 text-white px-4 py-2 text-sm font-semibold hover:bg-primary-700"
            >
              Apply
            </button>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2"
              >
                Reset
              </button>
            )}
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 mr-1">
              <ListFilter className="h-3.5 w-3.5" />
              Status
            </span>
            {STATUS_OPTIONS.map((s) => {
              const active = statuses.includes(s.value);
              const Icon = statusIcon(s.value);
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleStatus(s.value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    active
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : `${statusBadgeClasses(s.value)} hover:opacity-80`
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {s.label}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {(error as Error)?.message || 'Failed to load orders.'}
              <button type="button" className="ml-3 underline font-semibold" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm text-gray-600">
                  Showing <strong>{data?.orders?.length ?? 0}</strong> of <strong>{total}</strong>
                  {isFetching && <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin text-gray-400" />}
                </p>
                {lastPage > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 hover:bg-gray-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </button>
                    <span className="text-gray-500">
                      Page {page + 1} / {lastPage + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                      disabled={page >= lastPage}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 hover:bg-gray-50 disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Shipment</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(data?.orders || []).map((o) => {
                      const Icon = statusIcon(o.status);
                      return (
                        <tr key={o.id} className="hover:bg-primary-50/30 transition-colors">
                          <td className="px-4 py-3 align-top">
                            <Link
                              to={`/admin/store/orders/${encodeURIComponent(o.public_ref)}`}
                              className="font-mono font-semibold text-primary-700 hover:underline"
                            >
                              {o.public_ref}
                            </Link>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {o.item_count || 0} {o.item_count === 1 ? 'item' : 'items'}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="text-gray-900 font-medium">{o.contact_name || '—'}</div>
                            <div className="text-xs text-gray-500">
                              {o.contact_email || o.customer_account_email || '—'}
                            </div>
                            <div className="text-xs text-gray-500">{o.contact_phone || ''}</div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusBadgeClasses(
                                o.status,
                              )}`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {o.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="text-gray-800 capitalize">{o.payment_status}</div>
                            {o.payment_method && (
                              <div className="text-xs text-gray-500 capitalize">{o.payment_method}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top text-xs">
                            {o.shipping_carrier || o.tracking_number ? (
                              <>
                                <div className="text-gray-800 font-medium">
                                  {o.shipping_carrier || '—'}
                                </div>
                                {o.tracking_number && (
                                  <div className="text-gray-500 font-mono">{o.tracking_number}</div>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900 align-top whitespace-nowrap">
                            {formatMoney(o.total_amount, o.currency)}
                          </td>
                          <td className="px-4 py-3 text-gray-600 align-top whitespace-nowrap">
                            {new Date(o.created_at).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!data?.orders?.length && (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    No orders match these filters.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
