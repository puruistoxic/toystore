import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Menu, X, Phone, Mail, ChevronDown, ArrowUpRight, Globe } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Products', href: '/products' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === '/';

  return (
    <header className={`${isHomePage ? 'absolute' : 'sticky'} top-0 left-0 right-0 z-50 ${isHomePage ? 'bg-black/40 backdrop-blur-sm' : 'bg-white shadow-lg'}`}>
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo with Tagline */}
          <Link to="/" className="flex flex-col">
            <div className={`text-xl sm:text-2xl font-bold ${isHomePage ? 'text-white' : 'text-primary-600'}`}>
              WAINSO
            </div>
            <div className={`text-[10px] sm:text-xs mt-0.5 ${isHomePage ? 'text-white/80' : 'text-gray-600'}`}>
              Security first. Technology fast.
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
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
                <ChevronDown className="h-4 w-4 ml-1" />
              </Link>
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
                  <ChevronDown className="h-4 w-4 ml-1" />
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
  );
};

export default Header;
