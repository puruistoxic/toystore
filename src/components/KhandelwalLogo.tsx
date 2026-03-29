import React from 'react';
import { brandColors } from '../theme/brandColors';

export type KhandelwalLogoProps = {
  className?: string;
  /** Larger mark + type for header */
  size?: 'sm' | 'md';
  /** High-contrast text for dark bars (footer) — default uses ink + gold on light */
  variant?: 'default' | 'onDark';
};

/** Four-block toy mark — matches brand guidelines */
function LogoMark({ className }: { className?: string }) {
  const { blockYellow, blockCoral, blockGreen, blockSky } = brandColors;
  return (
    <svg
      className={className}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="1" y="1" width="19" height="19" rx="3.5" fill={blockYellow} />
      <rect x="24" y="1" width="19" height="19" rx="3.5" fill={blockCoral} />
      <rect x="1" y="24" width="19" height="19" rx="3.5" fill={blockGreen} />
      <rect x="24" y="24" width="19" height="19" rx="3.5" fill={blockSky} />
    </svg>
  );
}

const KhandelwalLogo: React.FC<KhandelwalLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'default',
}) => {
  const onDark = variant === 'onDark';
  const markClass = size === 'md' ? 'h-11 w-11 sm:h-12 sm:w-12 shrink-0' : 'h-10 w-10 shrink-0';
  const titleClass =
    size === 'md'
      ? 'text-base sm:text-lg md:text-xl lg:text-2xl leading-tight'
      : onDark
        ? 'text-base sm:text-lg leading-tight drop-shadow-sm'
        : 'text-sm sm:text-base leading-tight';
  const tagClass =
    size === 'md'
      ? 'text-[0.55rem] sm:text-[0.62rem] md:text-[0.68rem] mt-0.5'
      : onDark
        ? 'text-[0.65rem] sm:text-xs mt-1 tracking-[0.2em] sm:tracking-[0.28em]'
        : 'text-[0.5rem] sm:text-[0.55rem] mt-0.5';

  const titleColor = onDark ? brandColors.onDarkTitle : brandColors.ink;
  const taglineColor = onDark ? brandColors.onDarkTagline : brandColors.taglineGold;

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <LogoMark className={markClass} />
      <div className="flex flex-col items-start min-w-0 text-left">
        <span
          className={`font-display font-extrabold uppercase tracking-wide ${titleClass}`}
          style={{ color: titleColor }}
        >
          Khandelwal Toys
        </span>
        <span
          className={`font-logoTagline font-semibold uppercase ${tagClass}`}
          style={{ color: taglineColor }}
        >
          Imagination Unboxed
        </span>
      </div>
    </div>
  );
};

export default KhandelwalLogo;
