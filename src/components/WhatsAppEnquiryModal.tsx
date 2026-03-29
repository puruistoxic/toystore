import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageCircle, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import type { Product } from '../types/catalog';
import { getCanonicalUrl } from '../utils/seo';

interface WhatsAppEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

interface CompanySettings {
  whatsapp_number?: string;
}

const WhatsAppEnquiryModal: React.FC<WhatsAppEnquiryModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    customMessage: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: settings } = useQuery<CompanySettings>({
    queryKey: ['company-settings-public'],
    queryFn: async () => {
      const response = await api.get('/content/company-settings/public');
      return response.data;
    },
    enabled: isOpen
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        quantity: 1,
        customMessage: '',
        customerName: '',
        customerEmail: '',
        customerPhone: ''
      });
      setErrors({});
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildWhatsAppMessage = () => {
    const productPageUrl = getCanonicalUrl(`/products/${product.slug}`);
    let message = `Hello Khandelwal Toy Store Team,\n\n`;
    message += `I'm interested in:\n`;
    message += `Product: ${product.name}\n`;
    if (product.brand) {
      message += `Brand: ${product.brand}\n`;
    }
    if (product.sku) {
      message += `SKU: ${product.sku}\n`;
    }
    message += `Product page: ${productPageUrl}\n\n`;
    message += `Quantity: ${formData.quantity} unit(s)\n`;
    if (formData.customMessage.trim()) {
      message += `\nMessage: ${formData.customMessage.trim()}\n`;
    }
    const extras: string[] = [];
    if (formData.customerName.trim()) {
      extras.push(`Name: ${formData.customerName.trim()}`);
    }
    if (formData.customerPhone.trim()) {
      extras.push(`Phone: ${formData.customerPhone.trim()}`);
    }
    if (formData.customerEmail.trim()) {
      extras.push(`Email: ${formData.customerEmail.trim()}`);
    }
    if (extras.length) {
      message += `\n${extras.join('\n')}\n`;
    }
    return message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const whatsappNumber = settings?.whatsapp_number || '919898524462';
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

    try {
      await api.post('/content/enquiries', {
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        customer_name: formData.customerName.trim() || null,
        customer_email: formData.customerEmail.trim() || null,
        customer_phone: formData.customerPhone.trim() || null,
        quantity: formData.quantity,
        custom_message: formData.customMessage.trim() || null,
        whatsapp_number: cleanNumber,
        enquiry_type: 'product'
      });
    } catch (logError) {
      console.error('Failed to log enquiry:', logError);
      alert('We could not save your enquiry. Please check your connection and try again.');
      setIsSubmitting(false);
      return;
    }

    try {
      const message = buildWhatsAppMessage();
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      onClose();
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      alert('Your enquiry was saved. Open WhatsApp manually if the app did not open.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  /* Portal avoids position:fixed being trapped by transformed ancestors (e.g. PageNavigationFX shell). */
  return createPortal(
    <div
      className="fixed inset-0 z-[240] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="whatsapp-enquiry-title"
        className="relative z-10 flex max-h-[min(90dvh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
          <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between rounded-t-xl">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="bg-[#25D366] p-2 rounded-lg shrink-0">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 id="whatsapp-enquiry-title" className="text-xl font-bold text-gray-900">
                  WhatsApp Enquiry
                </h2>
                <p className="text-sm text-gray-500 truncate">{product.name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional message <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={formData.customMessage}
                onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                placeholder="Questions, delivery area, age of child, etc."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Contact <span className="text-gray-500 font-normal">(all optional)</span></h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoComplete="tel"
                  placeholder="So we can reach you if needed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  autoComplete="email"
                />
                {errors.customerEmail && (
                  <p className="mt-1 text-sm text-red-500">{errors.customerEmail}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-[#25D366] text-white rounded-lg font-semibold hover:bg-[#20BA5A] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send
                  </>
                )}
              </button>
            </div>
          </form>
      </div>
    </div>,
    document.body
  );
};

export default WhatsAppEnquiryModal;
