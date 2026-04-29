import React, { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Copy, Download, PackageSearch } from 'lucide-react';
import SEO from '../components/SEO';
import api from '../utils/api';
import { generatePageTitle, getCanonicalUrl } from '../utils/seo';
import { generateOrderRequestPDF, type CompanySettings } from '../utils/pdfGenerator';
import { orderRequestPdfInputFromApi } from '../utils/orderRequestPdfData';
import type { OrderRequestPdfInput } from '../types/orderRequest';

const OrderRequestPage: React.FC = () => {
  const { publicRef } = useParams<{ publicRef: string }>();
  const [copyDone, setCopyDone] = useState(false);

  const { data: settings } = useQuery<CompanySettings>({
    queryKey: ['company-settings-public'],
    queryFn: async () => {
      const res = await api.get('/content/company-settings/public');
      return res.data;
    },
  });

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['order-request', publicRef],
    queryFn: async () => {
      const res = await api.get(`/content/order-requests/${encodeURIComponent(publicRef || '')}`);
      return res.data;
    },
    enabled: !!publicRef && /^[A-Za-z0-9-]+$/.test(publicRef),
  });

  const pdfInput: OrderRequestPdfInput | null =
    order && order.success ? orderRequestPdfInputFromApi(order) : null;

  const handleDownloadPdf = useCallback(async () => {
    if (!pdfInput?.request_ref) return;
    const doc = await generateOrderRequestPDF(pdfInput, settings || {});
    doc.save(`Order-request-${pdfInput.request_ref}.pdf`);
  }, [pdfInput, settings]);

  const handleCopyRef = useCallback(() => {
    if (!publicRef) return;
    navigator.clipboard.writeText(publicRef).then(() => {
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    });
  }, [publicRef]);

  const invalidRef = !publicRef || !/^[A-Za-z0-9-]+$/.test(publicRef);

  return (
    <>
      <SEO
        title={generatePageTitle(
          order?.request_ref ? `Order request ${order.request_ref}` : 'Track order request',
        )}
        description="View your submitted order request reference and download a PDF summary for DigiDukaanLive."
        path={`/order-request/${publicRef || ''}`}
        robots="noindex, nofollow"
      />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-primary-100 hover:text-white text-sm font-medium mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to order list
            </Link>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/15 p-3">
                <PackageSearch className="h-8 w-8" aria-hidden />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display">Order request</h1>
                <p className="text-primary-100 text-sm mt-1">
                  Saved request — quote this reference when you contact us.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
          {invalidRef ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-600">
              This link does not look valid. Open the link from your confirmation or email.
            </div>
          ) : isLoading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-600">
              Loading your request…
            </div>
          ) : isError ? (
            <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
              <p className="text-gray-800 font-medium mb-2">We could not find this request</p>
              <p className="text-sm text-gray-600 mb-6">
                {(error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                  'Check the reference or submit a new list from the cart.'}
              </p>
              <Link
                to="/cart"
                className="inline-flex rounded-xl bg-primary-600 text-white px-6 py-3 font-semibold hover:bg-primary-700"
              >
                Go to cart
              </Link>
            </div>
          ) : order?.success && pdfInput ? (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Your reference</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <code className="text-lg sm:text-xl font-mono font-bold text-primary-800 break-all">
                    {order.request_ref}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                    {copyDone ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <dl className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Submitted</dt>
                    <dd className="font-medium text-gray-900">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Status</dt>
                    <dd className="font-medium text-gray-900 capitalize">{order.status || 'new'}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500">Track this page</dt>
                    <dd>
                      <a
                        href={getCanonicalUrl(`/order-request/${encodeURIComponent(publicRef || '')}`)}
                        className="text-primary-600 hover:underline break-all text-sm"
                      >
                        {getCanonicalUrl(`/order-request/${encodeURIComponent(publicRef || '')}`)}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Items</h2>
                <ul className="divide-y divide-gray-100">
                  {(order.items || []).map(
                    (
                      it: {
                        product_name?: string;
                        quantity?: number;
                        brand?: string | null;
                        unit_price?: number | null;
                        line_note?: string | null;
                      },
                      idx: number,
                    ) => (
                      <li key={idx} className="py-3 flex justify-between gap-4 text-sm">
                        <div className="min-w-0">
                          <span className="font-medium text-gray-900">{it.product_name}</span>
                          {it.brand && (
                            <span className="text-gray-500 block text-xs mt-0.5">{it.brand}</span>
                          )}
                          {it.line_note?.trim() && (
                            <p className="text-xs text-primary-800 mt-1.5 bg-primary-50 rounded-lg px-2 py-1.5 border border-primary-100">
                              Note: {it.line_note.trim()}
                            </p>
                          )}
                        </div>
                        <span className="text-gray-700 shrink-0">× {it.quantity ?? 1}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf()}
                  className="flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-primary-600 text-white font-display font-semibold hover:bg-primary-700 shadow-md"
                >
                  <Download className="h-5 w-5" />
                  Download PDF
                </button>
                <Link
                  to="/products"
                  className="flex-1 inline-flex items-center justify-center min-h-[48px] rounded-xl border-2 border-gray-200 text-gray-800 font-semibold hover:bg-gray-50"
                >
                  Continue shopping
                </Link>
              </div>

              <p className="text-xs text-gray-500 text-center">
                The PDF is a summary for your records, not a tax invoice. We will confirm price and
                stock on WhatsApp or at the store.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default OrderRequestPage;
