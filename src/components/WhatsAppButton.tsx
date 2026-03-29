import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import api from '../utils/api';
import { useProductWhatsApp } from '../contexts/ProductWhatsAppContext';
import { normalizeWhatsAppDigits } from '../utils/whatsappNumber';

/**
 * Floating WhatsApp — on a product page, the message includes that product’s name and page link.
 */
const WhatsAppButton: React.FC = () => {
  const { snapshot } = useProductWhatsApp();
  const { data: settings } = useQuery({
    queryKey: ['company-settings-public'],
    queryFn: async () => {
      const res = await api.get('/content/company-settings/public');
      return res.data as { whatsapp_number?: string };
    },
  });

  const cleanNumber = normalizeWhatsAppDigits(settings?.whatsapp_number);

  const handleWhatsAppClick = () => {
    const genericMessage = `Hello Khandelwal Toy Store,

I'd like to know about toys you have in stock.

Please share:
- Store address / timings
- Whether you have [age or toy type] available
- How to order or visit

Thank you!`;

    const productMessage = snapshot
      ? `Hello Khandelwal Toy Store,

I'm enquiring about this product from your website:

Product: ${snapshot.name}
${snapshot.brand ? `Brand: ${snapshot.brand}
` : ''}Product page: ${snapshot.pageUrl}

Please confirm stock, price, and how I can order or visit.

Thank you!`
      : genericMessage;

    const encodedMessage = encodeURIComponent(productMessage);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 bg-brand-whatsapp text-white p-4 rounded-full shadow-lg hover:brightness-95 transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-whatsapp focus:ring-offset-2 group animate-bounce-in"
      aria-label={snapshot ? `WhatsApp enquiry about ${snapshot.name}` : 'Contact us on WhatsApp'}
      title={snapshot ? `WhatsApp about: ${snapshot.name}` : 'Quick enquiry on WhatsApp'}
      style={{ zIndex: 50 }}
    >
      <MessageCircle className="h-6 w-6 md:h-7 md:w-7 group-hover:scale-110 transition-transform" />

      <span className="absolute inset-0 rounded-full bg-brand-whatsapp animate-ping opacity-75" />

      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-[min(90vw,280px)]">
        {snapshot ? `Enquire: ${snapshot.name}` : 'Quick enquiry'}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="border-4 border-transparent border-t-gray-900" />
        </div>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(20px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </button>
  );
};

export default WhatsAppButton;
