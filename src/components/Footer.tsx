import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-2xl font-bold text-primary-400">
              WAINSO
            </div>
            <p className="text-gray-300 text-sm">
              Your trusted partner for professional CCTV surveillance, GPS tracking, 
              and comprehensive maintenance solutions. We provide cutting-edge technology 
              and reliable service to protect and optimize your business.
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
                <Link to="/" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Products
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

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services?category=cctv-installation" className="text-gray-300 hover:text-primary-400 transition-colors">
                  CCTV Installation
                </Link>
              </li>
              <li>
                <Link to="/services?category=gps-installation" className="text-gray-300 hover:text-primary-400 transition-colors">
                  GPS Tracking
                </Link>
              </li>
              <li>
                <Link to="/services?category=maintenance" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Maintenance Services
                </Link>
              </li>
              <li>
                <Link to="/services?category=repair" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Repair Services
                </Link>
              </li>
              <li>
                <Link to="/services?category=consultation" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary-400 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-300">
                  123 Business District,<br />
                  Mumbai, Maharashtra 400001
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-primary-400 mr-3 flex-shrink-0" />
                <span className="text-gray-300">+91 98765 43210</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-primary-400 mr-3 flex-shrink-0" />
                <span className="text-gray-300">info@wainso.com</span>
              </div>
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-primary-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-gray-300">
                  <div>Mon - Fri: 9:00 AM - 6:00 PM</div>
                  <div>Sat: 9:00 AM - 4:00 PM</div>
                  <div>Sun: Closed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 WAINSO. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/refund" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
