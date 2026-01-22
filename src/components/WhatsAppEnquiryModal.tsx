import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import type { Product } from '../types/catalog';

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
    requestedPrice: '',
    customMessage: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch company settings to get WhatsApp number
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
      // Reset form when modal opens
      setFormData({
        quantity: 1,
        requestedPrice: '',
        customMessage: '',
        customerName: '',
        customerEmail: '',
        customerPhone: ''
      });
      setErrors({});
    }
  }, [isOpen, product]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    if (formData.customerName.trim().length < 2) {
      newErrors.customerName = 'Please enter your name';
    }

    if (formData.customerPhone.trim().length < 10) {
      newErrors.customerPhone = 'Please enter a valid phone number';
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Compose WhatsApp message
      const whatsappNumber = settings?.whatsapp_number || '8851577973';
      const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

      let message = `Hello Khandelwal Toy Store Team,\n\n`;
      message += `I'm interested in:\n`;
      message += `Product: ${product.name}\n`;
      message += `Link: ${window.location.href}\n\n`;
      
      message += `Details:\n`;
      message += `Quantity: ${formData.quantity} units\n`;
      
      if (formData.requestedPrice) {
        message += `Requested Price: ₹${formData.requestedPrice}\n`;
      }
      
      if (formData.customMessage) {
        message += `\nMessage: ${formData.customMessage}\n`;
      }
      
      message += `\nContact Information:\n`;
      message += `Name: ${formData.customerName}\n`;
      message += `Phone: ${formData.customerPhone}\n`;
      if (formData.customerEmail) {
        message += `Email: ${formData.customerEmail}\n`;
      }

      // Log enquiry to backend
      try {
        await api.post('/content/enquiries', {
          product_id: product.id,
          product_name: product.name,
          product_slug: product.slug,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail || null,
          customer_phone: formData.customerPhone,
          quantity: formData.quantity,
          requested_price: formData.requestedPrice ? parseFloat(formData.requestedPrice) : null,
          custom_message: formData.customMessage || null,
          whatsapp_number: cleanNumber,
          enquiry_type: 'product'
        });
      } catch (logError) {
        console.error('Failed to log enquiry:', logError);
        // Continue even if logging fails
      }

      // Open WhatsApp
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setIsSubmitting(false);
      }, 500);
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert('Failed to send enquiry. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
            <div className="flex items-center space-x-3">
              <div className="bg-[#25D366] p-2 rounded-lg">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">WhatsApp Enquiry</h2>
                <p className="text-sm text-gray-500">{product.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>

            {/* Requested Price (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requested Price (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.requestedPrice}
                  onChange={(e) => setFormData({ ...formData, requestedPrice: e.target.value })}
                  placeholder="Enter your expected price per unit"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              {product.price > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Current price: ₹{product.price.toLocaleString('en-IN')} {product.priceIncludesGst ? '(GST Inc.)' : ''}
                </p>
              )}
            </div>

            {/* Custom Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Message (Optional)
              </label>
              <textarea
                value={formData.customMessage}
                onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                placeholder="Any specific requirements or questions..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.customerName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-500">{errors.customerName}</p>
                )}
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.customerPhone && (
                  <p className="mt-1 text-sm text-red-500">{errors.customerPhone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.customerEmail && (
                  <p className="mt-1 text-sm text-red-500">{errors.customerEmail}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#25D366] text-white rounded-lg font-semibold hover:bg-[#20BA5A] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send via WhatsApp
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppEnquiryModal;
