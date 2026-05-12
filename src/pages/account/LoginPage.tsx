import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import SEO from '../../components/SEO';
import customerApi from '../../utils/customerApi';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer, providers, loading, setSession } = useCustomerAuth();
  const [tab, setTab] = useState<'email' | 'whatsapp'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'enter' | 'otp_sent' | 'sent'>('enter');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [waStubHint, setWaStubHint] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const otpInputRef = React.useRef<HTMLInputElement | null>(null);

  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('redirect') || '/account';
  }, [location.search]);

  useEffect(() => {
    if (!loading && customer) navigate(redirectTo, { replace: true });
  }, [customer, loading, navigate, redirectTo]);

  // Resend-OTP countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  // Auto-focus the OTP field when the WhatsApp code arrives
  useEffect(() => {
    if (tab === 'whatsapp' && stage === 'otp_sent') {
      otpInputRef.current?.focus();
    }
  }, [tab, stage]);

  async function requestMagicLink() {
    setError(null);
    setDevUrl(null);
    setBusy(true);
    try {
      const res = await customerApi.post<{ success: boolean; dev_url?: string }>(
        '/customer/auth/magic-link/request',
        { email: email.trim().toLowerCase(), redirect_to: redirectTo },
      );
      setStage('sent');
      if (res.data.dev_url) setDevUrl(res.data.dev_url);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Could not send sign-in link. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function requestWhatsappOtp() {
    setError(null);
    setWaStubHint(null);
    setBusy(true);
    try {
      const res = await customerApi.post<{
        success?: boolean;
        dev_code?: string;
        message?: string;
        resend_after_seconds?: number;
      }>('/customer/auth/whatsapp-otp/request', { phone });
      setStage('otp_sent');
      setOtp('');
      setResendIn(Math.max(15, Math.min(120, res.data.resend_after_seconds || 30)));
      if (res.data.dev_code) {
        setWaStubHint(
          `WhatsApp delivery is not active on the server — dev OTP: ${res.data.dev_code} (configure Zavu for production).`,
        );
      }
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; retry_after_seconds?: number } } })
        ?.response?.data;
      if (data?.retry_after_seconds) {
        setResendIn(data.retry_after_seconds);
      }
      setError(data?.error || 'Could not send OTP.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyWhatsappOtp() {
    setError(null);
    setBusy(true);
    try {
      const res = await customerApi.post<{
        token: string;
        customer: import('../../contexts/CustomerAuthContext').CustomerProfile;
      }>('/customer/auth/whatsapp-otp/verify', { phone, code: otp });
      await setSession(res.data.token, res.data.customer);
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          'Could not verify OTP.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SEO
        title="Sign in · DigiDukaanLive"
        description="Sign in to your DigiDukaanLive account to track orders and manage delivery addresses."
        path="/account/login"
        robots="noindex, nofollow"
      />
      <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-primary-600" />
            <h1 className="text-xl sm:text-2xl font-display font-bold text-gray-900">Sign in</h1>
          </div>
          <p className="text-sm text-gray-600 mb-5">
            Sign in to track your orders and manage delivery addresses.
          </p>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-4 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setTab('email')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                tab === 'email' ? 'bg-white shadow text-primary-700' : 'text-gray-600'
              }`}
            >
              <Mail className="h-4 w-4" /> Email link
            </button>
            <button
              type="button"
              onClick={() => setTab('whatsapp')}
              disabled={!providers.whatsapp_otp}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                tab === 'whatsapp' ? 'bg-white shadow text-primary-700' : 'text-gray-600'
              } ${!providers.whatsapp_otp ? 'opacity-40 cursor-not-allowed' : ''}`}
              title={!providers.whatsapp_otp ? 'WhatsApp OTP not configured on server' : undefined}
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp OTP
            </button>
          </div>

          {tab === 'email' && stage === 'enter' && (
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                  autoComplete="email"
                />
              </label>
              <button
                type="button"
                onClick={requestMagicLink}
                disabled={busy || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-primary-600 text-white font-display font-semibold hover:bg-primary-700 disabled:opacity-50"
              >
                {busy ? 'Sending…' : 'Send sign-in link'}
              </button>
            </div>
          )}

          {tab === 'email' && stage === 'sent' && (
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                If the email is valid, a sign-in link has been sent. The link expires in a few
                minutes and can only be used once. Check your inbox (and spam folder).
              </p>
              {devUrl && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
                  <p className="text-xs text-amber-800 font-semibold mb-1">Dev mode</p>
                  <a className="text-xs text-amber-900 underline break-all" href={devUrl}>
                    {devUrl}
                  </a>
                </div>
              )}
              <button
                type="button"
                onClick={() => setStage('enter')}
                className="text-sm text-primary-600 font-semibold hover:underline"
              >
                Use a different email
              </button>
            </div>
          )}

          {tab === 'whatsapp' && stage === 'enter' && providers.whatsapp_otp && (
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">WhatsApp number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && phone.replace(/\D/g, '').length >= 10 && !busy) {
                      e.preventDefault();
                      requestWhatsappOtp();
                    }
                  }}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </label>
              <p className="text-xs text-gray-500">
                We&apos;ll send a 6-digit code via WhatsApp. Indian numbers can be entered without the country code.
              </p>
              <button
                type="button"
                onClick={requestWhatsappOtp}
                disabled={busy || phone.replace(/\D/g, '').length < 10}
                className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-primary-600 text-white font-display font-semibold hover:bg-primary-700 disabled:opacity-50"
              >
                {busy ? 'Sending…' : 'Send OTP on WhatsApp'}
              </button>
            </div>
          )}

          {tab === 'whatsapp' && stage === 'otp_sent' && providers.whatsapp_otp && (
            <div className="space-y-3">
              {waStubHint && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-950 text-xs px-3 py-2">
                  {waStubHint}
                </div>
              )}
              <p className="text-sm text-gray-600">
                We sent a 6-digit code to <span className="font-semibold text-gray-900">{phone}</span> on WhatsApp.
              </p>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">6-digit code</span>
                <input
                  ref={otpInputRef}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && otp.length === 6 && !busy) {
                      e.preventDefault();
                      verifyWhatsappOtp();
                    }
                  }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-lg font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </label>
              <button
                type="button"
                onClick={verifyWhatsappOtp}
                disabled={busy || otp.length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-primary-600 text-white font-display font-semibold hover:bg-primary-700 disabled:opacity-50"
              >
                {busy ? 'Verifying…' : 'Verify and sign in'}
              </button>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStage('enter')}
                  className="text-primary-600 font-semibold hover:underline"
                >
                  Use a different number
                </button>
                {resendIn > 0 ? (
                  <span className="text-gray-500 tabular-nums">Resend in {resendIn}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={requestWhatsappOtp}
                    disabled={busy}
                    className="text-primary-600 font-semibold hover:underline disabled:opacity-50"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>
          )}

          {providers.google && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <a
                href={`/api/customer/auth/google/start?redirect_to=${encodeURIComponent(redirectTo)}`}
                className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] rounded-xl border-2 border-gray-200 text-gray-800 font-semibold hover:bg-gray-50"
              >
                <span className="text-lg">G</span>
                Continue with Google
              </a>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2">
              {error}
            </div>
          )}

          <p className="text-xs text-gray-500 mt-5">
            Don’t have an account?{' '}
            <Link to="/account/login" className="text-primary-600 font-semibold hover:underline">
              We’ll create one for you on first sign-in.
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
