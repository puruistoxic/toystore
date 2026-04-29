import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Trash2,
  ShoppingBag,
  MessageCircle,
  Minus,
  Plus,
  Copy,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import SEO from '../components/SEO';
import { useCart } from '../contexts/CartContext';
import api from '../utils/api';
import { generatePageTitle, getCanonicalUrl } from '../utils/seo';
import { buildCartEnquiryWhatsAppMessage } from '../utils/cartWhatsApp';
import { getPlaceholderImage, handleImageError } from '../utils/imagePlaceholder';
import { normalizeWhatsAppDigits } from '../utils/whatsappNumber';

function productDetailHref(slug: string): string {
  const path = `/products/${slug}`;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return getCanonicalUrl(path);
}

const CartPage: React.FC = () => {
  const { items, totalItems, setLineQuantity, removeLine, clearCart } = useCart();
  const [note, setNote] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copyDone, setCopyDone] = useState(false);

  const { data: settings } = useQuery<{ whatsapp_number?: string }>({
    queryKey: ['company-settings-public'],
    queryFn: async () => {
      const res = await api.get('/content/company-settings/public');
      return res.data;
    },
  });

  const cleanNumber = normalizeWhatsAppDigits(settings?.whatsapp_number);

  const indicativeTotal = useMemo(() => {
    return items.reduce((sum, l) => sum + (l.price > 0 ? l.price * l.quantity : 0), 0);
  }, [items]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      e.customerEmail = 'Please enter a valid email';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCopyRef = useCallback(() => {
    if (!submittedRef) return;
    navigator.clipboard.writeText(submittedRef).then(() => {
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    });
  }, [submittedRef]);

  const handleSendRequest = async () => {
    if (items.length === 0) return;
    if (!validate()) return;

    const linesSnapshot = items.map((l) => ({ ...l }));

    setIsSending(true);
    try {
      const res = await api.post('/content/order-requests', {
        items: linesSnapshot.map((l) => ({
          product_id: l.productId,
          product_name: l.name,
          product_slug: l.slug,
          quantity: l.quantity,
          unit_price: l.price > 0 ? l.price : null,
          brand: l.brand || null,
          line_note: l.note?.trim() || null,
        })),
        customer_name: customerName.trim() || null,
        customer_email: customerEmail.trim() || null,
        customer_phone: customerPhone.trim() || null,
        custom_message: note.trim() || null,
        whatsapp_number: cleanNumber,
      });

      const requestRef = res.data?.request_ref as string | undefined;
      const createdAt = res.data?.created_at as string | undefined;
      if (!requestRef || !createdAt) {
        throw new Error('Invalid response from server');
      }

      setSubmittedRef(requestRef);

      try {
        const text = buildCartEnquiryWhatsAppMessage(linesSnapshot, note, requestRef);
        const extras: string[] = [];
        if (customerName.trim()) extras.push(`Name: ${customerName.trim()}`);
        if (customerPhone.trim()) extras.push(`Phone: ${customerPhone.trim()}`);
        if (customerEmail.trim()) extras.push(`Email: ${customerEmail.trim()}`);
        const full =
          extras.length > 0 ? `${text}\n\n---\n${extras.join('\n')}` : text;
        window.open(
          `https://wa.me/${cleanNumber}?text=${encodeURIComponent(full)}`,
          '_blank',
          'noopener,noreferrer',
        );
      } catch {
        /* WA optional */
      }

      clearCart();
      setNote('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
    } catch (err) {
      console.error(err);
      alert(
        'We could not save your order request. Please check your connection and try again.',
      );
    } finally {
      setIsSending(false);
    }
  };

  const trackUrl =
    submittedRef != null
      ? getCanonicalUrl(`/order-request/${encodeURIComponent(submittedRef)}`)
      : '';

  return (
    <>
      <SEO
        title={generatePageTitle('Order request list')}
        description="Build your order list and submit one request to DigiDukaanLive — get a tracking reference and continue on WhatsApp."
        path="/cart"
      />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/15 p-3">
                <ShoppingBag className="h-8 w-8" aria-hidden />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display">Order request list</h1>
                <p className="text-primary-100 text-sm sm:text-base mt-1 max-w-2xl">
                  Add products from the catalogue, then send one request. You’ll get a tracking
                  reference to use on WhatsApp or at the store.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
          {submittedRef && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-8 w-8 text-green-600 shrink-0 mt-0.5" aria-hidden />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-display font-bold text-green-900">
                    Order request received
                  </h2>
                  <p className="text-sm text-green-800 mt-1">
                    We saved your list on our system. Quote this reference on WhatsApp or when you
                    visit — it helps us pull up your items quickly.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                    <code className="text-base font-mono font-bold text-green-900 bg-white/80 px-3 py-1.5 rounded-lg border border-green-200">
                      {submittedRef}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyRef}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-green-300 text-green-900 text-sm font-semibold hover:bg-green-100/50"
                    >
                      <Copy className="h-4 w-4" />
                      {copyDone ? 'Copied' : 'Copy reference'}
                    </button>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2 flex-wrap">
                    <Link
                      to={`/order-request/${encodeURIComponent(submittedRef)}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View &amp; track
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSubmittedRef(null)}
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-green-800 hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                  {trackUrl && (
                    <p className="text-xs text-green-800/90 mt-3 break-all">
                      Bookmark:{' '}
                      <a href={trackUrl} className="underline">
                        {trackUrl}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
              <ShoppingBag className="h-14 w-14 text-gray-300 mx-auto mb-4" aria-hidden />
              <p className="text-gray-700 font-medium mb-2">Your list is empty</p>
              <p className="text-gray-500 text-sm mb-6">
                Browse products and tap &quot;Add to list&quot; to build an order request.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-xl bg-primary-600 text-white px-6 py-3 font-display font-semibold hover:bg-primary-700 transition-colors"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-display font-bold text-gray-900">Your items</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {totalItems} piece{totalItems !== 1 ? 's' : ''} · {items.length} product
                      {items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {indicativeTotal > 0 && (
                    <p className="text-sm text-gray-600">
                      Indicative subtotal:{' '}
                      <span className="font-bold text-primary-700 tabular-nums">
                        ₹{indicativeTotal.toLocaleString('en-IN')}
                      </span>
                    </p>
                  )}
                </div>
                <ul className="divide-y divide-gray-100">
                  {items.map((line) => {
                    const productUrl = productDetailHref(line.slug);
                    const imgSrc =
                      line.imageUrl && line.imageUrl.trim()
                        ? line.imageUrl
                        : getPlaceholderImage(200, 200, line.name);
                    const lineTotal = line.price > 0 ? line.price * line.quantity : null;
                    return (
                      <li
                        key={line.productId}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 sm:items-center"
                      >
                        <a
                          href={productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 self-start sm:self-center rounded-xl border border-gray-200 bg-gray-50 overflow-hidden w-24 h-24 sm:w-28 sm:h-28 shadow-sm hover:ring-2 hover:ring-primary-300 transition-shadow"
                          aria-label={`View ${line.name} (opens in new tab)`}
                        >
                          <img
                            src={imgSrc}
                            alt=""
                            className="w-full h-full object-contain p-1.5"
                            onError={(e) => handleImageError(e, line.name)}
                          />
                        </a>

                        <div className="flex-1 min-w-0">
                          <a
                            href={productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2 text-base inline-flex items-start gap-1 group"
                          >
                            <span className="underline-offset-2 group-hover:underline">{line.name}</span>
                            <ExternalLink
                              className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-primary-500 mt-1"
                              aria-hidden
                            />
                          </a>
                          {line.brand && (
                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                              {line.brand}
                            </p>
                          )}
                          {line.note?.trim() && (
                            <p className="mt-2 text-sm text-primary-800 bg-primary-50/80 border border-primary-100 rounded-lg px-3 py-2">
                              <span className="font-medium text-primary-900">Your note: </span>
                              {line.note.trim()}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                            {line.price > 0 ? (
                              <>
                                <span className="text-gray-600">
                                  ₹{line.price.toLocaleString('en-IN')}{' '}
                                  <span className="text-gray-400 font-normal">each</span>
                                </span>
                                {lineTotal != null && line.quantity > 1 && (
                                  <span className="font-semibold text-primary-700 tabular-nums">
                                    Line: ₹{lineTotal.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-500 italic">Price on request</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 sm:min-w-[200px]">
                          <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              className="p-3 hover:bg-gray-50 text-gray-700 disabled:opacity-40"
                              disabled={line.quantity <= 1}
                              onClick={() => setLineQuantity(line.productId, line.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4 min-w-[2.75rem] text-center text-sm font-bold tabular-nums">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              className="p-3 hover:bg-gray-50 text-gray-700"
                              onClick={() => setLineQuantity(line.productId, line.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(line.productId)}
                            className="p-3 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
                            aria-label={`Remove ${line.name}`}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-5">
                <div>
                  <h2 className="text-lg font-display font-bold text-gray-900">
                    Submit order request &amp; WhatsApp
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    We save your list and give you a <strong>reference number</strong>. WhatsApp opens
                    with your items so you can confirm stock and price with the store. Optional
                    contact details help us follow up.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note (optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Delivery area, age of child, occasion, etc."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm bg-gray-50/80"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white ${
                        errors.customerEmail ? 'border-red-500' : 'border-gray-200'
                      }`}
                      autoComplete="email"
                    />
                    {errors.customerEmail && (
                      <p className="text-xs text-red-500 mt-1">{errors.customerEmail}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="sm:w-auto px-5 py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 min-h-[52px]"
                  >
                    Clear list
                  </button>
                  <button
                    type="button"
                    onClick={handleSendRequest}
                    disabled={isSending}
                    className="flex-1 flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-[#25D366] text-white font-display font-semibold hover:bg-[#20BA5A] disabled:opacity-50 shadow-md px-6"
                  >
                    {isSending ? (
                      <>
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-5 w-5" />
                        Submit request ({totalItems} item{totalItems !== 1 ? 's' : ''})
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;
