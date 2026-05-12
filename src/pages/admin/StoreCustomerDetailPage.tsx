import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Mail, Phone, Package } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { storefrontAdminApi } from '../../utils/api';

export default function StoreCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-store-customer', id],
    queryFn: async () => {
      const res = await storefrontAdminApi.getCustomer(id!);
      return res.data as {
        customer: Record<string, unknown>;
        orders: Array<Record<string, unknown>>;
        addresses: Array<Record<string, unknown>>;
      };
    },
    enabled: !!id && /^\d+$/.test(id),
  });

  if (!id || !/^\d+$/.test(id)) {
    return (
      <AdminLayout title="Customer">
        <p className="text-gray-600">Invalid customer id.</p>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout title="Customer">
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  if (isError || !data?.customer) {
    return (
      <AdminLayout title="Customer">
        <p className="text-red-700 text-sm">{(error as Error)?.message || 'Not found.'}</p>
        <Link to="/admin/store/customers" className="inline-block mt-4 text-primary-700 font-semibold hover:underline">
          ← Customers
        </Link>
      </AdminLayout>
    );
  }

  const c = data.customer;

  return (
    <AdminLayout title={String(c.full_name || c.email || `Customer #${id}`)}>
      <div className="space-y-6">
        <Link
          to="/admin/store/customers"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          All customers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="font-display font-bold text-lg text-gray-900">Profile</h2>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <Mail className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
              <span>{String(c.email || '—')}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <Phone className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
              <span>{String(c.phone || '—')}</span>
            </div>
            <p className="text-xs text-gray-500">
              Joined {c.created_at ? new Date(String(c.created_at)).toLocaleString('en-IN') : '—'}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-display font-bold text-lg text-gray-900 mb-3">Saved addresses</h2>
            {(data.addresses || []).length === 0 ? (
              <p className="text-sm text-gray-500">No saved addresses.</p>
            ) : (
              <ul className="space-y-3 text-sm text-gray-700">
                {data.addresses.map((a) => (
                  <li key={String(a.id)} className="border border-gray-100 rounded-xl p-3">
                    <p className="font-semibold">{String(a.full_name || '')}</p>
                    <p>
                      {[a.line1, a.line2, a.landmark].filter(Boolean).join(', ')}
                    </p>
                    <p>
                      {[a.city, a.state, a.postal_code].filter(Boolean).join(', ')} · {String(a.country || '')}
                    </p>
                    {a.is_default ? (
                      <span className="inline-block mt-1 text-xs font-semibold text-primary-700">Default</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary-600" />
            Recent orders
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">Reference</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data.orders || []).map((o) => (
                  <tr key={String(o.id)}>
                    <td className="px-3 py-2 font-mono">
                      <Link
                        to={`/admin/store/orders/${encodeURIComponent(String(o.public_ref))}`}
                        className="text-primary-700 hover:underline"
                      >
                        {String(o.public_ref)}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{String(o.status)}</td>
                    <td className="px-3 py-2">{String(o.payment_status)}</td>
                    <td className="px-3 py-2 text-right">
                      ₹{Number(o.total_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                      {o.created_at ? new Date(String(o.created_at)).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.orders?.length && <p className="text-sm text-gray-500 py-4">No orders on file.</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
