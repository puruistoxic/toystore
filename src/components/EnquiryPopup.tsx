import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, Send, CheckCircle, Camera, Navigation, Settings, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'wainso_enquiry_popup_shown';
const DAYS_TO_HIDE = 7; // Don't show again for 7 days

interface EnquiryPopupProps {
  onClose: () => void;
}

const EnquiryPopup: React.FC<EnquiryPopupProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.mobile.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // For local development, use localhost:3001, otherwise use the configured API URL
      const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      const API_BASE_URL = isDevelopment 
        ? 'http://localhost:3001/api'
        : (process.env.REACT_APP_API_URL || '/api');
      
      const response = await fetch(`${API_BASE_URL}/enquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          mobile: formData.mobile.trim(),
          email: formData.email.trim() || undefined,
          location: formData.location.trim() || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Enquiry submitted successfully:', data);
      
      setIsSubmitted(true);
      
      // Close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unable to submit enquiry right now. Please try again or contact us directly.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {/* Left Section - Enquiry Form */}
        <div className="flex-1 p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Send Enquiry for
          </h2>
          <h3 className="text-xl md:text-2xl font-bold text-primary-600 mb-6">
            Khandelwal Toy Store
          </h3>

          {isSubmitted ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Thank You!
              </h3>
              <p className="text-gray-600">
                We’ll get back to you soon with product suggestions and store details.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="popup-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="popup-name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label htmlFor="popup-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="popup-mobile"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+91 98998 60975"
                />
              </div>

              <div>
                <label htmlFor="popup-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email ID
                </label>
                <input
                  type="email"
                  id="popup-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="popup-location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location / City
                </label>
                <select
                  id="popup-location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select location</option>
                  <optgroup label="Ramgarh & Nearby Areas">
                    <option value="ramgarh">Ramgarh, Jharkhand</option>
                    <option value="ramgarh-cantt">Ramgarh Cantt, Jharkhand</option>
                    <option value="hazaribagh">Hazaribagh, Jharkhand</option>
                    <option value="ranchi">Ranchi, Jharkhand</option>
                    <option value="dhanbad">Dhanbad, Jharkhand</option>
                    <option value="bokaro">Bokaro, Jharkhand</option>
                  </optgroup>
                  <optgroup label="Other Cities">
                    <option value="other-jharkhand">Other City in Jharkhand</option>
                    <option value="other">Other City in India</option>
                  </optgroup>
                </select>
              </div>

              <p className="text-xs text-gray-500">
                * Indicates mandatory fields
              </p>

              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim() || !formData.mobile.trim()}
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    SEND ENQUIRY
                  </>
                )}
              </button>

              <div className="text-xs text-gray-500 space-y-1 pt-2">
                <p>• We’ll help you find the right toy for age and budget</p>
                <p>• Ask about stock, store timings, and directions</p>
                <p>• We may follow up by call or WhatsApp</p>
              </div>
            </form>
          )}
        </div>

        {/* Right Section - Promotional Content */}
        <div className="flex-1 bg-gradient-to-br from-primary-600 to-primary-800 text-white p-8 md:p-10 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Your local toy store
              </h2>
              <p className="text-primary-100 text-lg mb-6">
                Toys, games, and gifts for families nearby
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-lg mr-3">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Wide Product Range</h3>
                    <p className="text-sm text-primary-100">Toys for all ages and occasions</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-lg mr-3">
                    <Navigation className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Fair shop prices</h3>
                    <p className="text-sm text-primary-100">See labels in store; we’ll confirm on WhatsApp too</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-lg mr-3">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Pickup & local help</h3>
                    <p className="text-sm text-primary-100">Visit us or ask about delivery options nearby</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Shield className="h-5 w-5 mr-2 text-primary-200" />
                <span>Quality Assured Products</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="h-5 w-5 mr-2 text-primary-200" />
                <span>Helpful, honest service</span>
              </div>
              <Link
                to="/products"
                onClick={onClose}
                className="inline-flex items-center justify-center w-full bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors mt-4"
              >
                Browse Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook to manage popup visibility
export const useEnquiryPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupEnabled, setPopupEnabled] = useState(true);

  // Check if popup is enabled in company settings
  useEffect(() => {
    const checkPopupEnabled = async () => {
      try {
        const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
        const API_BASE_URL = isDevelopment 
          ? 'http://localhost:3001/api'
          : (process.env.REACT_APP_API_URL || '/api');
        
        // Fetch popup setting from public API endpoint
        const response = await fetch(`${API_BASE_URL}/content/company-settings/public`);
        if (response.ok) {
          const data = await response.json();
          setPopupEnabled(data.enable_enquiry_popup !== false);
          // Cache the setting for 5 minutes
          localStorage.setItem('company_settings_cache', JSON.stringify({
            enable_enquiry_popup: data.enable_enquiry_popup,
            timestamp: Date.now()
          }));
        } else {
          // If API fails, check cache
          const settingsCache = localStorage.getItem('company_settings_cache');
          if (settingsCache) {
            try {
              const cached = JSON.parse(settingsCache);
              // Use cache if less than 5 minutes old
              if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
                setPopupEnabled(cached.enable_enquiry_popup !== false);
                return;
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
          // Default to enabled if can't fetch
          setPopupEnabled(true);
        }
      } catch (error) {
        // If we can't check, try cache first
        const settingsCache = localStorage.getItem('company_settings_cache');
        if (settingsCache) {
          try {
            const cached = JSON.parse(settingsCache);
            setPopupEnabled(cached.enable_enquiry_popup !== false);
            return;
          } catch (e) {
            // Ignore parse errors
          }
        }
        // Default to enabled if error
        console.warn('Could not check popup setting, defaulting to enabled');
        setPopupEnabled(true);
      }
    };

    checkPopupEnabled();
  }, []);

  useEffect(() => {
    // Don't show if disabled
    if (!popupEnabled) {
      return;
    }

    const checkShouldShow = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          // Never shown before
          setShowPopup(true);
          return;
        }

        const { timestamp } = JSON.parse(stored);
        const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        
        if (daysSince >= DAYS_TO_HIDE) {
          // Enough days have passed, show again
          setShowPopup(true);
        }
      } catch (error) {
        // If there's an error reading storage, show the popup
        console.error('Error reading popup storage:', error);
        setShowPopup(true);
      }
    };

    // Show popup after a short delay (better UX)
    const timer = setTimeout(checkShouldShow, 1000);
    
    return () => clearTimeout(timer);
  }, [popupEnabled]);

  const handleClose = () => {
    setShowPopup(false);
    // Store that we've shown it with current timestamp
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error storing popup state:', error);
    }
  };

  return { showPopup, handleClose };
};

export default EnquiryPopup;

