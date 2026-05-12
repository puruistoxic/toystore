import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Inbox,
  Search,
  MessageCircle,
  Mail,
  Phone,
  ShoppingCart,
  Tag,
  HelpCircle,
  Filter,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { storefrontAdminApi } from '../../utils/api';

type LeadRow = {
  id: number;
  public_ref: string;
  channel: string;
  source: string | null;
  intent: string | null;
  product_name: string | null;
  product_slug: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  whatsapp_number: string | null;
  page_url: string | null;
  delivery_pincode: string | null;
  related_type: string | null;
  related_ref: string | null;
  status: 'new' | 'followed_up' | 'closed';
  created_at: string;
};

const CHANNEL_META: Record<
  string,
  { label: string; tone: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  whatsapp: { label: 'WhatsApp', tone: 'bg-emerald-100 text-emerald-800', Icon: MessageCircle },
  email: { label: 'Email', tone: 'bg-sky-100 text-sky-800', Icon: Mail },
  phone: { label: 'Phone', tone: 'bg-indigo-100 text-indigo-800', Icon: Phone },
  contact_form: { label: 'Contact form', tone: 'bg-amber-100 text-amber-800', Icon: Inbox },
  quote_request: { label: 'Quote', tone: 'bg-fuchsia-100 text-fuchsia-800', Icon: Tag },
  product_enquiry: { label: 'Product', tone: 'bg-orange-100 text-orange-800', Icon: HelpCircle },
  cart_enquiry: { label: 'Cart', tone: 'bg-cyan-100 text-cyan-800', Icon: ShoppingCart },
  order: { label: 'Order', tone: 'bg-primary-100 text-primary-800', Icon: ShoppingCart },
  other: { label: 'Other', tone: 'bg-gray-100 text-gray-700', Icon: HelpCircle },
};

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-amber-50 text-amber-800 border border-amber-200',
  followed_up: 'bg-sky-50 text-sky-800 border border-sky-200',
  closed: 'bg-gray-100 text-gray-600 border border-gray-200',
};

function relatedLink(r: LeadRow): string | null {
  if (!r.related_ref) return null;
  if (r.related_type === 'order') return `/admin/store/orders/${encodeURIComponent(r.related_ref)}`;
  if (r.related_type === 'cart_enquiry') return `/admin/store/order-requests/${r.related_ref}`;
  return null;
}

export default function StoreLeadsPage() {
  const [channel, setChannel] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [submittedQ, setSubmittedQ] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-store-leads', channel, status, submittedQ],
    queryFn: async () => {
      const res = await storefrontAdminApi.getLeads({
        channel: channel || undefined,
        status: status || undefined,
        q: submittedQ || undefined,
        limit: 100,
        offset: 0,
      });
      return res.data as { leads: LeadRow[]; total: number };
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-store-lead-stats'],
    queryFn: async () => {
      const res = await storefrontAdminApi.getLeadStats();
      return res.data as {
        by_channel: { channel: string; c: number }[];
        by_status: { status: string; c: number }[];
        last_7_days: number;
      };
    },
  });

  const totals = useMemo(() => {
    const m: Record<string, number> = {};
    (stats?.by_channel || []).forEach((r) => {
      m[r.channel] = Number(r.c) || 0;
    });
    const all = Object.values(m).reduce((a, b) => a + b, 0);
    return { all, byChannel: m };
  }, [stats]);

  return (
    <AdminLayout title="Lead activity">
      <div className="space-y-6">
        {/* Header / context */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary-100 p-2.5 text-primary-700">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 max-w-2xl">
                Every outreach the storefront initiates — WhatsApp clicks, quote requests, popup
                enquiries, cart sends, support pings — is logged here with a reference. Use this
                inbox to make sure no enquiry slips through.
              </p>
            </div>
          </div>
        </div>

        {/* Snapshot stats */}
        {stats && (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-display font-bold text-gray-900 uppercase tracking-wide">
                Snapshot
              </h3>
              <span className="text-xs text-gray-500">
                {stats.last_7_days} new in the last 7 days
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {(
                [
                  ['all', 'All', totals.all],
                  ['whatsapp', 'WhatsApp', totals.byChannel.whatsapp || 0],
                  ['quote_request', 'Quotes', totals.byChannel.quote_request || 0],
                  ['contact_form', 'Forms', totals.byChannel.contact_form || 0],
                  ['cart_enquiry', 'Cart', totals.byChannel.cart_enquiry || 0],
                  ['product_enquiry', 'Product', totals.byChannel.product_enquiry || 0],
                  ['order', 'Orders', totals.byChannel.order || 0],
                  ['email', 'Email', totals.byChannel.email || 0],
                ] as const
              ).map(([key, label, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setChannel(key === 'all' ? '' : (key as string))}
                  className={`text-left rounded-xl px-3 py-2.5 border transition-colors ${
                    (key === 'all' && !channel) || channel === key
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-gray-100 bg-gray-50/80 hover:bg-white'
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {label}
                  </p>
                  <p className="mt-0.5 text-lg font-display font-bold text-gray-900 tabular-nums">
                    {value}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedQ(q.trim());
          }}
          className="flex flex-col md:flex-row md:items-center gap-3"
        >
          <div className="relative md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ref, name, phone, email, product, order ref…"
              className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All channels</option>
              {Object.entries(CHANNEL_META).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All statuses</option>
              <option value="new">New</option>
              <option value="followed_up">Followed up</option>
              <option value="closed">Closed</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 text-white px-3 py-2 text-sm font-semibold hover:bg-primary-700"
            >
              <Filter className="h-4 w-4" />
              Apply
            </button>
          </div>
        </form>

        {/* Table */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : isError ? (
            <div className="p-4 text-sm text-red-700">
              {(error as Error)?.message || 'Failed to load.'}
              <button
                type="button"
                className="ml-2 underline font-semibold"
                onClick={() => refetch()}
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Related</th>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(data?.leads || []).map((r) => {
                    const meta = CHANNEL_META[r.channel] || CHANNEL_META.other;
                    const Icon = meta.Icon;
                    const rel = relatedLink(r);
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/60 align-top">
                        <td className="px-4 py-3 font-mono text-xs">
                          <Link
                            to={`/admin/store/leads/${r.id}`}
                            className="text-primary-700 font-semibold hover:underline"
                          >
                            {r.public_ref}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${meta.tone}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {meta.label}
                          </span>
                          {r.intent && (
                            <p className="mt-1 text-[11px] text-gray-500 capitalize">
                              {r.intent.replace(/_/g, ' ')}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900">{r.customer_name || '—'}</div>
                          {r.customer_email && (
                            <div className="text-xs text-gray-500 break-all">
                              {r.customer_email}
                            </div>
                          )}
                          {r.customer_phone && (
                            <div className="text-xs text-gray-500">{r.customer_phone}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          {r.product_name ? (
                            r.product_slug ? (
                              <a
                                href={`/products/${r.product_slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-900 hover:underline line-clamp-2"
                              >
                                {r.product_name}
                              </a>
                            ) : (
                              <span className="text-gray-900 line-clamp-2">{r.product_name}</span>
                            )
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                          {r.source && (
                            <p className="mt-1 text-[11px] text-gray-400 font-mono">{r.source}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {rel && r.related_ref ? (
                            <Link
                              to={rel}
                              className="font-mono text-primary-700 hover:underline"
                            >
                              {r.related_type}:{r.related_ref}
                            </Link>
                          ) : r.related_type && r.related_ref ? (
                            <span className="font-mono text-gray-500">
                              {r.related_type}:{r.related_ref}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                          {new Date(r.created_at).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                              STATUS_BADGE[r.status] || STATUS_BADGE.new
                            }`}
                          >
                            {r.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!data?.leads?.length && (
                <div className="text-center py-12 text-gray-500 text-sm">
                  Nothing matches these filters yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
