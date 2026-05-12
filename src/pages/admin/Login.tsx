import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  ShieldCheck,
  User,
} from 'lucide-react';
import SEO from '../../components/SEO';
import DigiDukaanLiveLogo from '../../components/DigiDukaanLiveLogo';
import { useAuth } from '../../contexts/AuthContext';

type LocationState = { from?: { pathname?: string } } | null;

const FEATURES = [
  'Catalogue, brands & categories',
  'Orders, fulfilment & refunds',
  'Leads, cart requests & customers',
  'Company settings & audit trail',
] as const;

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const from = (location.state as LocationState)?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
      const from = (location.state as LocationState)?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ||
        'Sign in failed. Please check your username and password.';
      setError(message);
      requestAnimationFrame(() => {
        passwordRef.current?.select();
        passwordRef.current?.focus();
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-amber-50/40">
        <div className="text-center" role="status" aria-live="polite">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600 mx-auto" aria-hidden />
          <p className="mt-4 text-sm text-gray-600">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  const hasError = Boolean(error);

  return (
    <>
      <SEO
        title="Admin sign in · DigiDukaanLive"
        description="Internal admin sign-in for the DigiDukaanLive storefront console."
        path="/admin/login"
        robots="noindex, nofollow"
      />

      <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-gray-50 to-white lg:grid lg:grid-cols-2">
        <a
          href="#admin-login-form"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-800 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Skip to sign-in form
        </a>

        {/* Brand / marketing pane */}
        <aside
          className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-600 via-primary-800 to-brand-ink text-white p-10 xl:p-12"
          aria-hidden={false}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,180,100,0.25),transparent)]"
          />
          <div
            aria-hidden
            className="absolute -top-28 -right-28 h-80 w-80 rounded-full bg-white/12 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-36 -left-24 h-[22rem] w-[22rem] rounded-full bg-amber-400/15 blur-3xl"
          />

          <div className="relative">
            <DigiDukaanLiveLogo size="md" variant="onDark" showTagline={false} />
          </div>

          <div className="relative space-y-6 max-w-md">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-amber-200" aria-hidden />
              Restricted area
            </p>
            <h2 className="text-3xl xl:text-[2.25rem] font-display font-bold leading-[1.15] tracking-tight text-white drop-shadow-sm">
              Run the store.
              <br />
              <span className="text-amber-200">Effortlessly.</span>
            </h2>
            <p className="text-[15px] leading-relaxed text-white/90">
              Manage products, orders, customers, and storefront content for{' '}
              <strong className="font-semibold text-white">DigiDukaanLive</strong> from one secure
              console.
            </p>

            <ul className="space-y-2.5 text-sm text-white/90 pt-1">
              {FEATURES.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300 shadow-[0_0_0_3px_rgba(253,224,71,0.25)]"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex flex-wrap items-center justify-between gap-4 text-xs text-white/70">
            <span>© {new Date().getFullYear()} DigiDukaanLive</span>
            <Link
              to="/"
              className="group inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl px-3 py-2 font-semibold text-white/95 ring-1 ring-white/20 transition hover:bg-white/10 hover:text-white hover:ring-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800"
            >
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" aria-hidden />
              Back to store
            </Link>
          </div>
        </aside>

        {/* Sign-in form */}
        <main
          id="admin-login-form"
          className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 lg:py-12"
          tabIndex={-1}
        >
          <div className="w-full max-w-[420px]">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <DigiDukaanLiveLogo size="sm" showTagline={false} />
              <Link
                to="/"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-primary-800 ring-1 ring-primary-200/80 transition hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Store
              </Link>
            </div>

            <div
              className={`rounded-2xl border bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_40px_-12px_rgba(15,23,42,0.12)] transition-shadow sm:p-9 ${
                hasError
                  ? 'border-red-200/90 ring-1 ring-red-100'
                  : 'border-gray-200/90 ring-1 ring-black/[0.04]'
              }`}
            >
              <header className="flex gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-amber-50 text-primary-800 shadow-inner"
                  aria-hidden
                >
                  <Lock className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 pt-0.5">
                  <h1 className="text-2xl font-display font-bold tracking-tight text-gray-900">
                    Welcome back
                  </h1>
                  <p className="mt-1 text-sm leading-snug text-gray-600">
                    Sign in with your staff username and password.
                  </p>
                </div>
              </header>

              {hasError && (
                <div
                  ref={errorRef}
                  role="alert"
                  aria-live="assertive"
                  tabIndex={-1}
                  className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50/95 px-4 py-3 text-sm text-red-900 outline-none"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
                  <div>
                    <p className="font-semibold">Could not sign you in</p>
                    <p className="mt-0.5 text-red-800/95">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate aria-busy={loading}>
                <div>
                  <label
                    htmlFor="username"
                    className="mb-1.5 block text-sm font-semibold text-gray-800"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User
                      aria-hidden
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      ref={usernameRef}
                      id="username"
                      name="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      required
                      aria-invalid={hasError}
                      aria-describedby="username-hint"
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-3 text-[15px] text-gray-900 placeholder:text-gray-400 transition placeholder:font-normal focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-60"
                      placeholder="Your username"
                    />
                  </div>
                  <p id="username-hint" className="mt-1.5 text-xs text-gray-500">
                    Same login your administrator created for you.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-semibold text-gray-800"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      aria-hidden
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      ref={passwordRef}
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={handleKeyPress}
                      onKeyDown={handleKeyPress}
                      autoComplete="current-password"
                      required
                      aria-invalid={hasError}
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-12 text-[15px] text-gray-900 placeholder:text-gray-400 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-60"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      disabled={loading}
                      className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden />
                      )}
                    </button>
                  </div>
                  {capsLockOn && (
                    <p
                      className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-800"
                      role="status"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Caps Lock is on — passwords are case-sensitive.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !username.trim() || !password}
                  className="group relative w-full overflow-hidden rounded-xl bg-primary-600 py-3.5 text-[15px] font-display font-bold text-white shadow-md shadow-primary-900/10 transition hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-900/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 active:scale-[0.99] active:bg-primary-800 disabled:pointer-events-none disabled:opacity-55 min-h-[52px]"
                >
                  <span className="relative z-10 inline-flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                        Signing in…
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 opacity-90" aria-hidden />
                        Sign in
                      </>
                    )}
                  </span>
                </button>
              </form>

              <footer className="mt-8 border-t border-gray-100 pt-6">
                <p className="text-center text-[12px] leading-relaxed text-gray-500">
                  Restricted to authorised staff. Sessions and sensitive actions may be logged.
                </p>
                <p className="mt-2 text-center text-[12px] text-gray-500">
                  Need access?{' '}
                  <span className="font-medium text-gray-700">Contact your administrator.</span>
                </p>
              </footer>
            </div>

            <p className="mt-8 text-center text-xs text-gray-400 lg:hidden">
              © {new Date().getFullYear()} DigiDukaanLive
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
