import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '919898524462'; // Khandelwal Toy Store WhatsApp number

/**
 * WhatsAppButton - Floating WhatsApp button for quick enquiry
 * Opens WhatsApp with a pre-filled message for toy wholesale inquiries
 */
const WhatsAppButton: React.FC = () => {
  const handleWhatsAppClick = () => {
    // Pre-filled message for toy wholesale enquiry
    const message = `Hello Khandelwal Toy Store Team,\n\nI'm interested in wholesale toy products.\n\nPlease provide:\n- Wholesale pricing\n- Minimum order quantity\n- Available stock\n- Delivery options\n\nThank you!`;
    
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp Web or App
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20BA5A] transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 group animate-bounce-in"
      aria-label="Contact us on WhatsApp"
      title="Quick Enquiry on WhatsApp"
      style={{ zIndex: 50 }}
    >
      <MessageCircle className="h-6 w-6 md:h-7 md:w-7 group-hover:scale-110 transition-transform" />
      
      {/* Pulse animation ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75"></span>
      
      {/* Tooltip on hover - positioned to avoid overlap with scroll button */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        Quick Enquiry
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="border-4 border-transparent border-t-gray-900"></div>
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

