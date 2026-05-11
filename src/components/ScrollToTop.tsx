import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to top on route changes (pathname + search). Runs inside Router for all routes.
 * Deferred with requestAnimationFrame so we do not block React’s commit (avoids janky / “stuck” navigations).
 */
const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scrollNow = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    if (isFirst.current) {
      isFirst.current = false;
      requestAnimationFrame(scrollNow);
      return;
    }

    const id = requestAnimationFrame(scrollNow);
    return () => cancelAnimationFrame(id);
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
