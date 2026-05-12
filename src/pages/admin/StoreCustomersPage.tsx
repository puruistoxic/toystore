import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { storefrontAdminApi } from '../../utils/api';

type CustomerRow = {
  id: number;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  email_verified: number;
  phone_verified: number;
  created_at: string;
  order_count: number;
};

export default function StoreCustomersPage() {
  const [q, setQ] = useState('');
  const [submitted, setSubmitted] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-store-customers', submitted],
    queryFn: async () => {
      const res = await storefrontAdminApi.getCustomers({ q: submitted || undefined, limit: 60, offset: 0 });
      return res.data as { customers: CustomerRow[]; total: number };
    },
  });

  return (
    <AdminLayout title="Store customers">
      <div className="space-y-6">
        <p className="text-sm text-gray-600 max-w-2xl">
          Shoppers who signed in with email, Google, or WhatsApp OTP. Guest checkouts appear only on orders
          (linked after sign-in).
        </p>

        <form
          className="flex flex-col sm:flex-row gap-3 max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(q.trim());
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search email, phone, name…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary-600 text-white px-4 py-2 text-sm font-semibold hover:bg-primary-700"
          >
            Search
          </button>
        </form>

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
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Verified</th>
                    <th className="px-4 py-3 text-right">Orders</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(data?.customers || []).map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/store/customers/${c.id}`}
                          className="font-medium text-primary-700 hover:underline"
                        >
                          {c.full_name || '—'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{c.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{c.phone || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {c.email_verified ? 'Email ' : ''}
                        {c.phone_verified ? 'Phone' : ''}
                        {!c.email_verified && !c.phone_verified ? '—' : ''}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{c.order_count ?? 0}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data?.customers?.length && (
                <div className="text-center py-12 text-gray-500 text-sm">No customers found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
