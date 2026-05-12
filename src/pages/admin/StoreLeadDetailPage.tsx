import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Save,
  MessageCircle,
  Mail,
  Phone,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { storefrontAdminApi } from '../../utils/api';
import { useAlert } from '../../contexts/AlertContext';

type LeadDetail = {
  id: number;
  public_ref: string;
  channel: string;
  source: string | null;
  intent: string | null;
  product_id: string | null;
  product_name: string | null;
  product_slug: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  whatsapp_number: string | null;
  message_preview: string | null;
  page_url: string | null;
  referrer: string | null;
  delivery_pincode: string | null;
  related_type: string | null;
  related_ref: string | null;
  context_json: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  customer_id: number | null;
  status: 'new' | 'followed_up' | 'closed';
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function relatedLink(r: LeadDetail | undefined): string | null {
  if (!r || !r.related_ref) return null;
  if (r.related_type === 'order') return `/admin/store/orders/${encodeURIComponent(r.related_ref)}`;
  if (r.related_type === 'cart_enquiry') return `/admin/store/order-requests/${r.related_ref}`;
  return null;
}

export default function StoreLeadDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { showAlert } = useAlert();
  const [status, setStatus] = useState<LeadDetail['status']>('new');
  const [notes, setNotes] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-store-lead', id],
    queryFn: async () => {
      const res = await storefrontAdminApi.getLead(id!);
      return res.data as LeadDetail;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (data) {
      setStatus(data.status);
      setNotes(data.notes || '');
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => storefrontAdminApi.patchLead(id!, { status, notes: notes || null }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin-store-lead', id] });
      await qc.invalidateQueries({ queryKey: ['admin-store-leads'] });
      await showAlert({ type: 'success', title: 'Saved', message: 'Lead updated.' });
    },
    onError: async (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      await showAlert({ type: 'error', title: 'Could not save', message: msg || 'Try again.' });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout title="Lead">
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  if (isError || !data) {
    return (
      <AdminLayout title="Lead">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(error as Error)?.message || 'Lead not found.'}
        </div>
      </AdminLayout>
    );
  }

  const rel = relatedLink(data);
  const waHref = data.whatsapp_number
    ? `https://wa.me/${data.whatsapp_number}${
        data.message_preview ? `?text=${encodeURIComponent(data.message_preview)}` : ''
      }`
    : data.customer_phone
      ? `https://wa.me/${data.customer_phone.replace(/\D/g, '')}`
      : '';

  return (
    <AdminLayout title={`Lead ${data.public_ref}`}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/store/leads"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to leads
          </Link>
          <span className="text-gray-300">·</span>
          <span className="text-xs text-gray-500">
            Logged {new Date(data.created_at).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-4">
              <h3 className="font-display font-bold text-gray-900">Enquiry</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <Row label="Reference" value={<span className="font-mono">{data.public_ref}</span>} />
                <Row label="Channel" value={data.channel} capitalize />
                <Row label="Intent" value={data.intent || '—'} capitalize />
                <Row label="Source" value={data.source || '—'} mono />
                <Row label="Product" value={data.product_name || '—'} />
                <Row
                  label="Product page"
                  value={
                    data.product_slug ? (
                      <a
                        href={`/products/${data.product_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-700 hover:underline inline-flex items-center gap-1"
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      '—'
                    )
                  }
                />
                <Row label="Delivery pin" value={data.delivery_pincode || '—'} />
                <Row label="WhatsApp #" value={data.whatsapp_number || '—'} mono />
              </dl>
              {data.message_preview && (
                <div>
                  <p className="text-xs uppercase font-semibold text-gray-500 mb-1.5">Message</p>
                  <pre className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs text-gray-800 whitespace-pre-wrap font-sans">
                    {data.message_preview}
                  </pre>
                </div>
              )}
              {data.context_json && Object.keys(data.context_json).length > 0 && (
                <div>
                  <p className="text-xs uppercase font-semibold text-gray-500 mb-1.5">Context</p>
                  <pre className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-xs text-gray-800 whitespace-pre-wrap font-mono">
                    {JSON.stringify(data.context_json, null, 2)}
                  </pre>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-4">
              <h3 className="font-display font-bold text-gray-900">Customer</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <Row label="Name" value={data.customer_name || '—'} />
                <Row
                  label="Email"
                  value={
                    data.customer_email ? (
                      <a
                        href={`mailto:${data.customer_email}`}
                        className="text-primary-700 hover:underline inline-flex items-center gap-1"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {data.customer_email}
                      </a>
                    ) : (
                      '—'
                    )
                  }
                />
                <Row
                  label="Phone"
                  value={
                    data.customer_phone ? (
                      <a
                        href={`tel:${data.customer_phone}`}
                        className="text-primary-700 hover:underline inline-flex items-center gap-1"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {data.customer_phone}
                      </a>
                    ) : (
                      '—'
                    )
                  }
                />
                <Row label="Customer #" value={data.customer_id || '—'} />
              </dl>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-3 py-2 text-sm font-semibold hover:bg-emerald-700 w-fit"
                >
                  <MessageCircle className="h-4 w-4" />
                  Open WhatsApp
                </a>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-2">
              <h3 className="font-display font-bold text-gray-900">Origin</h3>
              <dl className="grid grid-cols-1 gap-y-1 text-xs">
                {data.page_url && (
                  <Row
                    label="Page"
                    value={
                      <a
                        href={data.page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-700 hover:underline break-all"
                      >
                        {data.page_url}
                      </a>
                    }
                  />
                )}
                {data.referrer && <Row label="Referrer" value={data.referrer} mono />}
                {data.ip && <Row label="IP" value={data.ip} mono />}
                {data.user_agent && (
                  <Row
                    label="User agent"
                    value={<span className="break-all text-gray-600">{data.user_agent}</span>}
                  />
                )}
              </dl>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
              <h3 className="font-display font-bold text-gray-900">Triage</h3>
              <label className="block text-sm">
                <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadDetail['status'])}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="new">New</option>
                  <option value="followed_up">Followed up</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-xs font-semibold text-gray-500 uppercase">Internal notes</span>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Outcome of the call, next step, etc."
                />
              </label>
              <button
                type="button"
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 text-white px-3 py-2 text-sm font-semibold hover:bg-primary-700 disabled:opacity-60"
              >
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </section>

            {rel && (
              <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
                <h3 className="font-display font-bold text-gray-900 mb-2">Related record</h3>
                <Link
                  to={rel}
                  className="inline-flex items-center gap-1.5 text-primary-700 hover:underline text-sm font-semibold"
                >
                  Open {data.related_type} {data.related_ref}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </section>
            )}
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}

function Row({
  label,
  value,
  mono,
  capitalize,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <>
      <dt className="text-xs uppercase font-semibold text-gray-500">{label}</dt>
      <dd
        className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''} ${
          capitalize ? 'capitalize' : ''
        }`}
      >
        {value}
      </dd>
    </>
  );
}
