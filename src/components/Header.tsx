import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Menu, X, Phone, Mail, ChevronRight, ArrowUpRight, Globe, Camera, Navigation, Wrench, Settings, Shield, Video, MapPin } from 'lucide-react';
import { services } from '../data/services';
import { products } from '../data/products';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === '/';

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Group services by primary categories
  const servicesByCategory = {
    erp: services.filter(s => s.category === 'erp'),
    networking: services.filter(s => s.category === 'networking'),
    software: services.filter(s => ['software', 'web-development'].includes(s.category)),
    amc: services.filter(s => s.category === 'amc'),
    security: services.filter(s => s.category === 'security'),
    invoicing: services.filter(s => s.category === 'invoicing-billing'),
    inventory: services.filter(s => s.category === 'inventory-management'),
    clinic: services.filter(s => s.category === 'clinic-management'),
    lab: services.filter(s => s.category === 'lab-management'),
  };

  // Group products by category
  const productsByCategory = {
    erp: products.filter(p => p.category === 'erp'),
    hardware: products.filter(p => p.category === 'hardware'),
    networking: products.filter(p => p.category === 'networking'),
    software: products.filter(p => p.category === 'software'),
    security: products.filter(p => p.category === 'security' || p.category === 'cctv'),
  };

  const navigation = [
    { 
      name: 'Home', 
      href: '/',
      hasDropdown: false
    },
    { 
      name: 'Services', 
      href: '/services',
      hasDropdown: true,
      dropdown: {
        type: 'solutions', // 3-column layout with categories, services, and industries
        categories: [
          {
            name: 'ERP & Integrations',
            icon: Settings,
            services: servicesByCategory.erp
          },
          {
            name: 'Networking & Infrastructure',
            icon: Navigation,
            services: servicesByCategory.networking
          },
          {
            name: 'Web & Software',
            icon: MessageCircle,
            services: servicesByCategory.software
          },
          {
            name: 'Managed IT & AMC',
            icon: Wrench,
            services: servicesByCategory.amc
          },
          {
            name: 'Security & Surveillance',
            icon: Camera,
            services: servicesByCategory.security
          },
          {
            name: 'Business Apps',
            icon: Shield,
            services: [...servicesByCategory.invoicing, ...servicesByCategory.inventory]
          },
          {
            name: 'Healthcare Solutions',
            icon: MapPin,
            services: [...servicesByCategory.clinic, ...servicesByCategory.lab]
          }
        ],
        industries: [
          { name: 'SMB & Mid-Market', icon: Shield, link: '/services' },
          { name: 'Retail & FMCG', icon: Navigation, link: '/services?category=inventory-management' },
          { name: 'Healthcare', icon: MapPin, link: '/services?category=clinic-management' },
          { name: 'Manufacturing', icon: Wrench, link: '/services?category=erp' }
        ]
      }
    },
    { 
      name: 'Products', 
      href: '/products',
      hasDropdown: true,
      dropdown: {
        type: 'list', // Simple 2-column list
        items: [
          { name: 'ERP & Connectors', link: '/products?category=erp' },
          { name: 'Laptops & Servers', link: '/products?category=hardware' },
          { name: 'Networking & Firewalls', link: '/products?category=networking' },
          { name: 'Software & Licenses', link: '/products?category=software' },
          { name: 'Security & CCTV Kits', link: '/products?category=security' }
        ]
      }
    },
    { 
      name: 'About', 
      href: '/about',
      hasDropdown: true,
      dropdown: {
        type: 'company', // Left: black boxes, Right: text links
        boxes: [
          {
            title: 'Who We Are',
            link: '/about'
          },
          {
            title: 'Service Areas',
            link: '/locations'
          },
          {
            title: 'Our Brands',
            link: '/brands'
          }
        ],
        links: [
          {
            title: 'Our Story',
            description: '8+ years of security solutions excellence',
            link: '/about'
          },
          {
            title: 'Industries We Serve',
            description: 'Specialized solutions for various industries',
            link: '/industries'
          },
          {
            title: 'Case Studies',
            description: 'Real success stories from our clients',
            link: '/case-studies'
          }
        ]
      }
    },
    { 
      name: 'Contact', 
      href: '/contact',
      hasDropdown: false
    },
  ];

  return (
    <>
      <header 
        className={`${isHomePage ? 'absolute' : 'sticky'} top-0 left-0 right-0 z-50 ${isHomePage ? 'bg-black/40 backdrop-blur-sm' : 'bg-white shadow-lg'}`}
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
          <div className="flex justify-between items-center py-4">
            {/* Logo with Tagline */}
            <Link to="/" className="flex flex-col group" style={{ width: '200px' }}>
              <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isHomePage ? 'text-white' : 'text-primary-600'} transition-all group-hover:scale-105 text-center`} style={{ width: '100%', letterSpacing: '0.2em' }}>
                WAINSO
              </div>
              <div className={`text-[10px] sm:text-[11px] mt-0.5 font-semibold ${isHomePage ? 'text-white' : 'text-primary-700'} transition-all text-center`} style={{ width: '100%', letterSpacing: '0.02em' }}>
                Security first. Technology fast.
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 relative">
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
                    className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                      isHomePage
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
                        className={`h-3 w-3 ml-1 transition-transform ${
                          hoveredMenu === item.name ? 'rotate-90' : ''
                        }`} 
                      />
                    )}
                  </Link>
                </div>
              ))}
            </nav>

          {/* CTA and Language Selector */}
          <div className="flex items-center space-x-4">
            <button className={`hidden md:flex items-center transition-colors ${isHomePage ? 'text-white hover:text-white/80' : 'text-gray-700 hover:text-primary-600'}`}>
              <Globe className="h-5 w-5" />
            </button>
            <Link
              to="/quote-request"
              className={`hidden md:inline-flex items-center px-4 py-2 rounded font-semibold transition-colors ${
                isHomePage
                  ? 'border border-white text-white hover:bg-white/10'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              Let's Talk
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 transition-colors ${isHomePage ? 'text-white hover:text-white/80' : 'text-gray-700 hover:text-primary-600'}`}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 rounded-lg mb-4 ${isHomePage ? 'bg-black/90 backdrop-blur-sm' : 'bg-gray-50'}`}>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isHomePage
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
              <Link
                to="/quote-request"
                className={`flex items-center justify-center px-3 py-2 rounded-md text-base font-semibold transition-colors ${
                  isHomePage
                    ? 'border border-white text-white hover:bg-white/10'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Let's Talk
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
    
    {/* Dropdown Menu - Positioned relative to viewport, starts after header */}
    {hoveredMenu && (() => {
      const item = navigation.find(i => i.name === hoveredMenu && i.hasDropdown);
      if (!item || !item.dropdown) return null;
      
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
            {/* Services Dropdown - 3 Column Layout */}
            {item.name === 'Services' && item.dropdown.type === 'solutions' && (
              <div className="grid grid-cols-3 gap-12">
                {/* Left Column - Categories (Clickable list) */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4">Services</h3>
                  <div className="space-y-0">
                    {item.dropdown.categories?.map((category, idx) => {
                      const hasServices = 'services' in category;
                      const categorySlug = hasServices && category.services.length > 0 
                        ? category.services[0].category 
                        : '';
                      return (
                        <Link
                          key={idx}
                          to={`/services?category=${categorySlug}`}
                          className="block py-2.5 text-base text-gray-700 hover:text-primary-600 transition-colors font-medium"
                        >
                          {category.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Middle Column - Services grouped by category */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4">Featured Services</h3>
                  <div className="space-y-4">
                    {item.dropdown.categories?.map((category, idx) => {
                      const hasServices = 'services' in category;
                      if (!hasServices || category.services.length === 0) return null;
                      return (
                        <div key={idx}>
                          <div className="text-sm font-bold text-gray-500 uppercase mb-2.5">
                            {category.name}
                          </div>
                          <div className="space-y-0">
                            {category.services.slice(0, 3).map((service, serviceIdx) => (
                              <Link
                                key={serviceIdx}
                                to={`/services/${service.slug}`}
                                className="block py-2 text-base text-gray-700 hover:text-primary-600 transition-colors font-medium"
                              >
                                {service.name}
                              </Link>
                            ))}
                            {category.services.length > 3 && (
                              <Link
                                to={`/services?category=${category.services[0].category}`}
                                className="block py-2 text-sm text-primary-600 font-semibold"
                              >
                                View all {category.services.length} →
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column - Industries with icons */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4">Applications</h3>
                  <div className="space-y-0">
                    {item.dropdown.industries?.map((industry, idx) => (
                      <Link
                        key={idx}
                        to={industry.link}
                        className="flex items-center space-x-2.5 py-2.5 text-base text-gray-700 hover:text-primary-600 transition-colors font-medium"
                      >
                        <industry.icon className="h-5 w-5 flex-shrink-0" />
                        <span>{industry.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Products Dropdown - Simple 2 Column List */}
            {item.name === 'Products' && item.dropdown.type === 'list' && (
              <div className="grid grid-cols-2 gap-16">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4">Products</h3>
                  <div className="space-y-0">
                    {item.dropdown.items?.map((product, idx) => (
                      <Link
                        key={idx}
                        to={product.link}
                        className="block py-2.5 text-base text-gray-700 hover:text-primary-600 transition-colors font-medium"
                      >
                        {product.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-4">Categories</h3>
                  <div className="space-y-0">
                    {/* Empty for now - can add category links if needed */}
                  </div>
                </div>
              </div>
            )}

            {/* About Dropdown - Company Style (Black boxes + Text links) */}
            {item.name === 'About' && item.dropdown.type === 'company' && (
              <div className="grid grid-cols-2 gap-12">
                {/* Left Column - Black Boxes */}
                <div className="space-y-3">
                  {item.dropdown.boxes?.map((box, idx) => (
                    <Link
                      key={idx}
                      to={box.link}
                      className="block group"
                    >
                                <div className="bg-black text-white p-6 rounded-lg hover:bg-gray-900 transition-colors relative min-h-[110px] flex flex-col">
                                  <div className="text-lg font-bold mb-auto">{box.title}</div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                          <ChevronRight className="h-5 w-5 text-black group-hover:text-white" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Right Column - Text Links */}
                <div className="space-y-5">
                  {item.dropdown.links?.map((link, idx) => (
                    <Link
                      key={idx}
                      to={link.link}
                      className="block group"
                    >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1.5">
                                      {link.title}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {link.description}
                                    </div>
                                  </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 ml-4 flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
            {/* Bottom CTA Section - Full Width */}
            <div className="bg-gray-50 border-t border-gray-200">
              <div className="px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Video className="h-4 w-4" />
                  <span>Want to talk to our experts?</span>
                  <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Schedule a call
                  </Link>
                </div>
                <Link
                  to="/quote-request"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded font-semibold hover:bg-primary-700 transition-colors"
                >
                  Let's Talk
                  <ArrowUpRight className="h-4 w-4 ml-1" />
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
