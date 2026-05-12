import React, { useEffect, useMemo } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import SEO from '../../components/SEO';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

type NavItem = {
  to: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
};

const NAV: NavItem[] = [
  { to: '/account', label: 'Overview', Icon: LayoutDashboard, end: true },
  { to: '/account/orders', label: 'Orders', Icon: Package },
  { to: '/account/addresses', label: 'Addresses', Icon: MapPin },
  { to: '/account/profile', label: 'Profile', Icon: UserRound },
  { to: '/account/security', label: 'Security', Icon: ShieldCheck },
];

function initialsFor(c: { full_name: string | null; email: string | null; phone: string | null }) {
  const src = c.full_name || c.email || c.phone || '';
  const trimmed = src.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/[\s@.]+/).filter(Boolean);
  const a = parts[0]?.[0] || '';
  const b = parts.length > 1 ? parts[1][0] : '';
  return (a + b).toUpperCase() || trimmed[0].toUpperCase();
}

const AccountLayout: React.FC = () => {
  const { customer, loading, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !customer) {
      const dest = encodeURIComponent(location.pathname + location.search);
      navigate(`/account/login?redirect=${dest}`, { replace: true });
    }
  }, [customer, loading, location.pathname, location.search, navigate]);

  const displayName = useMemo(() => {
    if (!customer) return '';
    return customer.full_name || customer.email || customer.phone || 'Welcome';
  }, [customer]);

  if (loading || !customer) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-500">
        Loading your account…
      </div>
    );
  }

  return (
    <>
      <SEO
        title="My account · DigiDukaanLive"
        description="Manage your DigiDukaanLive orders, saved addresses, and profile."
        path="/account"
        robots="noindex, nofollow"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Top bar — compact, brand-matched */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white text-primary-700 flex items-center justify-center text-xl sm:text-2xl font-bold font-display shadow-md">
                {initialsFor(customer)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-primary-100 text-xs sm:text-sm uppercase tracking-wider font-semibold">
                  My account
                </p>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display truncate">
                  {displayName}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-primary-100 mt-1">
                  {customer.email && (
                    <span className="inline-flex items-center gap-1">
                      {customer.email}
                      {customer.email_verified && (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                      )}
                    </span>
                  )}
                  {customer.phone && (
                    <span className="inline-flex items-center gap-1">
                      {customer.email ? ' · ' : ''}
                      {customer.phone}
                      {customer.phone_verified && (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                      )}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-semibold transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 lg:gap-8">
            {/* Side nav */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              {/* Mobile: horizontal scroll */}
              <nav className="lg:hidden -mx-4 px-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {NAV.map(({ to, label, Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-800 border-primary-200'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-xl text-sm font-semibold border bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </nav>

              {/* Desktop: vertical list */}
              <ul className="hidden lg:flex lg:flex-col gap-1 bg-white rounded-2xl border border-gray-200 p-2 shadow-sm">
                {NAV.map(({ to, label, Icon, end }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-800'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Content */}
            <main className="min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountLayout;
