import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Storefront-only: top “quest” progress burst + main content enter animation on route change.
 * Respects prefers-reduced-motion.
 */
const PageNavigationFX: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const shellRef = useRef<HTMLDivElement>(null);
  const skipTransition = useRef(true);
  const [barCycle, setBarCycle] = useState(0);

  useEffect(() => {
    if (skipTransition.current) {
      skipTransition.current = false;
      return;
    }

    setBarCycle((n) => n + 1);

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const shell = shellRef.current;
    if (reduced || !shell) return;

    shell.classList.remove('page-nfx-play');
    void shell.offsetWidth;
    shell.classList.add('page-nfx-play');
  }, [location.pathname, location.search, location.hash]);

  return (
    <>
      {/* Quest trail — thin gradient bar races across the top */}
      <div
        className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none overflow-hidden"
        aria-hidden
      >
        {barCycle > 0 && (
          <div key={barCycle} className="h-full w-full quest-nav-bar-track">
            <div className="h-full w-full quest-nav-bar-fill" />
          </div>
        )}
      </div>

      {/* Quick sparkle burst on navigate (sm+, hidden for reduced-motion in CSS) */}
      {barCycle > 0 && (
        <div
          key={barCycle}
          className="fixed top-14 right-6 z-[99] pointer-events-none hidden sm:flex gap-1 quest-spark-burst"
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

      <div ref={shellRef} className="page-nfx-shell">
        {children}
      </div>
    </>
  );
};

export default PageNavigationFX;
