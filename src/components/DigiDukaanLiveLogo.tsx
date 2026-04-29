import React from 'react';
import { brandColors } from '../theme/brandColors';

export type DigiDukaanLiveLogoProps = {
  className?: string;
  /** sm = compact, md = header, footer = larger mark + wordmark, tagline one line */
  size?: 'sm' | 'md' | 'footer';
  /** High-contrast text for dark bars (footer) — default uses ink + gold on light */
  variant?: 'default' | 'onDark';
};

/** Pixel-grid mark + live pulse — digital retail palette */
function LogoMark({ className }: { className?: string }) {
  const { blockYellow, blockCoral, blockGreen, blockSky } = brandColors;
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="2" y="2" width="19" height="19" rx="3.5" fill={blockYellow} />
      <rect x="25" y="2" width="19" height="19" rx="3.5" fill={blockCoral} />
      <rect x="2" y="25" width="19" height="19" rx="3.5" fill={blockGreen} />
      <rect x="25" y="25" width="19" height="19" rx="3.5" fill={blockSky} />
      <circle cx="40" cy="40" r="7" fill={blockCoral} opacity={0.95} />
      <circle cx="40" cy="40" r="2.8" fill="#fff" />
    </svg>
  );
}

const DigiDukaanLiveLogo: React.FC<DigiDukaanLiveLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'default',
}) => {
  const onDark = variant === 'onDark';
  const markClass =
    size === 'footer'
      ? 'h-14 w-14 sm:h-16 sm:w-16 shrink-0'
      : size === 'md'
        ? 'h-11 w-11 sm:h-12 sm:w-12 shrink-0'
        : 'h-10 w-10 shrink-0';
  const titleClass =
    size === 'footer'
      ? 'text-lg sm:text-xl md:text-2xl leading-[1.05] tracking-tight drop-shadow-sm'
      : size === 'md'
        ? 'text-[0.95rem] sm:text-lg md:text-xl lg:text-2xl leading-tight tracking-tight'
        : onDark
          ? 'text-[0.95rem] sm:text-lg leading-tight tracking-tight drop-shadow-sm'
          : 'text-sm sm:text-base leading-tight tracking-tight';
  const tagClass =
    size === 'footer'
      ? 'text-[0.62rem] sm:text-[0.7rem] md:text-xs mt-1.5 tracking-[0.12em] sm:tracking-[0.16em] whitespace-nowrap'
      : size === 'md'
        ? 'text-[0.55rem] sm:text-[0.62rem] md:text-[0.68rem] mt-0.5'
        : onDark
          ? 'text-[0.65rem] sm:text-xs mt-1 tracking-[0.18em] sm:tracking-[0.24em]'
          : 'text-[0.5rem] sm:text-[0.55rem] mt-0.5';

  const titleColor = onDark ? brandColors.onDarkTitle : brandColors.ink;
  const taglineColor = onDark ? brandColors.onDarkTagline : brandColors.taglineGold;
  const liveColor = onDark ? brandColors.onDarkTagline : brandColors.blockCoral;

  return (
    <div
      className={`flex items-center gap-3 sm:gap-3.5 ${size === 'footer' ? 'flex-nowrap' : ''} ${className}`}
    >
      <LogoMark className={markClass} />
      <div
        className={`flex flex-col items-start text-left ${size === 'footer' ? 'min-w-0 flex-1' : 'min-w-0'}`}
      >
        <span
          className={`font-display font-extrabold uppercase ${titleClass}`}
          style={{ color: titleColor }}
        >
          DigiDukaan
          <span style={{ color: liveColor }}>Live</span>
        </span>
        <span
          className={`font-logoTagline font-semibold uppercase ${tagClass}`}
          style={{ color: taglineColor }}
        >
          Browse · order · collect
        </span>
      </div>
    </div>
  );
};

export default DigiDukaanLiveLogo;
