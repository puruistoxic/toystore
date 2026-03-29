import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Menu, X, ChevronRight, Search } from 'lucide-react';
import ProductSearchBar from './ProductSearchBar';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  
  // Refs for logo text width matching
  const topTextRef = useRef<HTMLDivElement>(null);
  const bottomTextRef = useRef<HTMLDivElement>(null);
  const [bottomTextFontSize, setBottomTextFontSize] = useState<string>('10px');

  const isActive = (path: string) => location.pathname === path;
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Calculate bottom text font size to match top text width
  useEffect(() => {
    const calculateFontSize = () => {
      if (topTextRef.current && bottomTextRef.current) {
        const topWidth = topTextRef.current.offsetWidth;
        
        if (topWidth > 0) {
          // Start with a base font size
          let fontSize = 10; // Base font size in px
          const maxFontSize = 16; // Maximum font size to prevent it from getting too large
          
          // Create a temporary span to measure text width at different font sizes
          const tempSpan = document.createElement('span');
          tempSpan.style.visibility = 'hidden';
          tempSpan.style.position = 'absolute';
          tempSpan.style.whiteSpace = 'nowrap';
          tempSpan.style.fontWeight = '600';
          tempSpan.style.letterSpacing = '0.02em';
          tempSpan.textContent = 'Toy Store | Imagination Unboxed';
          tempSpan.style.fontFamily = window.getComputedStyle(bottomTextRef.current).fontFamily;
          document.body.appendChild(tempSpan);
          
          // Binary search to find the right font size
          let minSize = 8;
          let maxSize = maxFontSize;
          let bestSize = fontSize;
          
          while (minSize <= maxSize) {
            const testSize = (minSize + maxSize) / 2;
            tempSpan.style.fontSize = `${testSize}px`;
            const testWidth = tempSpan.offsetWidth;
            
            if (testWidth <= topWidth) {
              bestSize = testSize;
              minSize = testSize + 0.1;
            } else {
              maxSize = testSize - 0.1;
            }
          }
          
          document.body.removeChild(tempSpan);
          
          // Apply responsive scaling
          const isMobile = window.innerWidth < 640;
          const isTablet = window.innerWidth >= 640 && window.innerWidth < 768;
          
          if (isMobile) {
            setBottomTextFontSize(`${bestSize}px`);
          } else if (isTablet) {
            setBottomTextFontSize(`${Math.min(bestSize * 1.1, maxFontSize)}px`);
          } else {
            setBottomTextFontSize(`${Math.min(bestSize * 1.2, maxFontSize)}px`);
          }
        }
      }
    };

    // Calculate on mount and window resize
    calculateFontSize();
    window.addEventListener('resize', calculateFontSize);
    
    // Also recalculate after fonts are loaded
    const timeoutId = setTimeout(calculateFontSize, 100);
    const timeoutId2 = setTimeout(calculateFontSize, 500); // Second check after fonts fully load
    
    return () => {
      window.removeEventListener('resize', calculateFontSize);
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
    };
  }, [location.pathname]); // Recalculate when route changes (in case styles change)

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
      dropdown: {
        type: 'list', // Simple 2-column list
        items: [
          { name: 'Action Figures', link: '/products?category=action-figures' },
          { name: 'Art & Crafts', link: '/products?category=art-crafts' },
          { name: 'Baby Rattles', link: '/products?category=baby-rattles' },
          { name: 'Bath Toys', link: '/products?category=bath-toys' },
          { name: 'Board Games', link: '/products?category=board-games' },
          { name: 'Coin Bank', link: '/products?category=coin-bank' },
          { name: 'Dolls & Doll Houses', link: '/products?category=dolls' },
          { name: 'Drone', link: '/products?category=drone' },
          { name: 'Educational & Learning', link: '/products?category=educational-learning' },
          { name: 'Electric Ride Ons', link: '/products?category=electric-ride-ons' },
          { name: 'Manual Ride Ons', link: '/products?category=manual-ride-ons' },
          { name: 'Musical Toys', link: '/products?category=musical-toys' },
          { name: 'Remote Control Toys', link: '/products?category=remote-control' },
          { name: 'Role Play Set', link: '/products?category=role-play' }
        ]
      }
    },
    { 
      name: 'New Arrival', 
      href: '/products?filter=new-arrival',
      hasDropdown: false
    },
    { 
      name: 'Best Seller', 
      href: '/products?filter=best-seller',
      hasDropdown: false
    },
  ];

  return (
    <>
      <header 
        className={`${isHomePage && !isScrolled ? 'absolute' : 'sticky'} top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isHomePage && !isScrolled
            ? 'bg-black/40 backdrop-blur-sm'
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
          <div className="flex justify-between items-center py-3 md:py-4">
            {/* Logo with Tagline - Left */}
            <Link to="/" className="flex flex-col group flex-shrink-0" style={{ width: '200px' }}>
              <div 
                ref={topTextRef}
                className={`text-2xl sm:text-3xl md:text-4xl font-bold transition-all group-hover:scale-105 text-center ${
                  isHomePage && !isScrolled ? 'text-white' : 'text-primary-600'
                }`} 
                style={{ width: '100%', letterSpacing: '0.05em' }}
              >
                Khandelwal
              </div>
              <div 
                ref={bottomTextRef}
                className={`mt-0.5 font-semibold transition-all text-center whitespace-nowrap ${
                  isHomePage && !isScrolled ? 'text-white' : 'text-primary-700'
                }`} 
                style={{ 
                  width: '100%', 
                  letterSpacing: '0.02em',
                  fontSize: bottomTextFontSize
                }}
              >
                Toy Store | Imagination Unboxed
              </div>
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
                    className={`flex items-center px-3 py-2 text-lg lg:text-xl font-semibold transition-colors ${
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

            {/* Search Icon - Right */}
            <div className="flex items-center space-x-4">
              {/* Search Icon Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`hidden md:flex items-center justify-center w-11 h-11 rounded-full transition-all ${
                  isHomePage && !isScrolled
                    ? isSearchOpen 
                      ? 'bg-white/20 text-white'
                      : 'text-white hover:bg-white/20'
                    : isSearchOpen
                    ? 'bg-gray-100 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                }`}
                aria-label="Search products"
              >
                <Search className="h-6 w-6" />
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
              isHomePage && !isScrolled ? 'bg-black/90 backdrop-blur-sm' : 'bg-gray-50'
            }`}>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-md text-lg font-semibold transition-colors ${
                    isHomePage && !isScrolled
                      ? isActive(item.href)
                        ? 'text-white bg-white/10'
                        : 'text-white/90 hover:text-white hover:bg-white/5'
                      : isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                  {item.hasDropdown && (
                    <ChevronRight className="h-4 w-4 ml-1 rotate-90" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    
    {/* Dropdown Menu - Positioned relative to viewport, starts after header */}
    {hoveredMenu && (() => {
      const item = navigation.find(i => i.name === hoveredMenu && i.hasDropdown);
      if (!item?.dropdown) return null;
      
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
          {/* Transparent bridge area that extends upward to catch mouse movement */}
          <div 
            className="h-12 -mt-12 bg-transparent pointer-events-auto"
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
              setHoveredMenu(hoveredMenu);
            }}
          ></div>
          {/* Dropdown content */}
          <div className="bg-white" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <div className="px-4 sm:px-6 lg:px-8 pt-10 pb-6">
            {/* All Categories Dropdown - Simple 2 Column List */}
            {item && item.name === 'All Categories' && item.dropdown && item.dropdown.type === 'list' && (
              <div className="grid grid-cols-2 gap-16">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Toy Categories</h3>
                  <div className="space-y-0">
                    {item.dropdown.items?.map((category: { name: string; link: string }, idx: number) => (
                      <Link
                        key={idx}
                        to={category.link}
                        className="block py-2.5 text-lg text-gray-700 hover:text-primary-600 transition-colors font-medium"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
                  <div className="space-y-0">
                    <Link
                      to="/products?filter=new-arrival"
                      className="block py-2.5 text-lg text-gray-700 hover:text-primary-600 transition-colors font-medium"
                    >
                      New Arrivals
                    </Link>
                    <Link
                      to="/products?filter=best-seller"
                      className="block py-2.5 text-lg text-gray-700 hover:text-primary-600 transition-colors font-medium"
                    >
                      Best Sellers
                    </Link>
                    <Link
                      to="/products?filter=educational"
                      className="block py-2.5 text-lg text-gray-700 hover:text-primary-600 transition-colors font-medium"
                    >
                      Educational Toys
                    </Link>
                    <Link
                      to="/products?filter=bulk-discount"
                      className="block py-2.5 text-lg text-gray-700 hover:text-primary-600 transition-colors font-medium"
                    >
                      Bulk Discounts
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          
            {/* Bottom CTA Section - Full Width */}
            <div className="bg-gray-50 border-t border-gray-200">
              <div className="px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <MessageCircle className="h-4 w-4" />
                  <span>Need help finding the right toys?</span>
                  <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Contact us
                  </Link>
                </div>
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
