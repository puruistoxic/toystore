import React, { useState, useEffect, useCallback } from 'react';
import { X, Send, CheckCircle, LayoutGrid, Tag, MapPin, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'digidukaanlive_enquiry_popup_shown';
/** Legacy key — still read so frequent visitors aren’t nagged after deploy */
const STORAGE_KEY_LEGACY = 'wainso_enquiry_popup_shown';
const DAYS_TO_HIDE = 7;

function readPopupDismissed(): string | null {
  return localStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY_LEGACY);
}

interface EnquiryPopupProps {
  onClose: () => void;
}

const EnquiryPopup: React.FC<EnquiryPopupProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.mobile.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const isDevelopment =
        process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      const API_BASE_URL = isDevelopment
        ? 'http://localhost:3001/api'
        : process.env.REACT_APP_API_URL || '/api';

      const response = await fetch(`${API_BASE_URL}/enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          mobile: formData.mobile.trim(),
          email: formData.email.trim() || undefined,
          message: formData.message.trim() || undefined,
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
      setTimeout(() => onClose(), 2200);
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to submit enquiry right now. Please try again or contact us directly.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/90 text-gray-900 placeholder:text-gray-400 ' +
    'transition-all duration-200 focus:bg-white focus:border-brand-ink focus:ring-4 focus:ring-brand-ink/15 focus:outline-none';

  const textareaClass =
    inputClass + ' min-h-[120px] resize-y py-3 leading-relaxed';

  const stopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/55 backdrop-blur-[6px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-popup-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[min(1180px,calc(100vw-1.5rem))] max-h-[min(90vh,780px)] overflow-hidden flex flex-col rounded-3xl bg-white shadow-[0_25px_80px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 md:flex-row md:items-stretch"
        onClick={stopPropagation}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-md ring-1 ring-gray-200/80 transition hover:bg-gray-50 hover:text-gray-900 md:top-4 md:right-4"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>

        {/* Form */}
        <div className="flex flex-1 flex-col overflow-y-auto border-b border-gray-100 md:border-b-0 md:border-r md:border-gray-100">
          <div className="p-6 sm:p-8 lg:p-10 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink mb-2">
              DigiDukaanLive
            </p>
            <h2
              id="enquiry-popup-title"
              className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight"
            >
              Quick enquiry
            </h2>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-md">
              Share your details and we’ll get back with availability, pricing hints, and how to visit or order.
            </p>
          </div>

          <div className="px-6 sm:px-8 lg:px-10 pb-8 flex-1">
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle className="h-9 w-9 text-emerald-600" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Thanks — you’re all set</h3>
                <p className="mt-2 max-w-sm text-sm text-gray-600 leading-relaxed">
                  We’ll reach out soon with product suggestions and store details.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="popup-name" className="mb-1.5 block text-sm font-medium text-gray-800">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="popup-name"
                    name="name"
                    required
                    autoComplete="name"
                    autoFocus
                    value={formData.name}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="popup-mobile" className="mb-1.5 block text-sm font-medium text-gray-800">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="popup-mobile"
                    name="mobile"
                    required
                    autoComplete="tel"
                    inputMode="numeric"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Your mobile number"
                  />
                </div>

                <div>
                  <label htmlFor="popup-email" className="mb-1.5 block text-sm font-medium text-gray-800">
                    Email <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    id="popup-email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="popup-message" className="mb-1.5 block text-sm font-medium text-gray-800">
                    Your query <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="popup-message"
                    name="message"
                    rows={4}
                    maxLength={2000}
                    value={formData.message}
                    onChange={handleInputChange}
                    className={textareaClass}
                    placeholder="What would you like to know? e.g. product availability, delivery, or visit timings."
                  />
                  <p className="mt-1 text-xs text-gray-400">{formData.message.length}/2000</p>
                </div>

                <p className="text-xs text-gray-500 pt-1">* Required fields</p>

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.name.trim() || !formData.mobile.trim()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-ink px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 shrink-0" />
                        Send enquiry
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Promo panel — solid brand ink / slate (no pattern) */}
        <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-gradient-to-b from-slate-800 via-brand-ink to-slate-950 p-6 sm:p-8 lg:p-10 text-white md:min-w-[min(420px,42vw)] min-h-[240px] md:min-h-0">
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-bold leading-tight text-white drop-shadow-sm">
              Shop online &amp; visit us locally
            </h3>
            <p className="mt-2 text-sm sm:text-base text-slate-200 leading-relaxed max-w-md">
              Browse the catalogue, then confirm stock and price on WhatsApp—or drop by the store.
            </p>

            <div className="mt-6 md:mt-7 space-y-2.5">
              {[
                {
                  icon: LayoutGrid,
                  title: 'Wide range',
                  text: 'Many categories in one place—easy to compare before you buy.',
                },
                {
                  icon: Tag,
                  title: 'Clear pricing',
                  text: 'See labels in store; we’ll double-check on WhatsApp too.',
                },
                {
                  icon: MapPin,
                  title: 'Pickup & help',
                  text: 'Visit us for pickup or ask what delivery options work in your area.',
                },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 sm:p-3.5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="h-5 w-5 text-slate-100" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{title}</p>
                    <p className="text-xs sm:text-sm text-slate-300 leading-snug mt-0.5">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-6 md:mt-8 space-y-3">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-200">
              <span className="inline-flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-brand-tagline shrink-0" />
                Quality-focused picks
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-brand-tagline shrink-0" />
                Straightforward service
              </span>
            </div>
            <Link
              to="/products"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-brand-ink shadow-lg transition hover:bg-slate-50"
            >
              Browse catalogue
              <ArrowRight className="h-5 w-5 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const useEnquiryPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupEnabled, setPopupEnabled] = useState(true);

  useEffect(() => {
    const checkPopupEnabled = async () => {
      try {
        const isDevelopment =
          process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
        const API_BASE_URL = isDevelopment
          ? 'http://localhost:3001/api'
          : process.env.REACT_APP_API_URL || '/api';

        const response = await fetch(`${API_BASE_URL}/content/company-settings/public`);
        if (response.ok) {
          const data = await response.json();
          setPopupEnabled(data.enable_enquiry_popup !== false);
          localStorage.setItem(
            'company_settings_cache',
            JSON.stringify({
              enable_enquiry_popup: data.enable_enquiry_popup,
              timestamp: Date.now(),
            }),
          );
        } else {
          const settingsCache = localStorage.getItem('company_settings_cache');
          if (settingsCache) {
            try {
              const cached = JSON.parse(settingsCache);
              if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
                setPopupEnabled(cached.enable_enquiry_popup !== false);
                return;
              }
            } catch {
              /* ignore */
            }
          }
          setPopupEnabled(true);
        }
      } catch {
        const settingsCache = localStorage.getItem('company_settings_cache');
        if (settingsCache) {
          try {
            const cached = JSON.parse(settingsCache);
            setPopupEnabled(cached.enable_enquiry_popup !== false);
            return;
          } catch {
            /* ignore */
          }
        }
        console.warn('Could not check popup setting, defaulting to enabled');
        setPopupEnabled(true);
      }
    };

    checkPopupEnabled();
  }, []);

  useEffect(() => {
    if (!popupEnabled) return;

    const checkShouldShow = () => {
      try {
        const stored = readPopupDismissed();
        if (!stored) {
          setShowPopup(true);
          return;
        }
        const { timestamp } = JSON.parse(stored);
        const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        if (daysSince >= DAYS_TO_HIDE) setShowPopup(true);
      } catch {
        console.error('Error reading popup storage');
        setShowPopup(true);
      }
    };

    const timer = setTimeout(checkShouldShow, 1000);
    return () => clearTimeout(timer);
  }, [popupEnabled]);

  const handleClose = () => {
    setShowPopup(false);
    try {
      const payload = JSON.stringify({ timestamp: Date.now() });
      localStorage.setItem(STORAGE_KEY, payload);
      localStorage.removeItem(STORAGE_KEY_LEGACY);
    } catch (error) {
      console.error('Error storing popup state:', error);
    }
  };

  return { showPopup, handleClose };
};

export default EnquiryPopup;
