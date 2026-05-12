import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  IndianRupee,
  Package,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import customerApi from '../../utils/customerApi';
import { handleImageError } from '../../utils/imagePlaceholder';
import {
  ORDER_STATUS_BADGE,
  ORDER_STATUS_LABEL,
  OrderListItem,
  OrderStats,
  formatDateTime,
  formatINR,
} from './accountTypes';

type StatCard = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  accent: string;
};

const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [recent, setRecent] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClaim, setShowClaim] = useState(false);
  const [claimRef, setClaimRef] = useState('');
  const [claimContact, setClaimContact] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Use allSettled so one failing endpoint doesn't wipe out the others —
    // stats and recent orders are independent and should degrade independently.
    Promise.allSettled([
      customerApi.get<OrderStats>('/orders/stats'),
      customerApi.get<{ orders: OrderListItem[] }>('/orders?limit=3'),
    ])
      .then(([statsRes, listRes]) => {
        if (cancelled) return;
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data);
        } else {
          console.warn('[Overview] /orders/stats failed', statsRes.reason);
          setStats(null);
        }
        if (listRes.status === 'fulfilled') {
          setRecent(listRes.value.data.orders || []);
        } else {
          console.warn('[Overview] /orders?limit=3 failed', listRes.reason);
          setRecent([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError(null);
    const ref = claimRef.trim();
    const contact = claimContact.trim();
    if (!ref) {
      setClaimError('Enter the order reference.');
      return;
    }
    if (!contact) {
      setClaimError('Enter the email or phone you used at checkout.');
      return;
    }
    setClaiming(true);
    try {
      const isEmail = contact.includes('@');
      const body: { email?: string; phone?: string } = {};
      if (isEmail) body.email = contact;
      else body.phone = contact;
      await customerApi.post(`/orders/${encodeURIComponent(ref)}/claim`, body);
      navigate(`/account/orders/${encodeURIComponent(ref)}`);
    } catch (err: unknown) {
      setClaimError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Could not find that order.',
      );
    } finally {
      setClaiming(false);
    }
  };

  const pendingOrders = recent.filter((o) => o.status === 'pending_payment');

  const cards: StatCard[] = [
    {
      icon: ShoppingBag,
      label: 'Total orders',
      value: String(stats?.total_orders ?? 0),
      accent: 'from-primary-500 to-primary-700',
    },
    {
      icon: PackageCheck,
      label: 'Paid',
      value: String(stats?.paid_orders ?? 0),
      accent: 'from-emerald-500 to-emerald-700',
    },
    {
      icon: Clock,
      label: 'Awaiting payment',
      value: String(stats?.pending_payment_orders ?? 0),
      accent: 'from-amber-500 to-amber-600',
    },
    {
      icon: IndianRupee,
      label: 'Lifetime spent',
      value: formatINR(stats?.lifetime_spent ?? 0),
      accent: 'from-sky-500 to-indigo-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Pending payment alert — highest signal */}
      {!loading && pendingOrders.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-100 p-2">
              <AlertTriangle className="h-5 w-5 text-amber-800" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-display font-bold text-amber-950">
                {pendingOrders.length === 1
                  ? '1 order is awaiting payment'
                  : `${pendingOrders.length} orders are awaiting payment`}
              </h2>
              <p className="text-sm text-amber-900 mt-1">
                Complete the payment to confirm your order and we'll start preparing it for dispatch.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {pendingOrders.slice(0, 3).map((o) => (
                  <Link
                    key={o.public_ref}
                    to={`/account/orders/${encodeURIComponent(o.public_ref)}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-amber-900 border border-amber-200 hover:border-amber-300 text-xs font-semibold"
                  >
                    <code className="font-mono">{o.public_ref}</code>
                    <span className="text-amber-700">·</span>
                    <span className="tabular-nums">{formatINR(o.total_amount)}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
                {pendingOrders.length > 3 && (
                  <Link
                    to="/account/orders?status=pending_payment"
                    className="inline-flex items-center text-amber-900 hover:underline text-xs font-semibold"
                  >
                    View all
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map(({ icon: Icon, label, value, accent }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5"
          >
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-sm mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-xl sm:text-2xl font-bold font-display text-gray-900 mt-1 tabular-nums">
              {loading ? '—' : value}
            </p>
          </div>
        ))}
      </section>

      {/* Recent orders */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-display font-bold text-gray-900">Recent orders</h2>
          </div>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-900"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <div className="p-5">
          {loading ? (
            <ul className="space-y-3" aria-label="Loading recent orders">
              {[0, 1, 2].map((i) => (
                <li key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </ul>
          ) : recent.length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="text-gray-800 font-medium mb-1">No orders yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Find something you love — your orders will show up here.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-xl bg-primary-600 text-white px-5 py-2.5 font-display font-semibold hover:bg-primary-700"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {recent.map((o) => (
                <li key={o.public_ref}>
                  <Link
                    to={`/account/orders/${encodeURIComponent(o.public_ref)}`}
                    className="block rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors p-3 sm:p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnails stack */}
                      <div className="flex -space-x-2 shrink-0">
                        {o.items_preview.slice(0, 3).map((it, idx) => (
                          <div
                            key={it.id}
                            className="h-12 w-12 rounded-xl border-2 border-white bg-gray-50 overflow-hidden shadow-sm"
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
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                        ))}
                        {o.item_count > 3 && (
                          <div className="h-12 w-12 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm">
                            +{o.item_count - 3}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <code className="text-sm font-mono font-bold text-gray-900">
                            {o.public_ref}
                          </code>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              ORDER_STATUS_BADGE[o.status] || 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {o.status === 'paid' && <CheckCircle2 className="h-3 w-3" />}
                            {o.status === 'pending_payment' && <Clock className="h-3 w-3" />}
                            {ORDER_STATUS_LABEL[o.status] || o.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {o.item_count} item{o.item_count !== 1 ? 's' : ''} · {formatDateTime(o.created_at)}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-gray-900 tabular-nums">
                          {formatINR(o.total_amount)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Quick links */}
      <section className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/account/addresses"
          className="block rounded-2xl border border-gray-200 bg-white p-5 hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
        >
          <h3 className="text-base font-display font-bold text-gray-900">Manage addresses</h3>
          <p className="text-sm text-gray-500 mt-1">
            Save shipping addresses for faster checkout.
          </p>
          <span className="inline-flex items-center gap-1 text-sm text-primary-700 font-semibold mt-3">
            Go to addresses
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
        <Link
          to="/account/profile"
          className="block rounded-2xl border border-gray-200 bg-white p-5 hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
        >
          <h3 className="text-base font-display font-bold text-gray-900">Profile & contact</h3>
          <p className="text-sm text-gray-500 mt-1">
            Update your name and phone, manage verification.
          </p>
          <span className="inline-flex items-center gap-1 text-sm text-primary-700 font-semibold mt-3">
            Edit profile
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </section>

      {/* Find a missing order (manual claim) */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => {
            setShowClaim((s) => !s);
            setClaimError(null);
          }}
          className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50"
        >
          <span className="flex items-center gap-3">
            <HelpCircle className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-display font-bold text-gray-900">
              Have an order that isn't showing up?
            </span>
          </span>
          <span className="text-xs text-gray-500">{showClaim ? 'Close' : 'Link it'}</span>
        </button>
        {showClaim && (
          <form
            onSubmit={handleClaim}
            className="border-t border-gray-100 px-5 py-4 space-y-3"
          >
            <p className="text-xs text-gray-600">
              If you placed an order as a guest with a different email or phone, paste
              its reference and the contact detail you used at checkout — we'll link it
              to this account.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Order reference
                </span>
                <input
                  type="text"
                  value={claimRef}
                  onChange={(e) => setClaimRef(e.target.value)}
                  placeholder="e.g. KTS-20260512-XXXXXXXX"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </label>
              <label className="block">
                <span className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Email or phone used at checkout
                </span>
                <input
                  type="text"
                  value={claimContact}
                  onChange={(e) => setClaimContact(e.target.value)}
                  placeholder="you@example.com or 98xxxxxxxx"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </label>
            </div>
            {claimError && (
              <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-start gap-2">
                <span className="flex-1">{claimError}</span>
                <button
                  type="button"
                  onClick={() => setClaimError(null)}
                  className="text-red-700"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClaim(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={claiming}
                className="px-4 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 disabled:opacity-60"
              >
                {claiming ? 'Linking…' : 'Link to my account'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default OverviewPage;
