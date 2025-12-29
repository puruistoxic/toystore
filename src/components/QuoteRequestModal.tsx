import React, { useEffect, useMemo, useState } from 'react';
import { X, MessageCircle, MailCheck, Phone, Building2, ShieldCheck, CheckCircle } from 'lucide-react';
import { contentApi } from '../utils/api';
import type { Product, Service } from '../types/catalog';
import api from '../utils/api';

type QuoteChannel = 'whatsapp' | 'email';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string | number;
  serviceId?: string | number;
  product?: Product;
  service?: Service;
  initialQuantity?: string;
  initialNotes?: string;
}

const WHATSAPP_NUMBER = '919899860975';

const sanitiseLine = (value: string) => value.trim().replace(/\s+/g, ' ');

const generateReference = () => `WAQ-${Date.now().toString(36).toUpperCase()}`;

const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  isOpen,
  onClose,
  productId,
  serviceId,
  product,
  service,
  initialQuantity = '',
  initialNotes = ''
}) => {
  const [target, setTarget] = useState<{ kind: 'product' | 'service'; data: Product | Service } | null>(null);
  const [loadingTarget, setLoadingTarget] = useState(false);

  // Fetch product/service if only ID provided
  useEffect(() => {
    if (!isOpen) {
      setTarget(null);
      return;
    }

    const fetchTarget = async () => {
      // If product/service object is provided directly, use it
      if (product) {
        setTarget({ kind: 'product', data: product });
        return;
      }
      if (service) {
        setTarget({ kind: 'service', data: service });
        return;
      }

      // Otherwise, fetch by ID
      if (productId) {
        setLoadingTarget(true);
        try {
          const { data } = await contentApi.getProduct(productId.toString());
          setTarget({ kind: 'product', data: data as Product });
        } catch (error) {
          console.error('Failed to load product:', error);
        } finally {
          setLoadingTarget(false);
        }
      } else if (serviceId) {
        // Services might not have an API endpoint yet, so we'll handle it via props
        // For now, if serviceId is provided but no service object, we'll just set loading to false
        setLoadingTarget(false);
      }
    };

    fetchTarget();
  }, [isOpen, productId, serviceId, product, service]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    itemName: '',
    itemType: '',
    selectedItemId: '',
    category: '',
    location: '',
    industry: '',
    quantity: initialQuantity || '1',
    notes: initialNotes || ''
  });

  useEffect(() => {
    if (target) {
      setFormData((prev) => ({
        ...prev,
        itemName: target.data.name,
        itemType: target.kind === 'product' ? 'Product' : 'Service',
        selectedItemId: `${target.kind}-${target.data.id}`,
        category: target.data.category || '',
        quantity: initialQuantity || prev.quantity || '1',
        notes: initialNotes || target.data.description || prev.notes
      }));
    }
  }, [target, initialQuantity, initialNotes]);

  const buildDetailLines = (quantity: string) => {
    return quantity ? [`• Quantity requested: ${sanitiseLine(quantity)}`] : [];
  };

  const detailLines = useMemo(
    () => buildDetailLines(formData.quantity),
    [formData.quantity]
  );

  const quoteMessage = useMemo(() => {
    const lines = [
      'Hello WAINSO Team,',
      '',
      'I would like to request a quote for the following:',
      `• Item/Service: ${sanitiseLine(formData.itemName || target?.data.name || 'Not specified')}`,
      formData.itemType ? `• Category: ${sanitiseLine(formData.itemType)}` : null,
      ...detailLines,
      formData.location ? `• Location: ${sanitiseLine(formData.location)}` : null,
      formData.industry ? `• Industry: ${sanitiseLine(formData.industry)}` : null,
      formData.notes ? `• Additional details: ${sanitiseLine(formData.notes)}` : null,
      '',
      'Contact details:',
      `• Name: ${sanitiseLine(formData.name || 'Not provided')}`,
      formData.company ? `• Company: ${sanitiseLine(formData.company)}` : null,
      `• Phone: ${sanitiseLine(formData.phone || 'Not provided')}`,
      `• Email: ${sanitiseLine(formData.email || 'Not provided')}`,
      '',
      'Please get back to me with the pricing and next steps.',
      '',
      'Thank you!'
    ].filter(Boolean);

    return lines.join('\n');
  }, [formData, target, detailLines]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setFeedbackMessage(null);
  };

  const hasRequiredBasics = () =>
    sanitiseLine(formData.name).length > 0 &&
    sanitiseLine(formData.phone).length > 0 &&
    sanitiseLine(formData.itemName).length > 0;

  const [preferredChannel, setPreferredChannel] = useState<QuoteChannel>('whatsapp');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [submission, setSubmission] = useState<{
    channel: QuoteChannel;
    timestamp: string;
    reference: string;
  } | null>(null);

  const confirmSubmission = (channel: QuoteChannel) => {
    const reference = generateReference();
    const timestamp = new Date().toISOString();
    setSubmission({ channel, timestamp, reference });
    console.info('Quote request confirmed', {
      channel,
      reference,
      timestamp,
      payload: formData,
      message: quoteMessage
    });
  };

  const handleSend = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasRequiredBasics()) {
      setFeedbackMessage('Please fill in your name, phone number, and item/service details before sending the quote request.');
      return;
    }

    if (preferredChannel === 'whatsapp') {
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(quoteMessage)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      confirmSubmission('whatsapp');
      setFeedbackMessage('We opened WhatsApp with your quote request. Please review and send it to finish.');
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } else {
      setIsSendingEmail(true);
      setFeedbackMessage(null);

      try {
        const response = await api.post('/quote-request', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          itemName: formData.itemName,
          itemType: formData.itemType,
          category: formData.category,
          location: formData.location,
          industry: formData.industry,
          quantity: formData.quantity,
          notes: formData.notes,
          message: quoteMessage
        });

        confirmSubmission('email');
        setFeedbackMessage('Quote request sent successfully! Our team will get back to you soon.');
        
        // Auto-close after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);
      } catch (error: any) {
        console.error('Error sending quote request:', error);
        setFeedbackMessage(error.message || 'Failed to send quote request. Please try again or use WhatsApp instead.');
        setIsSendingEmail(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      itemName: '',
      itemType: '',
      selectedItemId: '',
      category: '',
      location: '',
      industry: '',
      quantity: initialQuantity || '1',
      notes: initialNotes || ''
    });
    setFeedbackMessage(null);
    setSubmission(null);
    setPreferredChannel('whatsapp');
    setIsSendingEmail(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={handleClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>

        {/* Center modal */}
        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-primary-600 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Request a Quote</h3>
              <p className="text-sm text-primary-100 mt-1">
                Share your requirements and we'll respond with a tailored quote
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-gray-50 px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {loadingTarget && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            )}

            {!loadingTarget && (
              <div className="space-y-6">
                {submission && (
                  <div className="bg-green-50 border border-green-100 text-green-700 rounded-lg px-4 py-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Quote request captured</h3>
                        <p className="text-sm mt-1">
                          Reference <span className="font-medium">{submission.reference}</span> via{' '}
                          <span className="capitalize">{submission.channel}</span> on{' '}
                          {new Date(submission.timestamp).toLocaleString()}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Your Details */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Details</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+91 98998 60975"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        Company / Organisation
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>

                {/* Requirement Summary */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Requirement Summary</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-2">
                        Item / Service Name *
                      </label>
                      <input
                        id="itemName"
                        name="itemName"
                        type="text"
                        required
                        value={formData.itemName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g. HD IP Camera 4MP"
                      />
                    </div>
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity / Units
                      </label>
                      <input
                        id="quantity"
                        name="quantity"
                        type="text"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g. 5 units, 10 cameras"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes / Requirements
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Share installation details, specific requirements, site conditions, or any other relevant information"
                    />
                  </div>
                </div>

                {/* Choose Channel */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Your Channel</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setPreferredChannel('whatsapp');
                        setFeedbackMessage(null);
                      }}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                        preferredChannel === 'whatsapp'
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-300 text-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <MessageCircle className="h-5 w-5 mr-3" />
                        <div className="text-left">
                          <div className="font-semibold">WhatsApp</div>
                          <div className="text-xs text-gray-500">Verified requests to +91 98998 60975</div>
                        </div>
                      </div>
                      {preferredChannel === 'whatsapp' && <CheckCircle className="h-5 w-5 text-primary-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPreferredChannel('email');
                        setFeedbackMessage(null);
                      }}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                        preferredChannel === 'email'
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-300 text-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <MailCheck className="h-5 w-5 mr-3" />
                        <div className="text-left">
                          <div className="font-semibold">Email</div>
                          <div className="text-xs text-gray-500">Send quote request via email</div>
                        </div>
                      </div>
                      {preferredChannel === 'email' && <CheckCircle className="h-5 w-5 text-primary-600" />}
                    </button>
                  </div>

                  {preferredChannel === 'whatsapp' && (
                    <div className="mt-6 rounded-lg border border-green-100 bg-green-50 px-4 py-4 text-sm text-green-700">
                      <div className="flex items-start">
                        <ShieldCheck className="h-5 w-5 mr-3 mt-0.5" />
                        <p>
                          We will open WhatsApp with a pre-composed message. Review the details and send it to complete your request.
                        </p>
                      </div>
                    </div>
                  )}

                  {preferredChannel === 'email' && (
                    <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-700">
                      <div className="flex items-start">
                        <MailCheck className="h-5 w-5 mr-3 mt-0.5" />
                        <p>
                          Your quote request will be sent directly to our team via email. We'll get back to you soon!
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {feedbackMessage && (
                  <div className="bg-blue-50 border border-blue-100 text-blue-700 rounded-lg px-4 py-3 text-sm">
                    {feedbackMessage}
                  </div>
                )}

                <div 
                  className="flex justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isSendingEmail}
                    className={`bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center min-w-[200px] ${
                      isSendingEmail ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {preferredChannel === 'whatsapp' ? (
                      <>
                        <MessageCircle className="h-5 w-5 mr-2" />
                        {isSendingEmail ? 'Sending...' : 'Send via WhatsApp'}
                      </>
                    ) : (
                      <>
                        <MailCheck className="h-5 w-5 mr-2" />
                        {isSendingEmail ? 'Sending...' : 'Send via Email'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteRequestModal;




