import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global thin progress + sparkle on client navigations (all routes under Router).
 * Skips the first paint; respects prefers-reduced-motion.
 */
const RouteTransitionBar: React.FC = () => {
  const location = useLocation();
  const skipFirst = useRef(true);
  const [barCycle, setBarCycle] = useState(0);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    setBarCycle((n) => n + 1);
  }, [location.pathname, location.search]);

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-[500] h-[3px] pointer-events-none overflow-hidden"
        aria-hidden
      >
        {barCycle > 0 && (
          <div key={barCycle} className="h-full w-full quest-nav-bar-track">
            <div className="h-full w-full quest-nav-bar-fill" />
          </div>
        )}
      </div>

      {barCycle > 0 && (
        <div
          key={`spark-${barCycle}`}
          className="fixed top-14 right-6 z-[499] pointer-events-none hidden sm:flex gap-1 quest-spark-burst"
          aria-hidden
        >
          <span className="text-primary-500 text-lg drop-shadow-sm">✦</span>
          <span className="text-brand-sunshine text-sm drop-shadow-sm" style={{ animationDelay: '80ms' }}>
            ✦
          </span>
          <span className="text-brand-leaf text-xs drop-shadow-sm" style={{ animationDelay: '160ms' }}>
            ✦
          </span>
        </div>
      )}
    </>
  );
};

export default RouteTransitionBar;
