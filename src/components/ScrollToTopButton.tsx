import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * ScrollToTopButton - A floating button that appears when user scrolls down
 * and allows them to quickly scroll back to the top
 */
const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when user scrolls down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-28 right-6 md:bottom-32 md:right-8 z-40 bg-primary-600 text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 group animate-fade-in"
          aria-label="Scroll to top"
          style={{ zIndex: 40 }}
        >
          <ArrowUp className="h-5 w-5 md:h-6 md:w-6 group-hover:-translate-y-1 transition-transform" />
        </button>
      )}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ScrollToTopButton;

