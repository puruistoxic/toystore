import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import DigiDukaanLiveLogo from './DigiDukaanLiveLogo';
import { productListingPathForCategory } from '../utils/productCategoryFilters';

const FOOTER_EMAIL = 'shop@digidukaanlive.com';
const FOOTER_EMAIL_DISPLAY = 'shop@DigiDukaanLive.com';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-ink text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="w-full max-w-md min-w-0">
              <DigiDukaanLiveLogo size="footer" variant="onDark" />
            </div>
            <p className="text-gray-300 text-sm">
              Your neighbourhood store for quality products and gifts. We help families find
              age-right picks, party favours, and festival surprises — visit us in person or reach out
              on WhatsApp for stock and directions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/toy-finder" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Product Finder
                </Link>
              </li>
              <li>
                <Link to="/brands" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Our Brands
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={productListingPathForCategory('action-figures')} className="text-gray-300 hover:text-primary-400 transition-colors">
                  Action Figures
                </Link>
              </li>
              <li>
                <Link to={productListingPathForCategory('art-crafts')} className="text-gray-300 hover:text-primary-400 transition-colors">
                  Art & Crafts
                </Link>
              </li>
              <li>
                <Link to={productListingPathForCategory('educational-learning')} className="text-gray-300 hover:text-primary-400 transition-colors">
                  Educational Toys
                </Link>
              </li>
              <li>
                <Link to={productListingPathForCategory('remote-control')} className="text-gray-300 hover:text-primary-400 transition-colors">
                  Remote Control Toys
                </Link>
              </li>
              <li>
                <Link to={productListingPathForCategory('board-games')} className="text-gray-300 hover:text-primary-400 transition-colors">
                  Board Games
                </Link>
              </li>
              <li>
                <Link to={productListingPathForCategory('dolls')} className="text-gray-300 hover:text-primary-400 transition-colors">
                  Dolls & Doll Houses
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-primary-400 mr-3 flex-shrink-0" />
                <div className="text-gray-300">
                  <div>+91 88515 77973</div>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-primary-400 mr-3 flex-shrink-0" />
                <a
                  href={`mailto:${FOOTER_EMAIL}`}
                  className="text-gray-300 hover:text-primary-400 transition-colors break-all"
                >
                  {FOOTER_EMAIL_DISPLAY}
                </a>
              </div>
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-primary-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-gray-300">
                  <div>All day open: 9:00 AM - 9:00 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              <p>
                © {year} DigiDukaanLive. All rights reserved.
              </p>
              <p className="mt-1 text-xs">Local & online retail | Walk-in welcome</p>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/refund" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Refund &amp; exchange
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
