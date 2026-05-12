import React, { useEffect, useState } from 'react';
import { Mail, Phone, Save, ShieldCheck, UserRound } from 'lucide-react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

const INPUT_CLASS =
  'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500';

const ProfilePage: React.FC = () => {
  const { customer, updateProfile } = useCustomerAuth();
  const [fullName, setFullName] = useState(customer?.full_name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(customer?.full_name || '');
    setPhone(customer?.phone || '');
  }, [customer]);

  if (!customer) return null;

  const dirty =
    fullName.trim() !== (customer.full_name || '') ||
    phone.replace(/\D/g, '') !== (customer.phone || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const patch: { full_name?: string; phone?: string } = {};
      if (fullName.trim() !== (customer.full_name || '')) patch.full_name = fullName.trim();
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone !== (customer.phone || '')) patch.phone = cleanPhone;
      await updateProfile(patch);
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 2500);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Could not save profile.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-lg sm:text-xl font-display font-bold text-gray-900">
          Profile & contact
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          This is how we'll reach you about your orders.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5"
      >
        {/* Email — non-editable, but shown with verification status */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Email
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-900 truncate flex-1">
              {customer.email || (
                <span className="text-gray-400">No email linked</span>
              )}
            </span>
            {customer.email_verified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            ) : customer.email ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold">
                Unverified
              </span>
            ) : null}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            We never share your email. Used for order confirmations and sign-in links.
          </p>
        </div>

        {/* Full name */}
        <div>
          <label htmlFor="full_name" className="block text-xs font-semibold text-gray-700 mb-1">
            Full name
          </label>
          <div className="relative">
            <UserRound className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="full_name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`${INPUT_CLASS} pl-9`}
              placeholder="Your name as on the invoice"
              maxLength={120}
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-1">
            Phone
          </label>
          <div className="relative">
            <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`${INPUT_CLASS} pl-9 pr-24`}
              placeholder="10-digit mobile number"
              inputMode="tel"
              maxLength={20}
            />
            {customer.phone_verified && customer.phone === phone.replace(/\D/g, '') && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Used for delivery updates over WhatsApp. Verify with OTP from the sign-in screen.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            Profile saved.
          </p>
        )}

        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            type="submit"
            disabled={!dirty || saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <h3 className="text-base font-display font-bold text-gray-900">Account details</h3>
        <dl className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Customer ID</dt>
            <dd className="font-mono text-gray-900">#{customer.id}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Email verification</dt>
            <dd className="font-medium text-gray-900">
              {customer.email_verified ? 'Verified' : 'Not verified'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Phone verification</dt>
            <dd className="font-medium text-gray-900">
              {customer.phone_verified ? 'Verified' : 'Not verified'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ProfilePage;
