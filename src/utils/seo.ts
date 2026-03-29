/**
 * Generate SEO-friendly URL slug from a string
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/** Public site origin (no trailing slash). Set REACT_APP_SITE_URL for staging / preview link previews. */
export const SITE_ORIGIN = (
  typeof process !== 'undefined' && process.env.REACT_APP_SITE_URL
    ? String(process.env.REACT_APP_SITE_URL).replace(/\/$/, '')
    : 'https://khandelwaltoystore.com'
);

export const SITE_NAME = 'Khandelwal Toy Store';

/**
 * Default share image path (served from public/). Use a ≥1200×630 JPG/PNG in production for best results.
 * WhatsApp / Facebook / LinkedIn require an absolute https URL — see resolveOgImage().
 */
export const DEFAULT_OG_IMAGE_PATH = '/images/hero/toys-hero.jpg';

export const DEFAULT_KEYWORDS = [
  'Khandelwal Toy Store',
  'toy shop',
  'kids toys',
  'toys Surat',
  'educational toys',
  'board games',
  'dolls',
  'birthday gifts toys',
  'toy store India',
  'buy toys online',
  'WhatsApp toy shop',
].join(', ');

/** Turn a root-relative or absolute URL into an absolute URL for Open Graph / Twitter cards. */
export function toAbsoluteUrl(href: string, origin: string = SITE_ORIGIN): string {
  const t = href.trim();
  if (!t) return `${origin}${DEFAULT_OG_IMAGE_PATH.startsWith('/') ? DEFAULT_OG_IMAGE_PATH : `/${DEFAULT_OG_IMAGE_PATH}`}`;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith('//')) return `https:${t}`;
  const path = t.startsWith('/') ? t : `/${t}`;
  return `${origin.replace(/\/$/, '')}${path}`;
}

/** Absolute OG image URL — pass product/hero path or leave blank for default. */
export function resolveOgImage(url?: string | null): string {
  if (url?.trim()) return toAbsoluteUrl(url.trim());
  return `${SITE_ORIGIN.replace(/\/$/, '')}${DEFAULT_OG_IMAGE_PATH.startsWith('/') ? DEFAULT_OG_IMAGE_PATH : `/${DEFAULT_OG_IMAGE_PATH}`}`;
}

/**
 * Generate canonical URL
 */
export const getCanonicalUrl = (path: string, baseUrl: string = SITE_ORIGIN): string => {
  const base = baseUrl.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Generate meta description for services
 */
export const generateServiceMetaDescription = (
  serviceName: string,
  location?: string
): string => {
  const base = `Professional ${serviceName} services`;
  const locationText = location ? ` in ${location}` : '';
  return `${base}${locationText}. Expert installation, maintenance, and support. Get a free quote today!`;
};

/**
 * Generate meta description for products
 */
export const generateProductMetaDescription = (
  productName: string,
  brand?: string
): string => {
  const brandText = brand ? `${brand} ` : '';
  return `Shop ${brandText}${productName} at Khandelwal Toy Store — local toy shop. Check availability and price on WhatsApp or visit us in store.`;
};

/**
 * Generate title for pages
 */
export const generatePageTitle = (
  pageName: string,
  location?: string,
  suffix: string = ' | Khandelwal Toy Store'
): string => {
  const locationText = location ? ` in ${location}` : '';
  return `${pageName}${locationText}${suffix}`;
};

/**
 * Readable interim title from URL slug while product JSON is still loading (tab title / share).
 */
export function titleFromProductSlug(slug: string): string {
  if (!slug?.trim()) return 'Product';
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => {
      if (/^\d+$/.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');
}

const META_DESC_MAX = 158;

/**
 * Prefer a snippet from the product description for meta / og:description; fallback to generic line.
 */
export function buildProductShareDescription(product: {
  name: string;
  brand?: string;
  description?: string;
}): string {
  const raw = (product.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (raw.length >= 40) {
    const slice = raw.slice(0, META_DESC_MAX);
    if (raw.length <= META_DESC_MAX) return slice;
    const cut = slice.replace(/\s+\S*$/, '').trim();
    return cut.length >= 40 ? `${cut}…` : `${slice.trim()}…`;
  }
  return generateProductMetaDescription(product.name, product.brand);
}

