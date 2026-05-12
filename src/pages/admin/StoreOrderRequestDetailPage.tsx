import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { storefrontAdminApi } from '../../utils/api';

export default function StoreOrderRequestDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-store-order-request', id],
    queryFn: async () => {
      const res = await storefrontAdminApi.getOrderRequest(id!);
      return res.data as {
        id: number;
        public_ref: string | null;
        items: Array<Record<string, unknown>>;
        customer_name: string | null;
        customer_email: string | null;
        customer_phone: string | null;
        whatsapp_number: string | null;
        custom_message: string | null;
        status: string;
        created_at: string;
        delivery_pincode?: string | null;
      };
    },
    enabled: !!id && /^\d+$/.test(id),
  });

  if (!id || !/^\d+$/.test(id)) {
    return (
      <AdminLayout title="Order request">
        <p className="text-gray-600">Invalid id.</p>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout title="Order request">
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  if (isError || !data) {
    return (
      <AdminLayout title="Order request">
        <p className="text-red-700 text-sm">{(error as Error)?.message || 'Not found.'}</p>
        <Link
          to="/admin/store/order-requests"
          className="inline-block mt-4 text-primary-700 font-semibold hover:underline"
        >
          ← Back
        </Link>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={data.public_ref || `Request #${data.id}`}>
      <div className="space-y-6 max-w-3xl">
        <Link
          to="/admin/store/order-requests"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          All cart requests
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2 text-sm">
          <p>
            <span className="text-gray-500">Status:</span>{' '}
            <span className="font-semibold text-gray-900">{data.status}</span>
          </p>
          <p>
            <span className="text-gray-500">Pincode:</span> {data.delivery_pincode || '—'}
          </p>
          <p>
            <span className="text-gray-500">Created:</span>{' '}
            {new Date(data.created_at).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display font-bold text-gray-900 mb-3">Contact</h2>
          <p>{data.customer_name || '—'}</p>
          <p className="text-gray-600">{data.customer_email || '—'}</p>
          <p className="text-gray-600">{data.customer_phone || '—'}</p>
          {data.whatsapp_number ? <p className="text-gray-600">WhatsApp: {data.whatsapp_number}</p> : null}
          {data.custom_message ? (
            <div className="mt-4 p-3 rounded-xl bg-gray-50 text-gray-800 whitespace-pre-wrap">
              {data.custom_message}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-display font-bold text-gray-900 mb-3">Items</h2>
          <ul className="divide-y divide-gray-100">
            {(data.items || []).map((it, i) => (
              <li key={i} className="py-3 flex justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{String(it.product_name || '')}</p>
                  <p className="text-xs text-gray-500">
                    Qty {String(it.quantity || 1)}
                    {it.unit_price != null ? ` · ₹${Number(it.unit_price).toLocaleString('en-IN')}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
