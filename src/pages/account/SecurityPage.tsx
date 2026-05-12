import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, LogOut, Mail, MessageCircle, ShieldCheck, ShieldOff } from 'lucide-react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import customerApi from '../../utils/customerApi';

type Method = {
  key: 'magic_link' | 'google' | 'whatsapp_otp';
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  identifierLabel: 'email' | 'phone' | 'email';
  active: (c: {
    email_verified: boolean;
    phone_verified: boolean;
    email: string | null;
    phone: string | null;
  }) => boolean;
};

const METHODS: Method[] = [
  {
    key: 'magic_link',
    title: 'Email magic link',
    description:
      'We send a one-time sign-in link to your email. No password to remember.',
    Icon: Mail,
    identifierLabel: 'email',
    active: (c) => !!c.email && c.email_verified,
  },
  {
    key: 'google',
    title: 'Google',
    description: 'Use your Google account to sign in.',
    Icon: ShieldCheck,
    identifierLabel: 'email',
    active: (c) => !!c.email && c.email_verified,
  },
  {
    key: 'whatsapp_otp',
    title: 'WhatsApp OTP',
    description:
      'Receive a one-time code on WhatsApp (via Zavu) to sign in with your phone number.',
    Icon: MessageCircle,
    identifierLabel: 'phone',
    active: (c) => !!c.phone && c.phone_verified,
  },
];

function WhatsappLinkPanel({
  initialPhoneDigits,
  onLinked,
}: {
  initialPhoneDigits: string;
  onLinked: () => void;
}) {
  const { setSession } = useCustomerAuth();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stubHint, setStubHint] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const otpRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (open && stage === 'otp') {
      otpRef.current?.focus();
    }
  }, [open, stage]);

  const resetClosed = () => {
    setOpen(false);
    setStage('phone');
    setPhone('');
    setOtp('');
    setError(null);
    setStubHint(null);
    setResendIn(0);
  };

  const openPanel = () => {
    setOpen(true);
    setStage('phone');
    setError(null);
    setStubHint(null);
    setOtp('');
    setPhone(initialPhoneDigits || '');
  };

  async function sendOtp() {
    setError(null);
    setStubHint(null);
    setBusy(true);
    try {
      const res = await customerApi.post<{
        success?: boolean;
        dev_code?: string;
        resend_after_seconds?: number;
      }>('/customer/auth/whatsapp-otp/request', { phone });
      setStage('otp');
      setOtp('');
      setResendIn(Math.max(15, Math.min(120, res.data.resend_after_seconds || 30)));
      if (res.data.dev_code) {
        setStubHint(
          `WhatsApp is in dev/stub mode — use code ${res.data.dev_code} (configure Zavu + template for production).`,
        );
      }
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; retry_after_seconds?: number } } })
        ?.response?.data;
      if (data?.retry_after_seconds) setResendIn(data.retry_after_seconds);
      setError(data?.error || 'Could not send OTP.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyLink() {
    setError(null);
    setBusy(true);
    try {
      const res = await customerApi.post<{
        token: string;
        customer: import('../../contexts/CustomerAuthContext').CustomerProfile;
      }>('/customer/auth/whatsapp-otp/link-verify', { phone, code: otp });
      await setSession(res.data.token, res.data.customer);
      resetClosed();
      onLinked();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Could not verify OTP.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className="mt-3">
        <button
          type="button"
          onClick={openPanel}
          className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-display font-semibold text-white shadow-sm hover:bg-primary-700"
        >
          Link with WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-primary-200 bg-primary-50/40 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-primary-900">Link this account to WhatsApp</p>
        <button
          type="button"
          onClick={resetClosed}
          className="text-xs font-semibold text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>

      {stage === 'phone' && (
        <div className="space-y-2">
          <label className="block">
            <span className="text-xs font-medium text-gray-700">WhatsApp number</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && phone.replace(/\D/g, '').length >= 10 && !busy) {
                  e.preventDefault();
                  sendOtp();
                }
              }}
              placeholder="+91 98765 43210"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25"
              autoComplete="tel"
              inputMode="tel"
            />
          </label>
          <button
            type="button"
            onClick={sendOtp}
            disabled={busy || phone.replace(/\D/g, '').length < 10}
            className="w-full rounded-lg bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send code on WhatsApp'}
          </button>
        </div>
      )}

      {stage === 'otp' && (
        <div className="space-y-2">
          {stubHint && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              {stubHint}
            </div>
          )}
          <p className="text-xs text-gray-600">
            Enter the 6-digit code sent to <span className="font-mono font-semibold text-gray-900">{phone}</span>
          </p>
          <input
            ref={otpRef}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && otp.length === 6 && !busy) {
                e.preventDefault();
                verifyLink();
              }
            }}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-center font-mono text-lg tracking-widest focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25"
            placeholder="000000"
          />
          <button
            type="button"
            onClick={verifyLink}
            disabled={busy || otp.length !== 6}
            className="w-full rounded-lg bg-primary-600 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {busy ? 'Verifying…' : 'Verify and link'}
          </button>
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setStage('phone');
                setOtp('');
                setError(null);
              }}
              className="font-semibold text-primary-700 hover:underline"
            >
              Change number
            </button>
            {resendIn > 0 ? (
              <span className="text-gray-500 tabular-nums">Resend in {resendIn}s</span>
            ) : (
              <button
                type="button"
                onClick={sendOtp}
                disabled={busy}
                className="font-semibold text-primary-700 hover:underline disabled:opacity-50"
              >
                Resend code
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{error}</div>
      )}
    </div>
  );
}

const SecurityPage: React.FC = () => {
  const { customer, providers, logout, refresh } = useCustomerAuth();
  const navigate = useNavigate();

  if (!customer) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initialWaDigits = (customer.phone || '').replace(/\D/g, '');

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-lg sm:text-xl font-display font-bold text-gray-900">Security</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage how you sign in to your account.</p>
      </div>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <header className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-display font-bold text-gray-900">Sign-in methods</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Any verified method below can be used to sign in to this account.
          </p>
        </header>
        <ul className="divide-y divide-gray-100">
          {METHODS.map(({ key, title, description, Icon, identifierLabel, active }) => {
            const enabled = providers[key];
            const isActive = active(customer);
            return (
              <li key={key} className="p-5 flex items-start gap-3">
                <div
                  className={`rounded-xl p-2.5 shrink-0 ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-display font-bold text-gray-900">{title}</h4>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                        <Check className="h-3 w-3" /> Active
                      </span>
                    ) : enabled ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-[11px] font-semibold">
                        Not linked
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{description}</p>
                  {isActive && (
                    <p className="text-xs text-gray-500 mt-1">
                      Linked to{' '}
                      <span className="font-mono text-gray-800">
                        {identifierLabel === 'email' ? customer.email : customer.phone}
                      </span>
                    </p>
                  )}
                  {key === 'whatsapp_otp' && enabled && !isActive && (
                    <WhatsappLinkPanel
                      initialPhoneDigits={initialWaDigits}
                      onLinked={() => {
                        void refresh();
                      }}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <h3 className="text-base font-display font-bold text-gray-900 flex items-center gap-2">
          <ShieldOff className="h-4 w-4 text-gray-500" />
          Sign out
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Sign out from this device. You&apos;ll need to sign in again to access your orders and saved addresses.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 text-sm font-semibold"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </section>
    </div>
  );
};

export default SecurityPage;
