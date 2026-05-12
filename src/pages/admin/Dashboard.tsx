import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { storefrontAdminApi, adminActivityApi } from '../../utils/api';
import {
  Package,
  ShoppingBag,
  Loader2,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ShoppingCart,
  UserCircle,
  Inbox,
  MessageCircle,
  LayoutGrid,
  Truck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  PackageOpen,
  RotateCw,
  XCircle,
  MapPin,
  Users as UsersIcon,
  TrendingUp,
  ClipboardCheck,
  Activity,
  ExternalLink,
  FileText,
} from 'lucide-react';
import {
  canManageContent,
  canManageOrders,
  canManageSettings,
  canManageUsers,
  canViewOrders,
  getRoleLabel,
} from '../../utils/roles';
import { describeEvent } from '../account/orderEvents';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type Kpi = { value: number; previous: number; delta_pct: number };

type DashboardData = {
  period: { days: number; from: string; to: string };
  kpis: {
    revenue: Kpi;
    orders: Kpi;
    aov: Kpi;
    customers_new: Kpi;
    delivered: Kpi;
  };
  series: Array<{ date: string; revenue: number; orders: number }>;
  status_breakdown: Record<string, number>;
  top_products: Array<{
    product_id: string | null;
    product_name: string;
    product_slug: string | null;
    image_url: string | null;
    units: number;
    revenue: number;
    order_count: number;
  }>;
  top_pincodes: Array<{
    pincode: string;
    city: string | null;
    state: string | null;
    orders: number;
    revenue: number;
  }>;
  queue: {
    pending_payment: number;
    to_process: number;
    to_ship: number;
    in_transit: number;
    new_cart_requests: number;
    new_leads_7d: number;
  };
  totals: {
    orders: number;
    customers: number;
    leads: number;
    carts: number;
    open_orders_value: number;
    open_orders_count: number;
  };
};

type OrderRow = {
  id: number;
  public_ref: string;
  contact_name: string | null;
  contact_email: string | null;
  status: string;
  payment_status: string;
  payment_method: string | null;
  total_amount: string | number;
  currency: string;
  created_at: string;
  item_count?: number;
};

type LeadStats = {
  by_channel?: Array<{ channel: string; c: number }>;
  by_status?: Array<{ status: string; c: number }>;
  last_7_days?: number;
};

type ActivityRow = {
  row_id: string | number;
  source_kind: 'admin' | 'storefront' | 'outreach';
  occurred_at: string;
  actor_display: string | null;
  action_title: string | null;
  detail_summary: string | null;
};

const PERIOD_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 365, label: '1 year' },
];

const STATUS_META: Array<{ key: string; label: string; color: string; Icon: typeof ShoppingCart }> = [
  { key: 'pending_payment', label: 'Awaiting payment', color: 'bg-amber-400', Icon: CreditCard },
  { key: 'paid', label: 'Paid', color: 'bg-emerald-400', Icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', color: 'bg-sky-400', Icon: PackageOpen },
  { key: 'shipped', label: 'Shipped', color: 'bg-indigo-400', Icon: Truck },
  { key: 'out_for_delivery', label: 'Out for delivery', color: 'bg-violet-400', Icon: Truck },
  { key: 'delivered', label: 'Delivered', color: 'bg-green-500', Icon: CheckCircle2 },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-gray-400', Icon: XCircle },
  { key: 'refunded', label: 'Refunded', color: 'bg-pink-400', Icon: RotateCw },
  { key: 'failed', label: 'Failed', color: 'bg-red-500', Icon: AlertTriangle },
];

const ORDER_BADGE: Record<string, string> = {
  pending_payment: 'bg-amber-50 text-amber-800 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  processing: 'bg-sky-50 text-sky-800 border-sky-200',
  shipped: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  out_for_delivery: 'bg-violet-50 text-violet-800 border-violet-200',
  delivered: 'bg-green-50 text-green-800 border-green-200',
  cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
  refunded: 'bg-pink-50 text-pink-800 border-pink-200',
  failed: 'bg-red-50 text-red-800 border-red-200',
};

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                             */
/* -------------------------------------------------------------------------- */

function formatCurrency(amount: number, compact = false) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  }).format(amount || 0);
}

function formatNumber(n: number, compact = false) {
  return new Intl.NumberFormat('en-IN', {
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(n || 0);
}

function relativeTime(iso?: string | null): string {
  if (!iso) return '';
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return '';
  const diff = Date.now() - ts;
  const s = Math.round(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

/* -------------------------------------------------------------------------- */
/*  Sparkline                                                                 */
/* -------------------------------------------------------------------------- */

function Sparkline({
  points,
  positive = true,
  height = 36,
}: {
  points: number[];
  positive?: boolean;
  height?: number;
}) {
  if (!points.length) {
    return <div className="h-9 w-full bg-gray-50 rounded" aria-hidden />;
  }
  const width = 120;
  const max = Math.max(...points, 0);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 1);
  const step = points.length > 1 ? width / (points.length - 1) : width;

  const xy = points.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });

  const path = xy.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const fillPath =
    `${path} L${(xy[xy.length - 1][0]).toFixed(1)},${height} L0,${height} Z`;

  const stroke = positive ? '#059669' : '#dc2626';
  const fill = positive ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className="block"
      aria-hidden
    >
      <path d={fillPath} fill={fill} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Delta badge                                                               */
/* -------------------------------------------------------------------------- */

function DeltaBadge({ pct, invert = false }: { pct: number; invert?: boolean }) {
  if (!Number.isFinite(pct) || pct === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
        <Minus className="h-3 w-3" />
        0%
      </span>
    );
  }
  const positive = invert ? pct < 0 : pct > 0;
  const ArrowIcon = pct > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${
        positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
      }`}
      title="Change vs previous period"
    >
      <ArrowIcon className="h-3 w-3" />
      {Math.abs(pct)}%
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stacked status pipeline                                                   */
/* -------------------------------------------------------------------------- */

function StatusPipeline({ breakdown }: { breakdown: Record<string, number> }) {
  const total = STATUS_META.reduce((sum, m) => sum + (breakdown[m.key] || 0), 0);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-sm text-gray-500 text-center">
        No orders placed in this period yet.
      </div>
    );
  }

  return (
    <div>
      <div className="flex w-full h-3 rounded-full overflow-hidden bg-gray-100">
        {STATUS_META.map((m) => {
          const v = breakdown[m.key] || 0;
          if (!v) return null;
          const pct = (v / total) * 100;
          return (
            <div
              key={m.key}
              className={`${m.color}`}
              style={{ width: `${pct}%` }}
              title={`${m.label}: ${v}`}
            />
          );
        })}
      </div>
      <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {STATUS_META.map((m) => {
          const v = breakdown[m.key] || 0;
          return (
            <li
              key={m.key}
              className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-2.5 py-1.5"
            >
              <span className="inline-flex items-center gap-2 text-xs text-gray-700 truncate">
                <span className={`h-2.5 w-2.5 rounded-full ${m.color} shrink-0`} aria-hidden />
                <span className="truncate">{m.label}</span>
              </span>
              <span className="text-xs font-display font-bold text-gray-900 tabular-nums">{v}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  KPI Card                                                                  */
/* -------------------------------------------------------------------------- */

function KpiCard({
  label,
  value,
  series,
  delta,
  Icon,
  tone,
  href,
  invertDelta = false,
}: {
  label: string;
  value: string;
  series?: number[];
  delta?: number;
  Icon: React.ComponentType<{ className?: string }>;
  tone: 'primary' | 'emerald' | 'sky' | 'amber' | 'indigo' | 'pink';
  href?: string;
  invertDelta?: boolean;
}) {
  const toneMap = {
    primary: 'bg-primary-50 text-primary-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    sky: 'bg-sky-50 text-sky-700',
    amber: 'bg-amber-50 text-amber-800',
    indigo: 'bg-indigo-50 text-indigo-700',
    pink: 'bg-pink-50 text-pink-700',
  } as const;

  const body = (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-primary-200 transition-all">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${toneMap[tone]}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-display font-bold text-gray-900 tabular-nums">{value}</span>
        {delta !== undefined && <DeltaBadge pct={delta} invert={invertDelta} />}
      </div>
      {series && series.length > 0 && (
        <div className="mt-2 -mx-1">
          <Sparkline points={series} positive={((delta ?? 0) >= 0) !== invertDelta} />
        </div>
      )}
    </div>
  );

  return href ? <Link to={href}>{body}</Link> : body;
}

/* -------------------------------------------------------------------------- */
/*  Activity feed icon                                                        */
/* -------------------------------------------------------------------------- */

function ActivityIcon({ source, action }: { source: string; action?: string | null }) {
  if (source === 'storefront') {
    const ev = describeEvent(action || '');
    const Icon = ev.Icon;
    const tone =
      ev.tone === 'success'
        ? 'bg-emerald-100 text-emerald-700'
        : ev.tone === 'danger'
          ? 'bg-red-100 text-red-700'
          : ev.tone === 'warning'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-sky-100 text-sky-700';
    return (
      <span className={`shrink-0 h-7 w-7 rounded-full inline-flex items-center justify-center ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (source === 'outreach') {
    return (
      <span className="shrink-0 h-7 w-7 rounded-full inline-flex items-center justify-center bg-emerald-100 text-emerald-700">
        <MessageCircle className="h-3.5 w-3.5" />
      </span>
    );
  }
  return (
    <span className="shrink-0 h-7 w-7 rounded-full inline-flex items-center justify-center bg-gray-100 text-gray-700">
      <ClipboardCheck className="h-3.5 w-3.5" />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main page                                                                 */
/* -------------------------------------------------------------------------- */

export default function AdminDashboard() {
  const { user } = useAuth();
  const [days, setDays] = useState<number>(30);

  const canOrders = canViewOrders(user?.role);
  const canEditOrders = canManageOrders(user?.role);
  const canContent = canManageContent(user?.role);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin-store-dashboard', days],
    queryFn: async () => {
      const res = await storefrontAdminApi.getDashboard(days);
      return res.data as DashboardData;
    },
    enabled: canOrders,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['admin-store-orders-recent', days],
    queryFn: async () => {
      const res = await storefrontAdminApi.getOrders({ limit: 10 });
      return res.data as { orders: OrderRow[]; total: number };
    },
    enabled: canOrders,
  });

  const { data: leadStats } = useQuery({
    queryKey: ['admin-store-lead-stats'],
    queryFn: async () => {
      const res = await storefrontAdminApi.getLeadStats();
      return res.data as LeadStats;
    },
    enabled: canOrders,
  });

  const { data: activityData } = useQuery({
    queryKey: ['admin-activity-feed', 'dashboard'],
    queryFn: async () => {
      const res = await adminActivityApi.getFeed({ limit: 10, scope: 'all' });
      return res.data as { activities: ActivityRow[] };
    },
    enabled: canOrders,
    refetchInterval: 60_000,
  });

  const revenueSeries = data?.series?.map((s) => s.revenue) || [];
  const ordersSeries = data?.series?.map((s) => s.orders) || [];

  const displayName = user?.fullName || user?.username || 'there';

  /* ---------------- Empty-access fallback ---------------- */

  if (!canOrders && !canContent) {
    return (
      <AdminLayout title="Dashboard">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h3 className="text-base font-display font-bold text-amber-900">No modules available</h3>
          <p className="text-sm text-amber-800 mt-1">
            Your role <strong>{getRoleLabel(user?.role)}</strong> doesn&apos;t have any module assigned. Ask
            an administrator to grant you access.
          </p>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Hero with greeting + period selector */}
        <section className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-brand-ink via-brand-ink to-primary-900 text-white shadow-lg">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative px-5 py-6 sm:px-8 sm:py-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-xs font-semibold text-amber-300/95 tracking-widest uppercase">
                DigiDukaanLive · {getRoleLabel(user?.role)}
              </p>
              <h2 className="mt-1.5 text-2xl sm:text-3xl font-display font-bold leading-tight">
                {greeting}, {displayName}
              </h2>
              <p className="mt-1.5 text-sm text-white/70 leading-relaxed">
                {data
                  ? `${formatCurrency(data.kpis.revenue.value)} paid revenue across ${data.kpis.orders.value} order${
                      data.kpis.orders.value === 1 ? '' : 's'
                    } in the last ${data.period.days} days.`
                  : 'Loading your storefront snapshot…'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-xl border border-white/20 bg-white/10 backdrop-blur p-0.5">
                {PERIOD_OPTIONS.map((p) => {
                  const active = days === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setDays(p.value)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        active ? 'bg-white text-brand-ink shadow-sm' : 'text-white/85 hover:bg-white/10'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              {canEditOrders && (
                <Link
                  to="/admin/store/orders"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-3.5 py-2 text-sm font-display font-bold text-white shadow-lg shadow-black/25 hover:bg-primary-400 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Orders
                </Link>
              )}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Storefront
              </a>
            </div>
          </div>
        </section>

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {(error as Error)?.message || 'Failed to load dashboard.'}
            <button type="button" onClick={() => refetch()} className="ml-3 underline font-semibold">
              Retry
            </button>
          </div>
        )}

        {canOrders && (isLoading || !data) ? (
          <div className="flex justify-center rounded-2xl border border-gray-200 bg-white py-16 shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : canOrders && data ? (
          <>
            {/* KPI strip */}
            <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              <KpiCard
                label="Paid revenue"
                value={formatCurrency(data.kpis.revenue.value)}
                delta={data.kpis.revenue.delta_pct}
                series={revenueSeries}
                Icon={TrendingUp}
                tone="primary"
                href="/admin/store/orders?payment_status=paid"
              />
              <KpiCard
                label="Orders"
                value={formatNumber(data.kpis.orders.value)}
                delta={data.kpis.orders.delta_pct}
                series={ordersSeries}
                Icon={ShoppingCart}
                tone="indigo"
                href="/admin/store/orders"
              />
              <KpiCard
                label="Average order"
                value={formatCurrency(data.kpis.aov.value)}
                delta={data.kpis.aov.delta_pct}
                Icon={ClipboardCheck}
                tone="emerald"
              />
              <KpiCard
                label="New customers"
                value={formatNumber(data.kpis.customers_new.value)}
                delta={data.kpis.customers_new.delta_pct}
                Icon={UsersIcon}
                tone="sky"
                href="/admin/store/customers"
              />
              <KpiCard
                label="Delivered"
                value={formatNumber(data.kpis.delivered.value)}
                delta={data.kpis.delivered.delta_pct}
                Icon={CheckCircle2}
                tone="emerald"
                href="/admin/store/orders?status=delivered"
              />
            </section>

            {/* Order pipeline */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base font-display font-bold text-gray-900">
                    Order pipeline · last {data.period.days} days
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {data.totals.open_orders_count > 0
                      ? `${data.totals.open_orders_count} open orders worth ${formatCurrency(data.totals.open_orders_value)} in flight.`
                      : 'No open orders right now.'}
                    {isFetching && (
                      <Loader2 className="ml-2 inline h-3 w-3 animate-spin text-gray-400" />
                    )}
                  </p>
                </div>
                <Link
                  to="/admin/store/orders"
                  className="text-sm font-semibold text-primary-700 hover:underline"
                >
                  Open orders list →
                </Link>
              </div>
              <StatusPipeline breakdown={data.status_breakdown} />
            </section>

            {/* Two-column: queue + activity */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-display font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-primary-600" />
                    Today&apos;s queue
                  </h3>
                  <span className="text-xs text-gray-500">Live counts across all orders</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <QueueTile
                    title="Awaiting payment"
                    sub="Chase the customer or cancel"
                    count={data.queue.pending_payment}
                    to="/admin/store/orders?status=pending_payment"
                    Icon={CreditCard}
                    tone="amber"
                  />
                  <QueueTile
                    title="Ready to process"
                    sub="Paid orders awaiting prep"
                    count={data.queue.to_process}
                    to="/admin/store/orders?status=paid"
                    Icon={PackageOpen}
                    tone="emerald"
                  />
                  <QueueTile
                    title="Ready to ship"
                    sub="Add carrier & tracking"
                    count={data.queue.to_ship}
                    to="/admin/store/orders?status=processing"
                    Icon={Truck}
                    tone="indigo"
                  />
                  <QueueTile
                    title="In transit"
                    sub="Shipped, with courier"
                    count={data.queue.in_transit}
                    to="/admin/store/orders?status=shipped"
                    Icon={Truck}
                    tone="violet"
                  />
                  <QueueTile
                    title="Cart requests"
                    sub="Open multi-item enquiries"
                    count={data.queue.new_cart_requests}
                    to="/admin/store/order-requests?status=new"
                    Icon={Inbox}
                    tone="pink"
                  />
                  <QueueTile
                    title="Leads this week"
                    sub="Every storefront enquiry"
                    count={data.queue.new_leads_7d}
                    to="/admin/store/leads"
                    Icon={MessageCircle}
                    tone="emerald"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col min-h-[420px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-display font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary-600" />
                    Live activity
                  </h3>
                  <Link
                    to="/admin/audit-logs"
                    className="text-xs font-semibold text-primary-700 hover:underline"
                  >
                    Audit log →
                  </Link>
                </div>
                {activityData?.activities?.length ? (
                  <ul className="space-y-3 overflow-y-auto pr-1 -mr-1 flex-1">
                    {activityData.activities.map((row) => (
                      <li key={`${row.source_kind}-${row.row_id}`} className="flex gap-3">
                        <ActivityIcon source={row.source_kind} action={row.action_title} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-900 font-medium truncate">
                            {row.action_title || 'Activity'}
                          </p>
                          {row.detail_summary && (
                            <p className="text-xs text-gray-600 truncate">{row.detail_summary}</p>
                          )}
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {row.actor_display ? <span>{row.actor_display} · </span> : null}
                            {relativeTime(row.occurred_at)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="flex-1 grid place-items-center text-sm text-gray-500">No activity yet.</p>
                )}
              </div>
            </section>

            {/* Top products + Top pincodes + Lead channels */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-display font-bold text-gray-900">
                    Top products
                  </h3>
                  <span className="text-xs text-gray-500">last {data.period.days}d</span>
                </div>
                {data.top_products.length ? (
                  <ul className="space-y-2">
                    {data.top_products.slice(0, 5).map((p, idx) => {
                      const max = data.top_products[0]?.revenue || 1;
                      const pct = Math.max(5, Math.round((p.revenue / max) * 100));
                      const productHref = p.product_slug ? `/products/${p.product_slug}` : null;
                      return (
                        <li
                          key={`${p.product_id || p.product_name}-${idx}`}
                          className="rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors p-2.5"
                        >
                          <div className="flex items-center gap-3">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt=""
                                className="h-10 w-10 rounded-lg object-cover border border-gray-100 shrink-0"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                                <ShoppingBag className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {productHref ? (
                                  <a
                                    href={productHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary-700"
                                  >
                                    {p.product_name}
                                  </a>
                                ) : (
                                  p.product_name
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {p.units} unit{p.units === 1 ? '' : 's'} · {p.order_count} order
                                {p.order_count === 1 ? '' : 's'}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-gray-900 tabular-nums">
                                {formatCurrency(p.revenue, true)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-1.5 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-500" style={{ width: `${pct}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 py-6 text-center">No paid orders yet in this period.</p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-display font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary-600" />
                    Top delivery areas
                  </h3>
                  <span className="text-xs text-gray-500">last {data.period.days}d</span>
                </div>
                {data.top_pincodes.length ? (
                  <ul className="space-y-2">
                    {data.top_pincodes.map((p) => {
                      const max = data.top_pincodes[0]?.orders || 1;
                      const pct = Math.max(8, Math.round((p.orders / max) * 100));
                      return (
                        <li
                          key={p.pincode}
                          className="rounded-xl border border-gray-100 p-2.5 hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-mono font-semibold text-gray-900">{p.pincode}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {[p.city, p.state].filter(Boolean).join(', ') || 'Unknown area'}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-gray-900 tabular-nums">
                                {p.orders} {p.orders === 1 ? 'order' : 'orders'}
                              </p>
                              <p className="text-xs text-gray-500">{formatCurrency(p.revenue, true)}</p>
                            </div>
                          </div>
                          <div className="mt-1.5 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400" style={{ width: `${pct}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 py-6 text-center">No deliveries in this window.</p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-display font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary-600" />
                    Lead channels
                  </h3>
                  <Link
                    to="/admin/store/leads"
                    className="text-xs font-semibold text-primary-700 hover:underline"
                  >
                    Open leads →
                  </Link>
                </div>
                {leadStats?.by_channel?.length ? (
                  <ul className="space-y-2">
                    {leadStats.by_channel
                      .slice()
                      .sort((a, b) => b.c - a.c)
                      .slice(0, 7)
                      .map((c) => {
                        const top = leadStats.by_channel?.[0]?.c || 1;
                        const pct = Math.max(6, Math.round((c.c / top) * 100));
                        return (
                          <li key={c.channel}>
                            <Link
                              to={`/admin/store/leads?channel=${encodeURIComponent(c.channel)}`}
                              className="flex items-center gap-2 hover:bg-primary-50/30 rounded-lg p-1.5 -m-1.5 transition-colors"
                            >
                              <span className="text-xs font-semibold text-gray-700 capitalize w-28 truncate">
                                {c.channel.replace(/_/g, ' ')}
                              </span>
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs font-display font-bold text-gray-900 tabular-nums w-8 text-right">
                                {c.c}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 py-6 text-center">No leads logged yet.</p>
                )}
                {leadStats && (
                  <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    {leadStats.last_7_days || 0} lead
                    {(leadStats.last_7_days || 0) === 1 ? '' : 's'} in the last 7 days.
                  </p>
                )}
              </div>
            </section>

            {/* Recent orders */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-display font-bold text-gray-900">Recent orders</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Last {recentOrders?.orders?.length || 0} checkouts</p>
                </div>
                <Link
                  to="/admin/store/orders"
                  className="text-sm font-semibold text-primary-700 hover:underline"
                >
                  All orders →
                </Link>
              </div>
              {recentOrders?.orders?.length ? (
                <ul className="divide-y divide-gray-100">
                  {recentOrders.orders.slice(0, 8).map((o) => (
                    <li key={o.id}>
                      <Link
                        to={`/admin/store/orders/${encodeURIComponent(o.public_ref)}`}
                        className="grid grid-cols-12 items-center gap-3 px-5 py-3 hover:bg-primary-50/30 transition-colors text-sm"
                      >
                        <span className="col-span-12 sm:col-span-3 font-mono font-semibold text-primary-700 truncate">
                          {o.public_ref}
                        </span>
                        <span className="col-span-8 sm:col-span-4 text-gray-700 truncate">
                          {o.contact_name || 'Guest'}
                          {o.contact_email ? (
                            <span className="text-gray-400"> · {o.contact_email}</span>
                          ) : null}
                        </span>
                        <span className="col-span-4 sm:col-span-2">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              ORDER_BADGE[o.status] || 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {o.status.replace(/_/g, ' ')}
                          </span>
                        </span>
                        <span className="col-span-6 sm:col-span-2 text-right font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                          {formatCurrency(Number(o.total_amount) || 0)}
                        </span>
                        <span className="col-span-6 sm:col-span-1 text-right text-xs text-gray-400 whitespace-nowrap">
                          {relativeTime(o.created_at)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-10 text-sm text-gray-500">No orders yet.</p>
              )}
            </section>
          </>
        ) : null}

        {/* Role-tailored shortcuts */}
        {(canContent || canManageSettings(user?.role) || canManageUsers(user?.role)) && (
          <section>
            <h3 className="text-base font-display font-bold text-gray-900 mb-3">Quick links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {canContent && (
                <>
                  <ShortcutCard
                    label="Products"
                    description="Catalogue & pricing"
                    to="/admin/products"
                    Icon={ShoppingBag}
                    accent="bg-amber-100 text-amber-900"
                  />
                  <ShortcutCard
                    label="Categories"
                    description="Tree & taxonomy"
                    to="/admin/categories"
                    Icon={Package}
                    accent="bg-sky-100 text-sky-800"
                  />
                </>
              )}
              {canManageSettings(user?.role) && (
                <ShortcutCard
                  label="Company"
                  description="Settings, branding, legal"
                  to="/admin/company-settings"
                  Icon={LayoutGrid}
                  accent="bg-primary-100 text-primary-700"
                />
              )}
              {canManageUsers(user?.role) && (
                <ShortcutCard
                  label="Users & roles"
                  description="Team access"
                  to="/admin/users"
                  Icon={UserCircle}
                  accent="bg-emerald-100 text-emerald-800"
                />
              )}
              {canManageUsers(user?.role) && (
                <ShortcutCard
                  label="Audit log"
                  description="Every panel change"
                  to="/admin/audit-logs"
                  Icon={FileText}
                  accent="bg-gray-200 text-gray-800"
                />
              )}
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*  Queue & shortcut tiles                                                    */
/* -------------------------------------------------------------------------- */

function QueueTile({
  title,
  sub,
  count,
  to,
  Icon,
  tone,
}: {
  title: string;
  sub: string;
  count: number;
  to: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: 'amber' | 'emerald' | 'indigo' | 'violet' | 'pink';
}) {
  const toneMap = {
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    violet: 'bg-violet-50 text-violet-700',
    pink: 'bg-pink-50 text-pink-700',
  } as const;
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-gray-200 p-3.5 hover:border-primary-200 hover:bg-primary-50/30 transition-all"
    >
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${toneMap[tone]} shrink-0`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-display font-bold text-gray-900 group-hover:text-primary-700 transition-colors truncate">
          {title}
        </p>
        <p className="text-xs text-gray-500 truncate">{sub}</p>
      </div>
      <span
        className={`inline-flex items-center justify-center min-w-[36px] px-2 py-1 rounded-full text-xs font-display font-bold ${
          count > 0 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

function ShortcutCard({
  label,
  description,
  to,
  Icon,
  accent,
}: {
  label: string;
  description: string;
  to: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-primary-200 hover:shadow-md transition-all"
    >
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display font-bold text-gray-900 group-hover:text-primary-700 transition-colors text-sm">
          {label}
        </p>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 transition-colors shrink-0" />
    </Link>
  );
}
