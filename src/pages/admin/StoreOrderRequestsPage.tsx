import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Inbox } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { storefrontAdminApi } from '../../utils/api';
import { useAlert } from '../../contexts/AlertContext';

type Row = {
  id: number;
  public_ref: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  status: string;
  created_at: string;
  item_count: number;
  delivery_pincode?: string | null;
};

const STATUSES = ['', 'new', 'contacted', 'quoted', 'closed'] as const;

export default function StoreOrderRequestsPage() {
  const [status, setStatus] = useState('');
  const qc = useQueryClient();
  const { showAlert } = useAlert();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-store-order-requests', status],
    queryFn: async () => {
      const res = await storefrontAdminApi.getOrderRequests({
        status: status || undefined,
        limit: 50,
        offset: 0,
      });
      return res.data as { order_requests: Row[]; total: number };
    },
  });

  const patch = useMutation({
    mutationFn: ({ id, next }: { id: number; next: string }) =>
      storefrontAdminApi.patchOrderRequest(id, { status: next }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin-store-order-requests'] });
      await showAlert({ type: 'success', title: 'Updated', message: 'Status saved.' });
    },
    onError: async (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      await showAlert({ type: 'error', title: 'Error', message: msg || 'Could not update.' });
    },
  });

  return (
    <AdminLayout title="Cart order requests">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary-100 p-2.5 text-primary-700">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 max-w-2xl">
                Multi-item “send my cart” requests (legacy flow). Customers track by reference on the public
                order-request page. Update status as your team follows up.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-gray-500 uppercase">Filter</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s || 'all'} value={s}>
                {s === '' ? 'All statuses' : s}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : isError ? (
            <div className="p-4 text-sm text-red-700">
              {(error as Error)?.message || 'Failed to load.'}
              <button type="button" className="ml-2 underline font-semibold" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Ref</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Pincode</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(data?.order_requests || []).map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link
                          to={`/admin/store/order-requests/${r.id}`}
                          className="text-primary-700 font-semibold hover:underline"
                        >
                          {r.public_ref || `#${r.id}`}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{r.customer_name || '—'}</div>
                        <div className="text-xs text-gray-500">{r.customer_email || '—'}</div>
                        <div className="text-xs text-gray-500">{r.customer_phone || '—'}</div>
                      </td>
                      <td className="px-4 py-3">{r.item_count}</td>
                      <td className="px-4 py-3 text-gray-600">{r.delivery_pincode || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={r.status}
                          disabled={patch.isPending}
                          onChange={(e) => patch.mutate({ id: r.id, next: e.target.value })}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-medium"
                        >
                          {(['new', 'contacted', 'quoted', 'closed'] as const).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data?.order_requests?.length && (
                <div className="text-center py-12 text-gray-500 text-sm">No requests in this filter.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
