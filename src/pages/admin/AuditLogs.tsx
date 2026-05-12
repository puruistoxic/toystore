import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminActivityApi } from '../../utils/api';
import {
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  ShoppingBag,
  MessageCircle,
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

type SourceKind = 'admin' | 'storefront' | 'outreach';

interface ActivityRow {
  row_id: number;
  source_kind: SourceKind;
  occurred_at: string;
  actor_display: string;
  action_title: string;
  detail_summary: string;
  ip_address: string | null;
  user_agent: string | null;
  payload_json: string | null;
}

interface FeedResponse {
  activities: ActivityRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function parsePayload(raw: string | null): unknown {
  if (raw == null || raw === '') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

const SOURCE_STYLES: Record<SourceKind, { label: string; className: string; Icon: typeof Shield }> = {
  admin: {
    label: 'Admin panel',
    className: 'bg-amber-100 text-amber-900 border border-amber-200',
    Icon: Shield,
  },
  storefront: {
    label: 'Storefront',
    className: 'bg-primary-100 text-primary-900 border border-primary-200',
    Icon: ShoppingBag,
  },
  outreach: {
    label: 'Outreach',
    className: 'bg-cyan-100 text-cyan-900 border border-cyan-200',
    Icon: MessageCircle,
  },
};

function actionBadgeClass(actionPart: string): string {
  const a = actionPart.toUpperCase();
  if (a.includes('DELETE')) return 'bg-red-100 text-red-800';
  if (a.includes('CREATE') || a.includes('LOGIN') || a.includes('SIGN_IN')) return 'bg-emerald-100 text-emerald-900';
  if (a.includes('UPDATE') || a.includes('RESTORE')) return 'bg-sky-100 text-sky-900';
  if (a.includes('LEAD')) return 'bg-violet-100 text-violet-900';
  return 'bg-gray-100 text-gray-800';
}

export default function AdminAuditLogs() {
  const [page, setPage] = useState(1);
  const [scope, setScope] = useState<'all' | 'admin' | 'website'>('all');
  const [search, setSearch] = useState('');
  const [submittedQ, setSubmittedQ] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
    username: '',
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<FeedResponse>({
    queryKey: ['admin-activity-feed', page, scope, submittedQ, filters.action, filters.entity_type, filters.username],
    queryFn: async () => {
      const res = await adminActivityApi.getFeed({
        scope,
        page,
        limit: 50,
        q: submittedQ || undefined,
        action: filters.action || undefined,
        entity_type: filters.entity_type || undefined,
        username: filters.username || undefined,
      });
      return res.data as FeedResponse;
    },
    staleTime: 15_000,
  });

  const rows = data?.activities || [];
  const pagination = data?.pagination;

  const emptyHint = useMemo(() => {
    if (scope === 'admin') return 'Admin changes appear after you edit content, invoices, or sign in.';
    if (scope === 'website')
      return 'Customer sign-ins, orders, enquiries, and WhatsApp outreach appear here as they happen.';
    return 'Use the scope tabs to focus on admin changes vs. public website activity.';
  }, [scope]);

  return (
    <AdminLayout title="Activity & audit">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary-100 p-2.5 text-primary-700">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-gray-900">Activity &amp; audit log</h2>
                <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                  Everything that happens on the site and in the admin panel: CMS and invoicing changes, customer
                  sign-ins, orders, enquiries, and outreach events — newest first.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                ['all', 'Everything'],
                ['admin', 'Admin panel'],
                ['website', 'Website & visitors'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setScope(id);
                  setPage(1);
                }}
                className={`rounded-xl px-3 py-1.5 text-sm font-semibold border transition-colors ${
                  scope === id
                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold text-gray-900 tabular-nums">{pagination?.total ?? 0}</span>
              events match your filters
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50/80 space-y-3">
            <form
              className="flex flex-col lg:flex-row lg:items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmittedQ(search.trim());
                setPage(1);
              }}
            >
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Actor, action, detail, IP…"
                    className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:contents">
                <div className="min-w-[140px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Action
                  </label>
                  <select
                    value={filters.action}
                    onChange={(e) => {
                      setFilters((f) => ({ ...f, action: e.target.value }));
                      setPage(1);
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All actions</option>
                    <option value="CREATE">Create</option>
                    <option value="UPDATE">Update</option>
                    <option value="DELETE">Delete</option>
                    <option value="RESTORE">Restore</option>
                    <option value="LOGIN">Login</option>
                  </select>
                </div>
                <div className="min-w-[160px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Entity (admin)
                  </label>
                  <select
                    value={filters.entity_type}
                    onChange={(e) => {
                      setFilters((f) => ({ ...f, entity_type: e.target.value }));
                      setPage(1);
                    }}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All types</option>
                    <option value="service">Service</option>
                    <option value="product">Product</option>
                    <option value="category">Category</option>
                    <option value="brand">Brand</option>
                    <option value="location">Location</option>
                    <option value="industry">Industry</option>
                    <option value="case_study">Case study</option>
                    <option value="testimonial">Testimonial</option>
                    <option value="template">Template</option>
                    <option value="company_settings">Company settings</option>
                    <option value="admin_session">Admin session</option>
                    <option value="client">Client</option>
                    <option value="invoice">Invoice</option>
                    <option value="proposal">Proposal</option>
                    <option value="payment">Payment</option>
                    <option value="lead_log">Lead</option>
                    <option value="order">Order</option>
                  </select>
                </div>
                <div className="min-w-[140px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Admin user
                  </label>
                  <input
                    type="text"
                    value={filters.username}
                    onChange={(e) => {
                      setFilters((f) => ({ ...f, username: e.target.value }));
                      setPage(1);
                    }}
                    placeholder="Username…"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 text-white px-4 py-2 text-sm font-semibold hover:bg-primary-700 lg:mb-0"
                >
                  <Filter className="h-4 w-4" />
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilters({ action: '', entity_type: '', username: '' });
                    setSearch('');
                    setSubmittedQ('');
                    setPage(1);
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white lg:mb-0"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="px-6 py-16 text-center">
                <Loader2 className="inline-block h-8 w-8 animate-spin text-primary-600" />
                <p className="mt-2 text-sm text-gray-600">Loading activity…</p>
              </div>
            ) : isError ? (
              <div className="px-6 py-12 text-center">
                <p className="text-red-600 font-medium">Could not load activity</p>
                <p className="text-sm text-gray-500 mt-1">
                  {error instanceof Error ? error.message : 'Unexpected error'}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-3 text-sm font-semibold text-primary-700 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : rows.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <Activity className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">No activity yet</p>
                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">{emptyHint}</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50/90 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3 w-10" />
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Who</th>
                    <th className="px-4 py-3">What</th>
                    <th className="px-4 py-3">Detail</th>
                    <th className="px-4 py-3">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => {
                    const sk = (row.source_kind || 'admin') as SourceKind;
                    const meta = SOURCE_STYLES[sk] || SOURCE_STYLES.admin;
                    const Icon = meta.Icon;
                    const key = `${sk}-${row.row_id}`;
                    const open = !!expanded[key];
                    const actionPart = row.action_title.split('·')[0]?.trim() || row.action_title;
                    const payload = parsePayload(row.payload_json);

                    return (
                      <React.Fragment key={key}>
                        <tr className="hover:bg-gray-50/80 align-top">
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => toggleExpand(key)}
                              className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
                              aria-expanded={open}
                              title={open ? 'Hide details' : 'Show payload'}
                            >
                              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-800">
                            {formatDate(row.occurred_at)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${meta.className}`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-900 max-w-[200px]">
                            <div className="truncate font-medium" title={row.actor_display}>
                              {row.actor_display || '—'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${actionBadgeClass(
                                actionPart,
                              )}`}
                            >
                              {row.action_title}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700 max-w-md">
                            <div className="line-clamp-2" title={row.detail_summary}>
                              {row.detail_summary || '—'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs font-mono">
                            {row.ip_address || '—'}
                          </td>
                        </tr>
                        {open && (
                          <tr className="bg-gray-50/50">
                            <td colSpan={7} className="px-4 pb-4 pt-0">
                              {row.user_agent && (
                                <p className="text-xs text-gray-500 mb-2 break-all">
                                  <span className="font-semibold text-gray-600">User agent:</span> {row.user_agent}
                                </p>
                              )}
                              {payload != null && (
                                <pre className="text-xs bg-white border border-gray-200 rounded-xl p-3 overflow-x-auto max-h-64 overflow-y-auto">
                                  {typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)}
                                </pre>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} events
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (pagination.totalPages || 1)}
                  className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
