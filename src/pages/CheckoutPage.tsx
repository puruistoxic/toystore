import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Lock, Mail, MapPin, Phone, User } from 'lucide-react';
import SEO from '../components/SEO';
import StateAutocomplete from '../components/StateAutocomplete';
import { useCart } from '../contexts/CartContext';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import customerApi from '../utils/customerApi';
import { loadRazorpayScript } from '../utils/razorpay';
import { generatePageTitle } from '../utils/seo';
import { getPlaceholderImage, handleImageError } from '../utils/imagePlaceholder';

type Step = 'contact' | 'address' | 'review';

type ContactForm = {
  name: string;
  email: string;
  phone: string;
};

type AddressForm = {
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

type CheckoutOrder = {
  public_ref: string;
  amounts: { subtotal: number; shipping: number; discount: number; tax: number; total: number; currency: string };
  status: string;
  payment_status: string;
};

type RazorpayHandlerResp = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

function emptyAddress(): AddressForm {
  return {
    full_name: '',
    phone: '',
    line1: '',
    line2: '',
    landmark: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  };
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalItems, clearCart } = useCart();
  const { customer } = useCustomerAuth();

  const [step, setStep] = useState<Step>('contact');
  const [contact, setContact] = useState<ContactForm>({
    name: customer?.full_name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
  });
  const [address, setAddress] = useState<AddressForm>(emptyAddress());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  useEffect(() => {
    if (customer) {
      setContact((c) => ({
        name: c.name || customer.full_name || '',
        email: c.email || customer.email || '',
        phone: c.phone || customer.phone || '',
      }));
      // Try prefilling first saved address
      customerApi
        .get<{ addresses: AddressForm[] }>('/customer/auth/addresses')
        .then((res) => {
          const first = (res.data.addresses || [])[0];
          if (first) {
            setAddress((a) => ({
              ...a,
              full_name: first.full_name || a.full_name,
              phone: first.phone || a.phone,
              line1: first.line1 || a.line1,
              line2: first.line2 || a.line2,
              landmark: first.landmark || a.landmark,
              city: first.city || a.city,
              state: first.state || a.state,
              postal_code: first.postal_code || a.postal_code,
              country: first.country || a.country,
            }));
          }
        })
        .catch(() => {
          /* ignore */
        });
    }
  }, [customer]);

  const subtotal = useMemo(
    () => items.reduce((sum, l) => sum + (l.price > 0 ? l.price * l.quantity : 0), 0),
    [items],
  );

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-gray-700 font-medium mb-3">Your cart is empty.</p>
        <Link to="/products" className="text-primary-600 font-semibold hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  function validateContact(): boolean {
    const e: Record<string, string> = {};
    if (!contact.name.trim()) e.name = 'Required';
    if (!contact.email.trim() && !contact.phone.trim()) {
      e.email = 'Email or phone is required';
      e.phone = 'Email or phone is required';
    }
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      e.email = 'Invalid email';
    }
    if (contact.phone && contact.phone.replace(/\D/g, '').length < 10) {
      e.phone = 'Enter a 10+ digit phone';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateAddress(): boolean {
    const e: Record<string, string> = {};
    const req: (keyof AddressForm)[] = ['full_name', 'phone', 'line1', 'city', 'state', 'postal_code'];
    for (const k of req) if (!address[k]?.trim()) e[k] = 'Required';
    if (address.postal_code && !/^\d{4,10}$/.test(address.postal_code.replace(/\s+/g, ''))) {
      e.postal_code = 'Invalid postal code';
    }
    if (address.phone && address.phone.replace(/\D/g, '').length < 10) {
      e.phone = 'Enter a 10+ digit phone';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function createOrderAndPay() {
    if (!acceptedPolicies) {
      setPaymentError(
        'Please confirm that you have read and agree to our payment, refund, and cancellation policies before paying.',
      );
      return;
    }
    setSubmitting(true);
    setPaymentError(null);
    try {
      const checkoutPayload = {
        items: items.map((l) => ({
          product_id: l.productId,
          product_slug: l.slug,
          product_name: l.name,
          brand: l.brand,
          unit_price: l.price,
          quantity: l.quantity,
          image_url: l.imageUrl,
          line_note: l.note,
        })),
        contact: {
          name: contact.name.trim(),
          email: contact.email.trim().toLowerCase() || undefined,
          phone: contact.phone.trim() || undefined,
        },
        shipping_address: {
          full_name: address.full_name.trim(),
          phone: address.phone.trim(),
          line1: address.line1.trim(),
          line2: address.line2.trim() || undefined,
          landmark: address.landmark.trim() || undefined,
          city: address.city.trim(),
          state: address.state.trim(),
          postal_code: address.postal_code.trim(),
          country: address.country.trim() || 'India',
        },
      };

      const checkoutRes = await customerApi.post<{ success: true; order: CheckoutOrder }>(
        '/orders/checkout',
        checkoutPayload,
      );
      const order = checkoutRes.data.order;

      // Order is persisted server-side (status = pending_payment, all items
      // stored in order_items). Clear the local cart now so that a Razorpay
      // dismiss/fail/success all leave a clean slate — the user can retry
      // payment from /account/orders/:ref without the cart re-prompting them
      // to "submit" again. If anything goes wrong after this point, the order
      // is still safely retrievable from the account.
      clearCart();

      // Create Razorpay order
      const payRes = await customerApi.post<{
        key_id: string;
        razorpay_order_id: string;
        amount: number;
        currency: string;
        order_ref: string;
        prefill?: { name?: string; email?: string; contact?: string };
      }>(`/orders/${encodeURIComponent(order.public_ref)}/pay`);

      // Open Razorpay
      setPaying(true);
      await loadRazorpayScript();
      if (!window.Razorpay) throw new Error('Razorpay SDK failed to load');

      const rzpInstance = new window.Razorpay({
        key: payRes.data.key_id,
        amount: payRes.data.amount,
        currency: payRes.data.currency,
        name: 'DigiDukaanLive',
        description: `Order ${order.public_ref}`,
        order_id: payRes.data.razorpay_order_id,
        prefill: {
          name: payRes.data.prefill?.name || contact.name,
          email: payRes.data.prefill?.email || contact.email,
          contact: payRes.data.prefill?.contact || contact.phone,
        },
        notes: { order_ref: order.public_ref },
        theme: { color: '#0d9488' },
        handler: async (response: RazorpayHandlerResp) => {
          try {
            await customerApi.post(
              `/orders/${encodeURIComponent(order.public_ref)}/confirm`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            );
            // Cart was already cleared right after the order was created.
            navigate(`/account/orders/${encodeURIComponent(order.public_ref)}?paid=1`);
          } catch (err: unknown) {
            setPaying(false);
            const message =
              (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
              'Payment verification failed. Please contact support with your order reference.';
            setPaymentError(message);
            // Still send the user to the order page — webhook may settle it.
            navigate(`/account/orders/${encodeURIComponent(order.public_ref)}?awaiting=1`);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            // Order stays in pending_payment — user can come back to /account/orders/:ref and retry.
            navigate(`/account/orders/${encodeURIComponent(order.public_ref)}?cancelled=1`);
          },
        },
      });
      rzpInstance.on('payment.failed', (resp: unknown) => {
        setPaying(false);
        const description =
          (resp as { error?: { description?: string } })?.error?.description ||
          'Payment failed. Please try again or use a different method.';
        setPaymentError(description);
      });
      rzpInstance.open();
    } catch (err: unknown) {
      setPaying(false);
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err as Error)?.message ||
        'Could not start checkout. Please try again.';
      setPaymentError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const stepIndex = step === 'contact' ? 0 : step === 'address' ? 1 : 2;
  const stepLabels = ['Contact', 'Address', 'Review & pay'];

  return (
    <>
      <SEO
        title={generatePageTitle('Checkout')}
        description="Secure checkout for DigiDukaanLive: contact, delivery address, and online payment."
        path="/checkout"
        robots="noindex, nofollow"
      />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-primary-100 hover:text-white text-sm font-medium mb-3"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to cart
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">Checkout</h1>
            <p className="text-primary-100 text-sm mt-1">
              {totalItems} item{totalItems !== 1 ? 's' : ''} · ₹{subtotal.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-2">
              {stepLabels.map((label, i) => (
                <React.Fragment key={label}>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                      i <= stepIndex
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {i < stepIndex ? <CheckCircle className="h-4 w-4" /> : <span>{i + 1}</span>}
                    {label}
                  </div>
                  {i < stepLabels.length - 1 && <div className="flex-1 h-px bg-gray-200" />}
                </React.Fragment>
              ))}
            </div>

            {/* Step content */}
            {step === 'contact' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-gray-900">Your contact</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {customer
                      ? `Signed in as ${customer.email || customer.phone}. You can edit below.`
                      : 'Sign in is optional — we’ll create your account from these details. After payment you can claim it via email magic link.'}
                  </p>
                </div>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Full name</span>
                  <div className="relative">
                    <User className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                      className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm ${
                        errors.name ? 'border-red-400' : 'border-gray-200'
                      }`}
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Email</span>
                    <div className="relative">
                      <Mail className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                        className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm ${
                          errors.email ? 'border-red-400' : 'border-gray-200'
                        }`}
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Phone</span>
                    <div className="relative">
                      <Phone className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                        className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm ${
                          errors.phone ? 'border-red-400' : 'border-gray-200'
                        }`}
                        autoComplete="tel"
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </label>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (validateContact()) setStep('address');
                    }}
                    className="px-6 py-3 rounded-xl bg-primary-600 text-white font-display font-semibold hover:bg-primary-700"
                  >
                    Continue to address
                  </button>
                </div>
              </div>
            )}

            {step === 'address' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-gray-900">Delivery address</h2>
                  <p className="text-sm text-gray-600 mt-1">Where should we deliver this order?</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Recipient name</span>
                    <input
                      value={address.full_name}
                      onChange={(e) => setAddress((a) => ({ ...a, full_name: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm ${errors.full_name ? 'border-red-400' : 'border-gray-200'}`}
                      autoComplete="shipping name"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Recipient phone</span>
                    <input
                      value={address.phone}
                      onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                      autoComplete="shipping tel"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Address line 1</span>
                  <input
                    value={address.line1}
                    onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm ${errors.line1 ? 'border-red-400' : 'border-gray-200'}`}
                    autoComplete="shipping address-line1"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Address line 2 (optional)</span>
                  <input
                    value={address.line2}
                    onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm border-gray-200"
                    autoComplete="shipping address-line2"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Landmark (optional)</span>
                  <input
                    value={address.landmark}
                    onChange={(e) => setAddress((a) => ({ ...a, landmark: e.target.value }))}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm border-gray-200"
                  />
                </label>
                <div className="grid sm:grid-cols-3 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">City</span>
                    <input
                      value={address.city}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm ${errors.city ? 'border-red-400' : 'border-gray-200'}`}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">State</span>
                    <StateAutocomplete
                      value={address.state}
                      onChange={(v) => setAddress((a) => ({ ...a, state: v }))}
                      countryCode={address.country === 'India' ? 'IN' : undefined}
                      invalid={!!errors.state}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Postal code</span>
                    <input
                      value={address.postal_code}
                      onChange={(e) => setAddress((a) => ({ ...a, postal_code: e.target.value }))}
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm ${errors.postal_code ? 'border-red-400' : 'border-gray-200'}`}
                    />
                  </label>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('contact')}
                    className="px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateAddress()) setStep('review');
                    }}
                    className="px-6 py-3 rounded-xl bg-primary-600 text-white font-display font-semibold hover:bg-primary-700"
                  >
                    Continue to review
                  </button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-display font-bold text-gray-900">Review &amp; pay</h2>
                </div>

                <section>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <User className="h-4 w-4" /> Contact
                  </h3>
                  <p className="text-sm text-gray-800">{contact.name}</p>
                  <p className="text-sm text-gray-600">
                    {contact.email}
                    {contact.email && contact.phone ? ' · ' : ''}
                    {contact.phone}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep('contact')}
                    className="text-xs text-primary-600 font-semibold mt-1 hover:underline"
                  >
                    Edit
                  </button>
                </section>

                <section>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Delivery address
                  </h3>
                  <p className="text-sm text-gray-800">{address.full_name} · {address.phone}</p>
                  <p className="text-sm text-gray-600">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}
                    {address.landmark ? `, ${address.landmark}` : ''}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.postal_code}, {address.country}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep('address')}
                    className="text-xs text-primary-600 font-semibold mt-1 hover:underline"
                  >
                    Edit
                  </button>
                </section>

                {paymentError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
                    {paymentError}
                  </div>
                )}

                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={acceptedPolicies}
                      onChange={(e) => {
                        setAcceptedPolicies(e.target.checked);
                        if (e.target.checked) setPaymentError(null);
                      }}
                    />
                    <span className="leading-relaxed">
                      I have read and agree to the{' '}
                      <Link
                        to="/policies"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-700 font-semibold hover:underline"
                      >
                        payment, refund &amp; cancellation policy
                      </Link>
                      , the{' '}
                      <Link
                        to="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-700 font-semibold hover:underline"
                      >
                        terms of service
                      </Link>
                      , and the{' '}
                      <Link
                        to="/refund"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-700 font-semibold hover:underline"
                      >
                        refund &amp; exchange policy
                      </Link>
                      . I understand that payment processing fees may be non-refundable on partial refunds where permitted by
                      law, and that Razorpay processes my payment on behalf of the seller.
                    </span>
                  </label>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('address')}
                    className="px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={createOrderAndPay}
                    disabled={submitting || paying || !acceptedPolicies}
                    className="inline-flex items-center justify-center gap-2 min-h-[52px] px-6 rounded-xl bg-primary-600 text-white font-display font-semibold hover:bg-primary-700 disabled:opacity-50 shadow-md"
                  >
                    {submitting || paying ? (
                      <>
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {paying ? 'Opening Razorpay…' : 'Creating order…'}
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5" />
                        Pay ₹{subtotal.toLocaleString('en-IN')} securely
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Payments are processed securely by Razorpay. We never store your card or UPI credentials. See our{' '}
                  <Link to="/policies" className="text-primary-600 hover:underline font-medium">
                    payment policy
                  </Link>{' '}
                  for fees, cancellations, and disputes.
                </p>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-4">
              <h3 className="text-base font-display font-bold text-gray-900 mb-3">Order summary</h3>
              <ul className="divide-y divide-gray-100 mb-3 max-h-72 overflow-auto">
                {items.map((l) => {
                  const img = l.imageUrl?.trim() || getPlaceholderImage(80, 80, l.name);
                  return (
                    <li key={l.productId} className="py-3 flex gap-3">
                      <img
                        src={img}
                        alt=""
                        className="w-12 h-12 object-contain rounded-lg border border-gray-100 p-0.5 bg-gray-50"
                        onError={(e) => handleImageError(e, l.name)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 line-clamp-2">{l.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          × {l.quantity}
                          {l.price > 0 && (
                            <span className="ml-2 font-semibold text-gray-700">
                              ₹{(l.price * l.quantity).toLocaleString('en-IN')}
                            </span>
                          )}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated at delivery</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="tabular-nums text-primary-700">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
