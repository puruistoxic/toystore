import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageCircle,
  MailCheck,
  Phone,
  Building2,
  ShieldCheck,
  ClipboardCheck,
  Send,
  CheckCircle
} from 'lucide-react';
import { products } from '../data/products';
import { services } from '../data/services';
import type { Product, Service } from '../types/catalog';
import {
  sendVerificationCode,
  verifyCode as verifyEmailCode
} from '../api/quoteVerification';

type QuoteChannel = 'whatsapp' | 'email';

type QuoteTarget =
  | { kind: 'product'; data: Product }
  | { kind: 'service'; data: Service };

const WHATSAPP_NUMBER = '919899860975';

const sanitiseLine = (value: string) => value.trim().replace(/\s+/g, ' ');
const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

const parseTargetFromSearch = (search: string) => {
  const params = new URLSearchParams(search);
  const typeParam = params.get('type');
  const id = params.get('id');
  const quantity = params.get('quantity') || '';
  const notes = params.get('notes') || '';

  let target: QuoteTarget | undefined;

  if (typeParam === 'service' && id) {
    const match = services.find((service) => service.id === id);
    if (match) {
      target = { kind: 'service', data: match };
    }
  } else if (id) {
    const match = products.find((product) => product.id === id);
    if (match) {
      target = { kind: 'product', data: match };
    }
  }

  return { target, quantity: quantity || '', notes };
};

const buildDetailLines = (target: QuoteTarget | undefined, quantity: string) => {
  if (!target) {
    return quantity ? [`• Quantity requested: ${sanitiseLine(quantity)}`] : [];
  }

  if (target.kind === 'product') {
    const { data } = target;
    const lines = [
      `• Brand / Model: ${data.brand} / ${data.model}`,
      `• Pricing (per unit): ${formatCurrency(data.price)}${
        data.originalPrice && data.originalPrice > data.price
          ? ` (MRP ${formatCurrency(data.originalPrice)})`
          : ''
      }`,
      `• Availability: ${
        data.inStock ? `In stock (${data.stockQuantity} units)` : 'Currently out of stock'
      }`,
      `• Key Features: ${data.features.slice(0, 4).join(', ')}`
    ];

    if (quantity) {
      lines.splice(1, 0, `• Quantity requested: ${sanitiseLine(quantity)}`);
    }

    return lines;
  }

  const { data } = target;
  const lines = [
    `• Duration: ${data.duration}`,
    `• Starting price: ${formatCurrency(data.price)}`,
    `• Deliverables include: ${data.includes.slice(0, 3).join(', ')}`,
    `• Core features: ${data.features.slice(0, 3).join(', ')}`
  ];

  if (quantity) {
    lines.splice(1, 0, `• Quantity / Locations: ${sanitiseLine(quantity)}`);
  }

  return lines;
};

const generateReference = () => `WAQ-${Date.now().toString(36).toUpperCase()}`;

const QuoteRequest: React.FC = () => {
  const location = useLocation();
  const { target, quantity: quantityFromUrl, notes: notesFromUrl } = useMemo(
    () => parseTargetFromSearch(location.search),
    [location.search]
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    itemName: target?.data.name ?? '',
    itemType: target ? (target.kind === 'product' ? 'Product' : 'Service') : '',
    selectedItemId: target ? `${target.kind}-${target.data.id}` : '',
    category: target?.kind === 'product' ? (target.data as Product).category : (target?.kind === 'service' ? (target.data as Service).category : ''),
    budget: '',
    timeline: '',
    location: '',
    industry: '',
    quantity: quantityFromUrl || '1',
    notes: notesFromUrl || target?.data.description || ''
  });

  useEffect(() => {
    if (target) {
      setFormData((prev) => ({
        ...prev,
        itemName: target.data.name,
        itemType: target.kind === 'product' ? 'Product' : 'Service',
        selectedItemId: `${target.kind}-${target.data.id}`,
        category: target.kind === 'product' ? (target.data as Product).category : (target.data as Service).category,
        quantity: quantityFromUrl || prev.quantity || '1',
        notes: notesFromUrl || target.data.description
      }));
    }
  }, [target, quantityFromUrl, notesFromUrl]);

  const handleItemSelection = (value: string) => {
    if (!value || value === '') {
      setFormData((prev) => ({
        ...prev,
        selectedItemId: '',
        itemName: '',
        itemType: '',
        category: ''
      }));
      return;
    }

    if (value === 'custom') {
      setFormData((prev) => ({
        ...prev,
        selectedItemId: 'custom',
        itemName: '',
        itemType: '',
        category: ''
      }));
      return;
    }

    const [type, id] = value.split('-');
    if (type === 'product') {
      const product = products.find((p) => p.id === id);
      if (product) {
        setFormData((prev) => ({
          ...prev,
          selectedItemId: value,
          itemName: product.name,
          itemType: 'Product',
          category: product.category
        }));
      }
    } else if (type === 'service') {
      const service = services.find((s) => s.id === id);
      if (service) {
        setFormData((prev) => ({
          ...prev,
          selectedItemId: value,
          itemName: service.name,
          itemType: 'Service',
          category: service.category
        }));
      }
    }
  };

  const [preferredChannel, setPreferredChannel] = useState<QuoteChannel>('whatsapp');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'sent' | 'verified'>('idle');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [submission, setSubmission] = useState<{
    channel: QuoteChannel;
    timestamp: string;
    reference: string;
  } | null>(null);
  const [verificationReference, setVerificationReference] = useState<string | null>(null);
  const [verificationExpiry, setVerificationExpiry] = useState<number | null>(null);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const detailLines = useMemo(
    () => buildDetailLines(target, formData.quantity),
    [target, formData.quantity]
  );

  const quoteMessage = useMemo(() => {
    const getBudgetLabel = (value: string) => {
      const labels: Record<string, string> = {
        'under-25000': 'Under ₹25,000',
        '25000-50000': '₹25,000 - ₹50,000',
        '50000-100000': '₹50,000 - ₹1,00,000',
        '100000-250000': '₹1,00,000 - ₹2,50,000',
        '250000-500000': '₹2,50,000 - ₹5,00,000',
        'over-500000': 'Over ₹5,00,000',
        'custom': 'Custom / Enterprise'
      };
      return labels[value] || value;
    };

    const getTimelineLabel = (value: string) => {
      const labels: Record<string, string> = {
        'urgent': 'Urgent (Within 1 week)',
        'soon': 'Soon (1-2 weeks)',
        'normal': 'Normal (2-4 weeks)',
        'flexible': 'Flexible (1-2 months)',
        'planning': 'Planning Phase (3+ months)'
      };
      return labels[value] || value;
    };

    const lines = [
      'Hello WAINSO Team,',
      '',
      'I would like to request a quote for the following:',
      `• Item/Service: ${sanitiseLine(formData.itemName || target?.data.name || 'Not specified')}`,
      (() => {
        const categoryLabel = formData.itemType || (target ? (target.kind === 'product' ? 'Product' : 'Service') : '');
        return categoryLabel ? `• Category: ${sanitiseLine(categoryLabel)}` : null;
      })(),
      formData.category ? `• Service Category: ${sanitiseLine(formData.category)}` : null,
      ...detailLines,
      formData.budget ? `• Budget Range: ${getBudgetLabel(formData.budget)}` : null,
      formData.timeline ? `• Timeline: ${getTimelineLabel(formData.timeline)}` : null,
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

  const handleSendWhatsApp = () => {
    if (!hasRequiredBasics()) {
      setFeedbackMessage('Please fill in your name, phone number, and item/service details before sending the quote request.');
      return;
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(quoteMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    confirmSubmission('whatsapp');
    setFeedbackMessage('We opened WhatsApp with your quote request. Please review and send it to finish.');
  };

  const handleSendVerification = async () => {
    if (!formData.email.trim()) {
      setFeedbackMessage('Please enter an email address before requesting verification.');
      return;
    }

    try {
      setIsSendingVerification(true);
      const response = await sendVerificationCode({
        email: formData.email.trim(),
        name: formData.name || 'Prospect',
        itemName: formData.itemName,
        channel: 'email',
        messagePreview: quoteMessage.slice(0, 200)
      });
      setVerificationStatus('sent');
      setVerificationReference(response.reference);
      setVerificationExpiry(response.expiresAt);
      // Don't set generatedCode - code is only sent via email for security
      setGeneratedCode(null);
      setFeedbackMessage(
        `Verification code sent to ${formData.email.trim()}. Please check your email and enter the code below.`
      );
    } catch (error) {
      console.error('[quoteVerification] failed to dispatch code', error);
      setFeedbackMessage('Unable to send verification code right now. Please try again in a moment.');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.email.trim()) {
      setFeedbackMessage('Enter the email address used for verification, then try again.');
      return;
    }

    if (!enteredCode.trim()) {
      setFeedbackMessage('Please enter the verification code you received.');
      return;
    }

    try {
      setIsVerifying(true);
      const status = await verifyEmailCode(formData.email.trim(), enteredCode.trim());

      if (status === 'verified') {
        setVerificationStatus('verified');
        setFeedbackMessage('Email verified successfully. You can now send your quote request via email.');
        setGeneratedCode(null);
        setEnteredCode('');
      } else if (status === 'expired') {
        setVerificationStatus('idle');
        setVerificationReference(null);
        setVerificationExpiry(null);
        setFeedbackMessage('That verification code has expired. Request a new code to continue.');
      } else if (status === 'not_found') {
        setVerificationStatus('idle');
        setFeedbackMessage('No verification request found for this email. Please request a new code.');
      } else {
        setFeedbackMessage('Incorrect verification code. Please double-check and try again.');
      }
    } catch (error) {
      console.error('[quoteVerification] failed to verify code', error);
      setFeedbackMessage('We could not verify the code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendEmail = () => {
    if (!hasRequiredBasics()) {
      setFeedbackMessage('Please fill in your name, phone number, and item/service details before sending the quote request.');
      return;
    }

    if (verificationStatus !== 'verified') {
      setFeedbackMessage('Please verify your email before sending the quote request.');
      return;
    }

    const subject = encodeURIComponent(`Quote Request - ${sanitiseLine(formData.itemName || 'WAINSO')}`);
    const body = encodeURIComponent(quoteMessage);
    window.location.href = `mailto:wainsogps@gmail.com?subject=${subject}&body=${body}`;
    confirmSubmission('email');
    setFeedbackMessage('Your email client should now be open with a pre-filled quote request. Send it to complete the process.');
  };

  const submissionTimestamp = submission
    ? new Date(submission.timestamp).toLocaleString()
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <span className="inline-flex items-center rounded-full bg-primary-100 text-primary-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            Quote Request
          </span>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Request a Verified Quote</h1>
          <p className="mt-2 text-gray-600 max-w-3xl">
            Share your requirements and we will respond with a tailored quote. Choose WhatsApp for the fastest response
            or verify your email to send a formal request.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {submission && (
              <div className="bg-green-50 border border-green-100 text-green-700 rounded-lg px-4 py-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Quote request captured</h3>
                    <p className="text-sm mt-1">
                      Reference <span className="font-medium">{submission.reference}</span> via{' '}
                      <span className="capitalize">{submission.channel}</span> on {submissionTimestamp}.
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Keep this reference handy when following up with our team.
                    </p>
                  </div>
                </div>
              </div>
            )}

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

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Requirement Summary</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="selectedItemId" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Item / Service *
                  </label>
                  <select
                    id="selectedItemId"
                    name="selectedItemId"
                    value={formData.selectedItemId}
                    onChange={(e) => handleItemSelection(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    <option value="">-- Select an item or service --</option>
                    <optgroup label="Products">
                      {products.map((product) => (
                        <option key={`product-${product.id}`} value={`product-${product.id}`}>
                          {product.name} - {product.brand} ({formatCurrency(product.price)})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Services">
                      {services.map((service) => (
                        <option key={`service-${service.id}`} value={`service-${service.id}`}>
                          {service.name} ({formatCurrency(service.price)})
                        </option>
                      ))}
                    </optgroup>
                    <option value="custom">Custom Requirement (Specify below)</option>
                  </select>
                </div>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    <option value="">-- Select category --</option>
                    <option value="cctv">CCTV / Surveillance</option>
                    <option value="gps">GPS Tracking</option>
                    <option value="maintenance">Maintenance & Repair</option>
                    <option value="consultation">Consultation</option>
                    <option value="other">Other</option>
                  </select>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    <option value="">-- Select budget range --</option>
                    <option value="under-25000">Under ₹25,000</option>
                    <option value="25000-50000">₹25,000 - ₹50,000</option>
                    <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                    <option value="100000-250000">₹1,00,000 - ₹2,50,000</option>
                    <option value="250000-500000">₹2,50,000 - ₹5,00,000</option>
                    <option value="over-500000">Over ₹5,00,000</option>
                    <option value="custom">Custom / Enterprise (Contact for quote)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline / Urgency
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    <option value="">-- Select timeline --</option>
                    <option value="urgent">Urgent (Within 1 week)</option>
                    <option value="soon">Soon (1-2 weeks)</option>
                    <option value="normal">Normal (2-4 weeks)</option>
                    <option value="flexible">Flexible (1-2 months)</option>
                    <option value="planning">Planning Phase (3+ months)</option>
                  </select>
          </div>
                    </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location / Region
                  </label>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    <option value="">-- Select location --</option>
                    <option value="delhi-ncr">Delhi NCR</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="bangalore">Bangalore</option>
                    <option value="hyderabad">Hyderabad</option>
                    <option value="chennai">Chennai</option>
                    <option value="pune">Pune</option>
                    <option value="kolkata">Kolkata</option>
                    <option value="ahmedabad">Ahmedabad</option>
                    <option value="jaipur">Jaipur</option>
                    <option value="other">Other City</option>
                    <option value="multiple">Multiple Locations</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                    Industry / Business Type
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    <option value="">-- Select industry --</option>
                    <option value="retail">Retail / Shopping</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="logistics">Logistics / Transportation</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="hospitality">Hospitality / Hotels</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="banking">Banking / Finance</option>
                    <option value="warehouse">Warehouse / Storage</option>
                    <option value="office">Office / Corporate</option>
                    <option value="residential">Residential</option>
                    <option value="other">Other</option>
                  </select>
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
                      <div className="text-xs text-gray-500">Verification required before sending</div>
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
                <div className="mt-6 space-y-4">
                  <div className="rounded-lg border border-yellow-100 bg-yellow-50 px-4 py-4 text-sm text-yellow-700">
                    <div className="flex items-start">
                      <ClipboardCheck className="h-5 w-5 mr-3 mt-0.5" />
                      <p>
                        To prevent spam we require email verification. Request a one-time code below, enter it, and verify before sending your quote request.
                      </p>
                      </div>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <button
                      type="button"
                      onClick={handleSendVerification}
                      disabled={isSendingVerification}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                        isSendingVerification
                          ? 'bg-primary-300 text-white cursor-not-allowed'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSendingVerification ? 'Sending…' : 'Send verification code'}
                    </button>
                    <input
                      type="text"
                      value={enteredCode}
                      onChange={(event) => setEnteredCode(event.target.value)}
                      placeholder="Enter 6-digit code"
                      className="md:col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        generatedCode
                          ? 'border border-primary-600 text-primary-600 hover:bg-primary-50'
                          : 'border border-gray-300 text-gray-400'
                      } ${isVerifying ? 'cursor-not-allowed opacity-70' : ''}`}
                      disabled={!generatedCode || isVerifying}
                    >
                      {isVerifying ? 'Verifying…' : 'Verify email'}
                    </button>
                  </div>


                  {verificationStatus === 'verified' && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Email verified. You can now send your quote via email.
                    </div>
                  )}
                  {verificationReference && verificationStatus === 'sent' && (
                    <p className="text-xs text-gray-500">
                      Reference {verificationReference}
                      {verificationExpiry
                        ? ` • Expires ${new Date(verificationExpiry).toLocaleTimeString()}`
                        : ''}
                    </p>
                  )}
                </div>
              )}
            </div>

            {feedbackMessage && (
              <div className="bg-blue-50 border border-blue-100 text-blue-700 rounded-lg px-4 py-3 text-sm">
                {feedbackMessage}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Send via WhatsApp
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={verificationStatus !== 'verified'}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                  verificationStatus === 'verified'
                    ? 'border border-primary-600 text-primary-600 hover:bg-primary-50'
                    : 'border border-gray-300 text-gray-400 cursor-not-allowed'
                }`}
              >
                <MailCheck className="h-5 w-5 mr-2" />
                Send via Email
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {target && (
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Selected {target.kind === 'product' ? 'Product' : 'Service'}</h3>
                    <p className="text-sm text-gray-500">Automatically pre-filled from your selection.</p>
                  </div>
                  <span className="text-xs font-semibold uppercase px-3 py-1 rounded-full bg-primary-100 text-primary-700">
                    {target.kind === 'product' ? 'Product' : 'Service'}
                    </span>
                  </div>
                <p className="text-sm text-gray-600 border border-dashed border-gray-200 rounded-lg p-3 bg-gray-50">
                  {target.data.description}
                </p>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-gray-900">{target.data.name}</span>
                  </div>
                  {target.kind === 'product' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Brand / Model</span>
                        <span className="font-medium text-gray-900">{target.data.brand} / {target.data.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price</span>
                        <span className="font-medium text-gray-900">{formatCurrency(target.data.price)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium text-gray-900">{target.data.duration}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quantity</span>
                    <span className="font-medium text-gray-900">{sanitiseLine(formData.quantity || '1')}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Highlights</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {target.kind === 'product'
                      ? target.data.features.slice(0, 3).map((feature) => (
                          <li key={feature} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))
                      : target.data.includes.slice(0, 3).map((item) => (
                          <li key={item} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Preview</h3>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap">
                {quoteMessage}
                    </div>
                  </div>

            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">What Happens Next?</h3>
              <div className="flex items-start text-sm text-gray-600">
                <Phone className="h-5 w-5 text-primary-600 mr-3 mt-0.5" />
                <span>Our team verifies every WhatsApp request from a real account before sharing estimates.</span>
              </div>
              <div className="flex items-start text-sm text-gray-600">
                <Building2 className="h-5 w-5 text-primary-600 mr-3 mt-0.5" />
                <span>For enterprise projects, mention your organisation to receive tailored pricing.</span>
                </div>
              <div className="flex items-start text-sm text-gray-600">
                <ShieldCheck className="h-5 w-5 text-primary-600 mr-3 mt-0.5" />
                <span>Verified email requests help us avoid spam and prioritise genuine enquiries.</span>
              </div>
            </div>

            <div className="bg-primary-600 text-white rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Need immediate help?</h3>
              <p className="text-sm text-primary-100 mb-4">
                Call us directly and mention that you have submitted a quote request online.
              </p>
              <a
                href="tel:+919899860975"
                className="inline-flex items-center bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Phone className="h-4 w-4 mr-2" />
                +91 98998 60975
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteRequest;
