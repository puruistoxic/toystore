import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Storefront-only: main content enter animation on route change.
 * Top progress bar lives in {@link RouteTransitionBar} (global).
 * Class `page-nfx-play` is removed after the animation (or a timeout) so fill-mode cannot leave content invisible.
 */
const PageNavigationFX: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const shellRef = useRef<HTMLDivElement>(null);
  const skipTransition = useRef(true);

  useEffect(() => {
    if (skipTransition.current) {
      skipTransition.current = false;
      return;
    }

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const shell = shellRef.current;
    if (!shell) return;
    if (reduced) return;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      shell.classList.remove('page-nfx-play');
    };

    shell.classList.remove('page-nfx-play');
    void shell.offsetWidth;
    shell.classList.add('page-nfx-play');

    const onEnd = (e: AnimationEvent) => {
      if (e.animationName === 'page-quest-in') finish();
    };
    shell.addEventListener('animationend', onEnd);
    const safety = window.setTimeout(finish, 700);

    return () => {
      shell.removeEventListener('animationend', onEnd);
      window.clearTimeout(safety);
      finish();
    };
  }, [location.pathname, location.search]);

  return (
    <div ref={shellRef} className="page-nfx-shell">
      {children}
    </div>
  );
};

export default PageNavigationFX;
