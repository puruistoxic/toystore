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
  Users,
  Receipt,
  FileCheck,
  UserCog
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
}

const menuSections: MenuSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        to: '/admin/dashboard'
      }
    ]
  },
  {
    id: 'masters',
    label: 'Masters',
    icon: Settings,
    items: [
      { label: 'Countries', icon: MapPin, to: '/admin/countries' },
      { label: 'States', icon: MapPin, to: '/admin/states' },
      { label: 'Localities', icon: MapPin, to: '/admin/localities' },
      { label: 'Categories', icon: Package, to: '/admin/categories' },
      { label: 'Brands', icon: Award, to: '/admin/brands' }
    ]
  },
  {
    id: 'content',
    label: 'Content',
    icon: Package,
    items: [
      { label: 'Services', icon: Package, to: '/admin/services' },
      { label: 'Products', icon: ShoppingBag, to: '/admin/products' },
      { label: 'Locations', icon: MapPin, to: '/admin/locations' },
      { label: 'Industries', icon: Building2, to: '/admin/industries' },
      { label: 'Case Studies', icon: FileText, to: '/admin/case-studies' },
      { label: 'Testimonials', icon: MessageSquare, to: '/admin/testimonials' }
    ]
  },
  {
    id: 'invoicing',
    label: 'Invoicing',
    icon: Receipt,
    items: [
      { label: 'Clients', icon: Users, to: '/admin/clients' },
      { label: 'Proposals', icon: FileCheck, to: '/admin/proposals' },
      { label: 'Invoices', icon: Receipt, to: '/admin/invoices' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    items: [
      { label: 'Company Settings', icon: Building2, to: '/admin/company-settings' },
      { label: 'Users', icon: UserCog, to: '/admin/users' },
      { label: 'Audit Logs', icon: FileText, to: '/admin/audit-logs' }
    ]
  }
];

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

  // Determine which section should be expanded based on current route
  const initialExpandedSection = useMemo(() => {
    for (const section of menuSections) {
      if (section.items.some((item) => location.pathname.startsWith(item.to))) {
        return section.id;
      }
    }
    return 'overview';
  }, [location.pathname]);

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
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 transform bg-white border-r border-gray-200
          transition-transform duration-200 ease-in-out
          ${sidebarWidth}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-3 py-4 border-b border-gray-100">
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">WA</span>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">WAINSO Admin</span>
                  <span className="text-xs text-gray-500">Content Manager</span>
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden md:inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 touch-manipulation"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            {mobileOpen && (
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="md:hidden inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 touch-manipulation"
                aria-label="Close menu"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User info */}
          <div className="px-3 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                {(user?.fullName || user?.username || 'A')
                  .toString()
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.fullName || user?.username || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'Logged in as admin'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-2">
            {menuSections.map((section) => {
              const SectionIcon = section.icon;
              const hasItems = section.items.length > 0;
              const isExpanded = expandedSection === section.id || (!hasItems && section.id === 'overview');

              return (
                <div key={section.id}>
                  <button
                    type="button"
                    onClick={() => hasItems && handleSectionToggle(section.id)}
                    className={`flex items-center justify-between w-full px-2 py-2 rounded-md text-xs font-semibold uppercase tracking-wide ${
                      isExpanded
                        ? 'text-teal-700 bg-teal-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <SectionIcon className="w-4 h-4" />
                      {!isCollapsed && <span>{section.label}</span>}
                    </span>
                    {!isCollapsed && hasItems && (
                      <ChevronDown
                        className={`w-4 h-4 transform transition-transform ${
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    )}
                  </button>
                  {/* Items */}
                  {hasItems && isExpanded && (
                    <div className="mt-1 space-y-1">
                      {section.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                              [
                                'flex items-center px-3 py-2 rounded-md text-sm font-medium',
                                isActive
                                  ? 'bg-teal-600 text-white shadow-sm'
                                  : 'text-gray-700 hover:bg-gray-100'
                              ].join(' ')
                            }
                          >
                            <ItemIcon className="w-4 h-4 mr-2" />
                            {!isCollapsed && <span>{item.label}</span>}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar footer with settings / auto-hide toggle */}
          <div className="px-3 py-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              {!isCollapsed && (
                <span className="text-xs font-medium text-gray-500 flex items-center space-x-1">
                  <Settings className="w-3 h-3" />
                  <span>Sidebar</span>
                </span>
              )}
            <button
              type="button"
              onClick={() => setAutoHide((prev) => !prev)}
              className={`flex items-center justify-center h-8 px-3 rounded-full text-xs font-medium border touch-manipulation ${
                autoHide
                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              {autoHide ? 'Auto-hide: On' : 'Auto-hide: Off'}
            </button>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md py-2.5 transition-colors touch-manipulation font-medium"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className={`flex-1 flex flex-col min-h-screen ${contentMarginClass}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 touch-manipulation"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
                <p className="text-xs text-gray-500">
                  Logged in as <span className="font-medium">{user?.fullName || user?.username || 'admin'}</span>
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium hidden sm:inline"
            >
              View website
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}


