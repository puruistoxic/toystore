import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Menu, X, ChevronRight, Search, Sparkles, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import ProductSearchBar from './ProductSearchBar';
import DigiDukaanLiveLogo from './DigiDukaanLiveLogo';
import { contentApi } from '../utils/api';
import { mapDbProductToFrontend } from '../utils/catalogFromDb';
import {
  isServiceItem,
  PRODUCT_CATEGORY_FILTERS,
  productListingPathForCategory,
  resolveCategoryFilterId,
} from '../utils/productCategoryFilters';
import type { Product } from '../types/catalog';

const MEGA_MENU_PREVIEW = 8;

type ProductWithCategoryFilter = Product & { categoryFilterId: string | null };

const Header: React.FC = () => {
  const { totalItems: cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [megaHoveredCategoryId, setMegaHoveredCategoryId] = useState<string | null>(null);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  const closeMegaMenu = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredMenu(null);
  }, []);

  useEffect(() => {
    closeMegaMenu();
  }, [location.pathname, location.search, closeMegaMenu]);

  const { data: dbProducts = [] } = useQuery({
    queryKey: ['products', 'public'],
    queryFn: async () => {
      const response = await contentApi.getProducts({ is_active: true });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const productsWithCategory: ProductWithCategoryFilter[] = useMemo(() => {
    return (dbProducts as any[])
      .filter((p) => !isServiceItem(p))
      .map((db) => {
        const m = mapDbProductToFrontend(db);
        const categoryFilterId = resolveCategoryFilterId(String(db.category || ''));
        return { ...m, categoryFilterId };
      });
  }, [dbProducts]);

  const visibleCategoryFilters = useMemo(() => {
    const ids = new Set(
      productsWithCategory.map((p) => p.categoryFilterId).filter(Boolean) as string[],
    );
    return PRODUCT_CATEGORY_FILTERS.filter((c) => ids.has(c.id));
  }, [productsWithCategory]);

  const productsByCategoryId = useMemo(() => {
    const map = new Map<string, ProductWithCategoryFilter[]>();
    for (const p of productsWithCategory) {
      if (!p.categoryFilterId) continue;
      const list = map.get(p.categoryFilterId) || [];
      list.push(p);
      map.set(p.categoryFilterId, list);
    }
    return map;
  }, [productsWithCategory]);

  useEffect(() => {
    if (hoveredMenu !== 'All Categories' || visibleCategoryFilters.length === 0) {
      return;
    }
    setMegaHoveredCategoryId((prev) => {
      if (prev && visibleCategoryFilters.some((c) => c.id === prev)) return prev;
      return visibleCategoryFilters[0].id;
    });
  }, [hoveredMenu, visibleCategoryFilters]);
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    const pathOnly = path.split('?')[0];
    if (pathOnly === '/products') {
      return (
        location.pathname === '/products' || location.pathname.startsWith('/products/category/')
      );
    }
    return location.pathname === pathOnly;
  };
  const isHomePage = location.pathname === '/';

  // Smart sticky header - detect scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking on search icon or search bar
      if (target.closest('.search-container') || target.closest('button[aria-label="Search products"]')) {
        return;
      }
      setIsSearchOpen(false);
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isMenuOpen) setMobileCategoriesOpen(false);
  }, [isMenuOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const navigation = [
    { 
      name: 'Home', 
      href: '/',
      hasDropdown: false
    },
    {
      name: 'All Categories',
      href: '/products',
      hasDropdown: true,
    },
    {
      name: 'Product Finder',
      href: '/toy-finder',
      hasDropdown: false,
    },
  ];

  return (
    <>
      <header 
        className={`${isHomePage && !isScrolled ? 'absolute' : 'sticky'} top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isHomePage && !isScrolled
            ? 'bg-brand-ink/50 backdrop-blur-md'
            : 'bg-white shadow-lg'
        }`}
        onMouseLeave={(e) => {
          // Only close if we're not moving to the dropdown
          // Check if the related target is not within the dropdown
          const relatedTarget = e.relatedTarget;
          if (!relatedTarget || !(relatedTarget instanceof HTMLElement) || !relatedTarget.closest('.dropdown-container')) {
            hoverTimeoutRef.current = setTimeout(() => {
              setHoveredMenu(null);
            }, 200);
          }
        }}
      >
        {/* Main Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-[110] flex justify-between items-center py-3 md:py-4 isolate">
            {/* Logo — DigiDukaanLive */}
            <Link
              to="/"
              onClick={closeMegaMenu}
              className="group flex-shrink-0 min-w-0 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md"
            >
              <DigiDukaanLiveLogo size="md" />
            </Link>

            {/* Desktop Navigation - Center */}
            <nav className="hidden md:flex items-center space-x-5 lg:space-x-8 relative flex-1 justify-center">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => {
                    if (hoverTimeoutRef.current) {
                      clearTimeout(hoverTimeoutRef.current);
                      hoverTimeoutRef.current = null;
                    }
                    if (item.hasDropdown) {
                      setHoveredMenu(item.name);
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Only start timeout if not moving to dropdown
                    const relatedTarget = e.relatedTarget;
                    if (!relatedTarget || !(relatedTarget instanceof HTMLElement) || !relatedTarget.closest('.dropdown-container')) {
                      hoverTimeoutRef.current = setTimeout(() => {
                        setHoveredMenu(null);
                      }, 200);
                    }
                  }}
                >
                  <Link
                    to={item.href}
                    onClick={closeMegaMenu}
                    className={`flex items-center px-3 py-2 text-lg lg:text-xl font-display font-semibold transition-colors ${
                      isHomePage && !isScrolled
                        ? isActive(item.href)
                          ? 'text-white'
                          : 'text-white/90 hover:text-white'
                        : isActive(item.href)
                        ? 'text-primary-600'
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    {item.name}
                    {item.hasDropdown && (
                      <ChevronRight 
                        className={`h-4 w-4 ml-1 transition-transform ${
                          hoveredMenu === item.name ? 'rotate-90' : ''
                        }`} 
                      />
                    )}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Search — pill button (clear target + brand trim) */}
            <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
              <Link
                to="/cart"
                onClick={(e) => {
                  e.stopPropagation();
                  closeMegaMenu();
                }}
                className={`relative z-[120] touch-manipulation inline-flex items-center justify-center rounded-full p-2.5 min-h-[44px] min-w-[44px] border-2 shadow-md transition-all font-display ${
                  isHomePage && !isScrolled
                    ? 'bg-white/20 text-white border-brand-sunshine/90 hover:bg-white/30'
                    : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50 hover:border-primary-400'
                }`}
                aria-label={`Order request list${cartCount > 0 ? `, ${cartCount} items` : ''}`}
              >
                <ShoppingCart className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-primary-600 text-white text-[10px] font-bold leading-none border-2 border-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`hidden md:inline-flex items-center justify-center gap-2 rounded-full px-3.5 sm:px-4 py-2.5 min-h-[44px] border-2 shadow-md transition-all font-display text-sm font-semibold ${
                  isHomePage && !isScrolled
                    ? isSearchOpen
                      ? 'bg-white/25 text-white border-brand-sunshine shadow-lg ring-2 ring-brand-sunshine/40'
                      : 'bg-white/20 text-white border-brand-sunshine/90 hover:bg-white/30 hover:border-brand-sunshine hover:shadow-lg'
                    : isSearchOpen
                    ? 'bg-primary-50 text-primary-700 border-primary-500 shadow-inner'
                    : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50 hover:border-primary-400'
                }`}
                aria-label={isSearchOpen ? 'Close search' : 'Search products'}
                aria-expanded={isSearchOpen}
              >
                <Search className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden />
                <span className="hidden lg:inline pr-0.5">Search</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`md:hidden p-2 transition-colors ${
                  isHomePage && !isScrolled ? 'text-white hover:text-white/80' : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Search Bar - Expandable (Desktop) */}
          {isSearchOpen && (
            <div className="hidden md:block pb-3 search-container">
              <ProductSearchBar 
                isHomePage={isHomePage && !isScrolled}
                className="w-full"
                onProductSelect={() => setIsSearchOpen(false)}
              />
            </div>
          )}

          {/* Search Bar - Mobile */}
          <div className="md:hidden pb-3">
            <ProductSearchBar 
              isHomePage={isHomePage && !isScrolled}
              className="w-full"
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 rounded-lg mb-4 ${
              isHomePage && !isScrolled ? 'bg-brand-ink/95 backdrop-blur-sm' : 'bg-gray-50'
            }`}>
              <Link
                to="/cart"
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-lg font-display font-semibold transition-colors ${
                  isHomePage && !isScrolled
                    ? 'text-white bg-white/10 hover:bg-white/15'
                    : 'text-primary-700 bg-primary-50 hover:bg-primary-100'
                }`}
                onClick={() => {
                  setIsMenuOpen(false);
                  closeMegaMenu();
                }}
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 shrink-0" aria-hidden />
                  My order list
                </span>
                {cartCount > 0 && (
                  <span className="text-sm font-bold tabular-nums min-w-[1.5rem] text-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              {navigation.map((item) => {
                if (item.name === 'All Categories' && item.hasDropdown) {
                  return (
                    <div key={item.name}>
                      <button
                        type="button"
                        className={`flex w-full items-center justify-between px-3 py-2.5 rounded-md text-lg font-display font-semibold transition-colors ${
                          isHomePage && !isScrolled
                            ? 'text-white/90 hover:text-white hover:bg-white/5'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                        }`}
                        onClick={() => setMobileCategoriesOpen((o) => !o)}
                        aria-expanded={mobileCategoriesOpen}
                      >
                        <span className="flex items-center">
                          {item.name}
                          <ChevronRight
                            className={`h-4 w-4 ml-1 transition-transform ${mobileCategoriesOpen ? 'rotate-90' : ''}`}
                          />
                        </span>
                      </button>
                      {mobileCategoriesOpen && (
                        <div className="mt-1 mb-2 space-y-0.5 border-l-2 border-primary-500/40 ml-3 pl-3">
                          <Link
                            to="/products"
                            className={`block py-2 text-base font-medium ${
                              isHomePage && !isScrolled
                                ? 'text-white/85 hover:text-white'
                                : 'text-gray-600 hover:text-primary-600'
                            }`}
                            onClick={() => {
                              setIsMenuOpen(false);
                              setMobileCategoriesOpen(false);
                              closeMegaMenu();
                            }}
                          >
                            Browse all products
                          </Link>
                          {visibleCategoryFilters.map((c) => (
                            <Link
                              key={c.id}
                              to={productListingPathForCategory(c.id)}
                              className={`block py-2 text-base font-medium ${
                                isHomePage && !isScrolled
                                  ? 'text-white/85 hover:text-white'
                                  : 'text-gray-600 hover:text-primary-600'
                              }`}
                              onClick={() => {
                                setIsMenuOpen(false);
                                setMobileCategoriesOpen(false);
                                closeMegaMenu();
                              }}
                            >
                              {c.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2.5 rounded-md text-lg font-display font-semibold transition-colors ${
                      isHomePage && !isScrolled
                        ? isActive(item.href)
                          ? 'text-white bg-white/10'
                          : 'text-white/90 hover:text-white hover:bg-white/5'
                        : isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      closeMegaMenu();
                    }}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>
    
    {/* Dropdown Menu - Positioned relative to viewport, starts after header */}
    {hoveredMenu &&
      (() => {
        const item = navigation.find((i) => i.name === hoveredMenu && i.hasDropdown);
        if (!item || item.name !== 'All Categories') return null;

        const previewList =
          megaHoveredCategoryId != null
            ? (productsByCategoryId.get(megaHoveredCategoryId) || []).slice(0, MEGA_MENU_PREVIEW)
            : [];
        const totalInCategory =
          megaHoveredCategoryId != null
            ? productsByCategoryId.get(megaHoveredCategoryId)?.length ?? 0
            : 0;

        return (
          <div
            className="dropdown-container fixed left-1/2 -translate-x-1/2 w-full max-w-7xl z-40"
            style={{ top: '73px' }}
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
              setHoveredMenu(hoveredMenu);
            }}
            onMouseLeave={() => {
              hoverTimeoutRef.current = setTimeout(() => {
                setHoveredMenu(null);
              }, 200);
            }}
          >
            {/* Narrow hover bridge under nav (left) only — full-width bridge sat over the cart and stole clicks */}
            <div className="h-12 -mt-12 w-full flex justify-start pointer-events-none">
              <div
                className="h-full max-w-[min(42vw,300px)] min-w-[160px] pointer-events-auto bg-transparent"
                onMouseEnter={() => {
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = null;
                  }
                  setHoveredMenu(hoveredMenu);
                }}
              />
            </div>
            <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
              <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6">
                {visibleCategoryFilters.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">
                    Categories will appear here once products are listed.{' '}
                    <Link
                      to="/products"
                      onClick={closeMegaMenu}
                      className="text-primary-600 font-semibold hover:text-primary-700"
                    >
                      View catalogue
                    </Link>
                  </p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                    <div className="lg:col-span-3 border-r border-gray-100 lg:pr-6">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">
                        Product categories
                      </h3>
                      <ul className="space-y-0 max-h-[min(420px,70vh)] overflow-y-auto">
                        {visibleCategoryFilters.map((c) => {
                          const active = megaHoveredCategoryId === c.id;
                          return (
                            <li key={c.id}>
                              <Link
                                to={productListingPathForCategory(c.id)}
                                onClick={closeMegaMenu}
                                className={`block py-2.5 pl-2 -ml-2 rounded-md text-base font-medium transition-colors border-l-4 ${
                                  active
                                    ? 'text-primary-600 border-primary-500 bg-primary-50/80'
                                    : 'text-gray-700 border-transparent hover:text-primary-600 hover:bg-gray-50'
                                }`}
                                onMouseEnter={() => setMegaHoveredCategoryId(c.id)}
                                onFocus={() => setMegaHoveredCategoryId(c.id)}
                              >
                                {c.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="lg:col-span-6 min-h-[200px]">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">
                        {megaHoveredCategoryId
                          ? visibleCategoryFilters.find((c) => c.id === megaHoveredCategoryId)?.name ||
                            'Products'
                          : 'Products'}
                      </h3>
                      {previewList.length === 0 ? (
                        <p className="text-gray-500 text-sm py-6">No products in this category.</p>
                      ) : (
                        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {previewList.map((product) => (
                            <li key={product.id}>
                              <Link
                                to={`/products/${product.slug}`}
                                onClick={closeMegaMenu}
                                className="group block rounded-lg border border-gray-100 overflow-hidden bg-gray-50/80 hover:border-primary-200 hover:shadow-sm transition-all"
                              >
                                <div className="aspect-square bg-white flex items-center justify-center p-2">
                                  <img
                                    src={product.images[0]}
                                    alt=""
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                                <div className="p-2">
                                  <p className="text-xs font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600">
                                    {product.name}
                                  </p>
                                  {product.price > 0 && (
                                    <p className="text-xs text-primary-600 font-bold mt-1">
                                      ₹{product.price.toLocaleString('en-IN')}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                      {megaHoveredCategoryId && totalInCategory > 0 && (
                        <div className="mt-4">
                          <Link
                            to={productListingPathForCategory(megaHoveredCategoryId)}
                            onClick={closeMegaMenu}
                            className="inline-flex items-center gap-0.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
                          >
                            View all in category
                            {totalInCategory > MEGA_MENU_PREVIEW
                              ? ` (${totalInCategory})`
                              : ''}
                            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6 pt-6 lg:pt-0">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-3">
                        Quick links
                      </h3>
                      <div className="space-y-0">
                        <Link
                          to="/toy-finder"
                          onClick={closeMegaMenu}
                          className="flex items-center gap-2 py-2.5 text-base text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                          <Sparkles className="h-4 w-4 shrink-0 text-primary-500" />
                          Product Finder
                        </Link>
                        <Link
                          to={productListingPathForCategory('educational-learning')}
                          onClick={closeMegaMenu}
                          className="block py-2.5 text-base text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                          Educational toys
                        </Link>
                        <Link
                          to="/contact"
                          onClick={closeMegaMenu}
                          className="block py-2.5 text-base text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                          Visit our store
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 border-t border-gray-200">
                <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-gray-700">
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span>Need help finding the right product?</span>
                  <Link
                    to="/toy-finder"
                    onClick={closeMegaMenu}
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Try our finder
                  </Link>
                  <span className="text-gray-400 hidden sm:inline">·</span>
                  <Link
                    to="/contact"
                    onClick={closeMegaMenu}
                    className="text-gray-600 hover:text-primary-600 font-medium"
                  >
                    Contact us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};

export default Header;
