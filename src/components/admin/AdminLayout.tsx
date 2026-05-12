import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MapPin,
  Award,
  Building2,
  FileText,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  UserCog,
  ExternalLink,
  Store,
  ShoppingCart,
  Inbox,
  UserCircle,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DigiDukaanLiveLogo from '../DigiDukaanLiveLogo';
import {
  canManageContent,
  canManageOrders,
  canManageSettings,
  canManageUsers,
  canViewAuditLogs,
  canViewOrders,
  getRoleLabel,
} from '../../utils/roles';

interface AdminLayoutProps {
  title?: string;
  children: ReactNode;
}

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
}

interface MenuSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
  /** Role gate. If undefined, section is visible to every authenticated admin. */
  visible?: (role?: string | null) => boolean;
}

const menuSections: MenuSection[] = [
  {
    id: 'orders',
    label: 'Order management',
    icon: ShoppingCart,
    visible: canViewOrders,
    items: [
      { label: 'Orders', icon: ShoppingCart, to: '/admin/store/orders' },
      { label: 'Customers', icon: UserCircle, to: '/admin/store/customers' },
      { label: 'Cart requests', icon: Inbox, to: '/admin/store/order-requests' },
      { label: 'Lead activity', icon: MessageCircle, to: '/admin/store/leads' },
    ],
  },
  {
    id: 'catalogue',
    label: 'Catalogue',
    icon: Package,
    visible: canManageContent,
    items: [
      { label: 'Products', icon: ShoppingBag, to: '/admin/products' },
      { label: 'Categories', icon: Package, to: '/admin/categories' },
      { label: 'Brands', icon: Award, to: '/admin/brands' },
      { label: 'Services', icon: Package, to: '/admin/services' },
      { label: 'Templates', icon: FileText, to: '/admin/templates' },
    ],
  },
  {
    id: 'content',
    label: 'Marketing content',
    icon: MessageSquare,
    visible: canManageContent,
    items: [
      { label: 'Locations', icon: MapPin, to: '/admin/locations' },
      { label: 'Industries', icon: Building2, to: '/admin/industries' },
      { label: 'Case Studies', icon: FileText, to: '/admin/case-studies' },
      { label: 'Testimonials', icon: MessageSquare, to: '/admin/testimonials' },
    ],
  },
  {
    id: 'masters',
    label: 'Geography',
    icon: MapPin,
    visible: canManageContent,
    items: [
      { label: 'Countries', icon: MapPin, to: '/admin/countries' },
      { label: 'States', icon: MapPin, to: '/admin/states' },
      { label: 'Localities', icon: MapPin, to: '/admin/localities' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    visible: (role) => canManageSettings(role) || canManageUsers(role) || canViewAuditLogs(role),
    items: [
      { label: 'Company settings', icon: Building2, to: '/admin/company-settings' },
      { label: 'Users', icon: UserCog, to: '/admin/users' },
      { label: 'Activity & audit', icon: FileText, to: '/admin/audit-logs' },
    ],
  },
];

function filterMenu(role?: string | null): MenuSection[] {
  return menuSections
    .map((section) => {
      if (section.visible && !section.visible(role)) return null;
      const items = section.items.filter((item) => {
        if (item.to === '/admin/company-settings') return canManageSettings(role);
        if (item.to === '/admin/users') return canManageUsers(role);
        if (item.to === '/admin/audit-logs') return canViewAuditLogs(role);
        if (item.to.startsWith('/admin/store/orders')) return canViewOrders(role);
        if (item.to.startsWith('/admin/store/')) return canManageOrders(role);
        return true;
      });
      if (!items.length) return null;
      return { ...section, items };
    })
    .filter((s): s is MenuSection => s !== null);
}

const SIDEBAR_COLLAPSED_KEY = 'admin_sidebar_collapsed';
const SIDEBAR_AUTOHIDE_KEY = 'admin_sidebar_autohide';

export default function AdminLayout({ title, children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  });

  const [autoHide, setAutoHide] = useState<boolean>(() => {
    return localStorage.getItem(SIDEBAR_AUTOHIDE_KEY) === '1';
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleSections = useMemo(() => filterMenu(user?.role), [user?.role]);

  // Determine which section should be expanded based on current route
  const initialExpandedSection = useMemo(() => {
    for (const section of visibleSections) {
      if (section.items.some((item) => location.pathname.startsWith(item.to))) {
        return section.id;
      }
    }
    return visibleSections[0]?.id || '';
  }, [location.pathname, visibleSections]);

  const [expandedSection, setExpandedSection] = useState<string>(initialExpandedSection);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isCollapsed ? '1' : '0');
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_AUTOHIDE_KEY, autoHide ? '1' : '0');
  }, [autoHide]);

  // Close mobile sidebar on route change when autoHide is enabled
  useEffect(() => {
    if (autoHide) {
      setMobileOpen(false);
    }
  }, [location.pathname, autoHide]);

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSection((prev) => (prev === sectionId ? '' : sectionId));
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
  const contentMarginClass = isCollapsed ? 'md:ml-20' : 'md:ml-64';

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-100 to-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — DigiDukaanLive brand shell */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 transform bg-brand-ink border-r border-white/10 shadow-xl shadow-black/20
          transition-transform duration-200 ease-in-out
          ${sidebarWidth}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between gap-2 px-3 py-4 border-b border-white/10">
            <Link
              to="/admin/dashboard"
              className={`flex items-center min-w-0 ${isCollapsed ? 'justify-center w-full' : 'space-x-2'}`}
            >
              {isCollapsed ? (
                <div
                  className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-900/30"
                  title="DigiDukaanLive Admin"
                >
                  <Store className="h-5 w-5 text-white" aria-hidden />
                </div>
              ) : (
                <DigiDukaanLiveLogo
                  size="sm"
                  variant="onDark"
                  showTagline={false}
                  className="min-w-0 pr-1"
                />
              )}
            </Link>
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden md:inline-flex items-center justify-center h-8 w-8 rounded-lg border border-white/15 text-white/70 hover:bg-white/10 hover:text-white touch-manipulation shrink-0"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            {mobileOpen && (
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="md:hidden inline-flex items-center justify-center h-8 w-8 rounded-lg border border-white/15 text-white/70 hover:bg-white/10 touch-manipulation shrink-0"
                aria-label="Close menu"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User info */}
          <div className="px-3 py-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-display font-bold ring-2 ring-white/20 shrink-0">
                {(user?.fullName || user?.username || 'A')
                  .toString()
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate font-display">
                    {user?.fullName || user?.username || 'Admin'}
                  </p>
                  <p className="text-xs text-white/55 truncate">{getRoleLabel(user?.role)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1.5">
            <NavLink
              to="/admin/dashboard"
              end
              className={({ isActive }) =>
                [
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white shadow-md shadow-black/25'
                    : 'text-white/85 hover:bg-white/10 hover:text-white',
                ].join(' ')
              }
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 opacity-90" />
              {!isCollapsed && <span className="truncate">Dashboard</span>}
            </NavLink>
            {visibleSections.map((section) => {
              const SectionIcon = section.icon;
              const hasItems = section.items.length > 0;
              const isExpanded = expandedSection === section.id;

              return (
                <div key={section.id}>
                  <button
                    type="button"
                    onClick={() => hasItems && handleSectionToggle(section.id)}
                    className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider ${
                      isExpanded
                        ? 'text-amber-300/95 bg-white/10'
                        : 'text-white/45 hover:text-white/75 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <SectionIcon className="w-4 h-4 shrink-0 opacity-90" />
                      {!isCollapsed && <span className="truncate">{section.label}</span>}
                    </span>
                    {!isCollapsed && hasItems && (
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 text-white/50 transform transition-transform ${
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    )}
                  </button>
                  {/* Items */}
                  {hasItems && isExpanded && (
                    <div className="mt-1 space-y-0.5 pl-1">
                      {section.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                              [
                                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                  ? 'bg-primary-600 text-white shadow-md shadow-black/25'
                                  : 'text-white/85 hover:bg-white/10 hover:text-white',
                              ].join(' ')
                            }
                          >
                            <ItemIcon className="w-4 h-4 shrink-0 opacity-90" />
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="px-3 py-3 border-t border-white/10 space-y-2">
            <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'justify-between gap-2'}`}>
              {!isCollapsed && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Menu
                </span>
              )}
              <button
                type="button"
                onClick={() => setAutoHide((prev) => !prev)}
                className={`inline-flex items-center justify-center min-h-[32px] px-2.5 rounded-lg text-[11px] font-semibold border touch-manipulation w-full ${
                  isCollapsed ? '' : 'max-w-[140px]'
                } ${
                  autoHide
                    ? 'bg-primary-600/25 text-amber-200 border-primary-500/40'
                    : 'bg-white/5 text-white/60 border-white/15 hover:bg-white/10'
                }`}
              >
                {autoHide ? 'Auto-hide on' : 'Auto-hide off'}
              </button>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full text-xs text-red-300 hover:text-white hover:bg-red-600/80 rounded-lg py-2.5 transition-colors touch-manipulation font-semibold border border-red-500/30"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className={`flex-1 flex flex-col min-h-screen ${contentMarginClass}`}>
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 touch-manipulation shrink-0"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                {title && (
                  <h1 className="text-lg sm:text-xl font-display font-bold text-gray-900 truncate">{title}</h1>
                )}
                <p className="text-xs text-gray-500 truncate">
                  <span className="text-gray-400">Signed in as</span>{' '}
                  <span className="font-medium text-gray-700">
                    {user?.fullName || user?.username || 'admin'}
                  </span>
                </p>
              </div>
            </div>
            <Link
              to="/"
              aria-label="View storefront website"
              className="inline-flex items-center gap-2 shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-primary-700 hover:bg-primary-50 hover:border-primary-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" aria-hidden />
              <span className="hidden sm:inline">View store</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <div className="w-full max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}


