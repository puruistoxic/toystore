import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users as UsersIcon,
  Mail,
  Phone,
  Shield,
  UserCheck,
  UserX,
  ShoppingBag,
  MessageCircle,
  Loader2,
  ShieldAlert,
  UserCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { usersApi } from '../../utils/api';
import { useAlert } from '../../contexts/AlertContext';

/* ──────────────────────────────────────────────────────────────────────── */

type UserSource = 'admin' | 'customer' | 'guest';

interface DirectoryUser {
  source: UserSource;
  id: number | string;
  ref: string;
  username: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  email_verified: boolean | null;
  phone_verified: boolean | null;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  order_count: number;
  lead_count: number;
  last_related_type?: string | null;
  last_related_ref?: string | null;
}

interface DirectoryResponse {
  users: DirectoryUser[];
  counts: { admin: number; customer: number; guest: number };
  total: number;
}

const TABS: Array<{
  id: 'all' | UserSource;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'all', label: 'Everyone', Icon: UsersIcon },
  { id: 'admin', label: 'Admins', Icon: Shield },
  { id: 'customer', label: 'Customers', Icon: UserCircle },
  { id: 'guest', label: 'Guest contacts', Icon: MessageCircle },
];

const SOURCE_BADGE: Record<UserSource, string> = {
  admin: 'bg-amber-100 text-amber-800 border border-amber-200',
  customer: 'bg-primary-100 text-primary-800 border border-primary-200',
  guest: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
};

const SOURCE_LABEL: Record<UserSource, string> = {
  admin: 'Admin',
  customer: 'Customer',
  guest: 'Guest',
};

function formatRelative(value: string | null): string {
  if (!value) return 'Never';
  const t = new Date(value).getTime();
  if (!Number.isFinite(t)) return '—';
  const diff = Date.now() - t;
  const min = 60 * 1000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diff < min) return 'just now';
  if (diff < hr) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function initialsFor(u: DirectoryUser): string {
  const src = u.name || u.username || u.email || u.phone || '?';
  const parts = src
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function deepLinkFor(u: DirectoryUser): string | null {
  if (u.source === 'admin') return `/admin/users/${u.id}/edit`;
  if (u.source === 'customer') return `/admin/store/customers/${u.id}`;
  if (u.source === 'guest' && u.last_related_type && u.last_related_ref) {
    if (u.last_related_type === 'order')
      return `/admin/store/orders/${encodeURIComponent(u.last_related_ref)}`;
    if (u.last_related_type === 'cart_enquiry')
      return `/admin/store/order-requests/${u.last_related_ref}`;
  }
  return null;
}

/* ──────────────────────────────────────────────────────────────────────── */

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useAlert();
  const [tab, setTab] = useState<'all' | UserSource>('all');
  const [search, setSearch] = useState('');
  const [submittedQ, setSubmittedQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
  const [roleFilter, setRoleFilter] = useState<string>(''); // admins-only filter

  // Debounce search (auto-apply after a short pause too, so user doesn't have to hit Enter).
  useEffect(() => {
    const id = window.setTimeout(() => setSubmittedQ(search.trim()), 350);
    return () => window.clearTimeout(id);
  }, [search]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['users-directory', tab, submittedQ, statusFilter],
    queryFn: async () => {
      const res = await usersApi.getDirectory({
        type: tab,
        q: submittedQ || undefined,
        status: statusFilter || undefined,
        limit: 200,
        offset: 0,
      });
      return res.data as DirectoryResponse;
    },
  });

  const filteredUsers = useMemo(() => {
    let list = data?.users || [];
    if (roleFilter) list = list.filter((u) => u.source === 'admin' && u.role === roleFilter);
    return list;
  }, [data, roleFilter]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-directory'] });
    },
  });

  const handleDeactivate = async (u: DirectoryUser) => {
    if (u.source !== 'admin') return;
    const confirmed = await showConfirm({
      title: 'Deactivate admin',
      message: `Are you sure you want to deactivate ${u.username || u.email || `#${u.id}`}? They will lose admin access.`,
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(Number(u.id));
      await showAlert({
        type: 'success',
        title: 'Done',
        message: 'Admin user deactivated.',
      });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to deactivate.';
      await showAlert({ type: 'error', title: 'Error', message: msg });
    }
  };

  const counts = data?.counts || { admin: 0, customer: 0, guest: 0 };
  const tabCount = (id: 'all' | UserSource) =>
    id === 'all' ? counts.admin + counts.customer + counts.guest : counts[id];

  return (
    <AdminLayout title="Users">
      <div className="space-y-6">
        {/* ── Hero card ────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary-100 p-2.5 text-primary-700">
                <UsersIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-gray-900">
                  People & accounts
                </h2>
                <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                  Back-office admins, signed-in storefront customers, and every guest who has
                  reached out — all in one searchable directory.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                to="/admin/users/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 text-white px-3 py-2 text-sm font-display font-bold hover:bg-primary-700 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add admin
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-5 flex flex-wrap gap-2">
            {TABS.map((t) => {
              const Icon = t.Icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTab(t.id);
                    setRoleFilter('');
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors border ${
                    active
                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                  <span
                    className={`tabular-nums rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tabCount(t.id)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone, username…"
                className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            {(tab === 'all' || tab === 'admin') && (
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All admin roles</option>
                <option value="admin">Administrator</option>
                <option value="order_processor">Order Processor</option>
                <option value="content_manager">Content Manager</option>
                <option value="editor">Editor (legacy)</option>
                <option value="viewer">Viewer</option>
              </select>
            )}
            {tab !== 'guest' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            )}
          </div>
        </section>

        {/* ── Table ────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {(error as Error)?.message || 'Failed to load users.'}
            <button
              type="button"
              onClick={() => refetch()}
              className="ml-2 underline font-semibold"
            >
              Retry
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-display font-bold text-gray-900">No people found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              {submittedQ
                ? 'No one matches those filters yet — try a broader query.'
                : tab === 'admin'
                  ? 'Add your first admin to get started.'
                  : 'Customers and guest contacts will appear here as people reach out or sign in.'}
            </p>
            {tab !== 'customer' && tab !== 'guest' && (
              <Link
                to="/admin/users/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary-600 text-white px-3 py-2 text-sm font-display font-bold hover:bg-primary-700"
              >
                <Plus className="h-4 w-4" />
                Add admin
              </Link>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Person</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Activity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last seen</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u) => {
                    const link = deepLinkFor(u);
                    return (
                      <tr key={u.ref} className="hover:bg-gray-50/60 align-top">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold uppercase ${
                                u.source === 'admin'
                                  ? 'bg-amber-100 text-amber-800'
                                  : u.source === 'customer'
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'bg-cyan-100 text-cyan-800'
                              }`}
                            >
                              {initialsFor(u)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-display font-semibold text-gray-900 truncate max-w-[220px]">
                                {u.name || u.username || u.email || u.phone || '—'}
                              </div>
                              {u.username && u.name && (
                                <div className="text-xs text-gray-500">@{u.username}</div>
                              )}
                              {u.source === 'admin' && u.role && (
                                <div className="text-xs text-gray-500 capitalize">{u.role}</div>
                              )}
                              {u.source === 'customer' && (
                                <div className="text-xs text-gray-500">storefront account</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${SOURCE_BADGE[u.source]}`}
                          >
                            {SOURCE_LABEL[u.source]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.email && (
                            <div className="flex items-center gap-1 text-gray-900 break-all">
                              <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <a
                                href={`mailto:${u.email}`}
                                className="hover:text-primary-700 hover:underline"
                              >
                                {u.email}
                              </a>
                              {u.email_verified ? (
                                <span className="ml-1 text-[10px] font-semibold text-emerald-700">
                                  verified
                                </span>
                              ) : null}
                            </div>
                          )}
                          {u.phone && (
                            <div className="mt-0.5 flex items-center gap-1 text-gray-900">
                              <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <a
                                href={`tel:${u.phone}`}
                                className="hover:text-primary-700 hover:underline"
                              >
                                {u.phone}
                              </a>
                              {u.phone_verified ? (
                                <span className="ml-1 text-[10px] font-semibold text-emerald-700">
                                  verified
                                </span>
                              ) : null}
                            </div>
                          )}
                          {!u.email && !u.phone && <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {u.source !== 'admin' && (
                            <>
                              {u.order_count > 0 && (
                                <div className="flex items-center gap-1">
                                  <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
                                  <span>
                                    <span className="font-semibold text-gray-900 tabular-nums">
                                      {u.order_count}
                                    </span>{' '}
                                    order{u.order_count === 1 ? '' : 's'}
                                  </span>
                                </div>
                              )}
                              {u.lead_count > 0 && (
                                <div className="mt-0.5 flex items-center gap-1">
                                  <MessageCircle className="h-3.5 w-3.5 text-gray-400" />
                                  <span>
                                    <span className="font-semibold text-gray-900 tabular-nums">
                                      {u.lead_count}
                                    </span>{' '}
                                    enquir{u.lead_count === 1 ? 'y' : 'ies'}
                                  </span>
                                </div>
                              )}
                              {!u.order_count && !u.lead_count && (
                                <span className="text-gray-400">—</span>
                              )}
                            </>
                          )}
                          {u.source === 'admin' && (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {u.source === 'guest' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700">
                              not signed in
                            </span>
                          ) : u.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <UserCheck className="h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              <UserX className="h-3 w-3" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {formatRelative(u.last_seen_at)}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            {link && (
                              <Link
                                to={link}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-primary-700 hover:bg-primary-50"
                                title={
                                  u.source === 'admin'
                                    ? 'Edit'
                                    : u.source === 'customer'
                                      ? 'Open profile'
                                      : 'Open last enquiry'
                                }
                              >
                                {u.source === 'admin' ? (
                                  <Edit className="h-4 w-4" />
                                ) : (
                                  <ExternalLink className="h-4 w-4" />
                                )}
                              </Link>
                            )}
                            {u.source === 'admin' && u.is_active && (
                              <button
                                type="button"
                                onClick={() => handleDeactivate(u)}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-red-600 hover:bg-red-50"
                                title="Deactivate"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            {u.source === 'admin' && !u.is_active && (
                              <span
                                className="inline-flex items-center justify-center h-8 px-2 rounded-lg text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-200"
                                title="Deactivated"
                              >
                                <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                                off
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
