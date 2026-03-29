/**
 * Khandelwal Toys — canonical hex values for logo SVG and any JS usage.
 * Keep in sync with `tailwind.config.js` (`brand`, `primary`) and `docs/BRAND_GUIDELINES.md`.
 */
export const brandColors = {
  /** Logo wordmark — deep navy-teal */
  ink: '#1B3A4B',
  /** Logo tagline — warm gold (screenshot reference) */
  taglineGold: '#F4D35E',
  /** Logo mark — four blocks */
  blockYellow: '#FFD60A',
  blockCoral: '#FF6B35',
  blockGreen: '#2A9D6F',
  blockSky: '#5FB4D9',
  /** Primary actions / links (same family as block coral) */
  coral: '#FF6B35',
  /** Outlines, secondary CTAs, carousel trim */
  sunshine: '#FFD60A',
  /** Hero / marketing surfaces */
  lavender: '#DDD6FE',
  peach: '#FBCFE8',
  sand: '#FEF3C7',
  /** WhatsApp FAB */
  whatsapp: '#25D366',
  /** Logo on dark backgrounds (e.g. footer) — WCAG-friendly vs brand ink */
  onDarkTitle: '#F8FAFC',
  onDarkTagline: '#FACC15',
} as const;
