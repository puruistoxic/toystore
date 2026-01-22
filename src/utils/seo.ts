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

/**
 * Generate canonical URL
 */
export const getCanonicalUrl = (path: string, baseUrl: string = 'https://khandelwaltoystore.com'): string => {
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
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
  return `Buy ${brandText}${productName} online. High-quality security equipment with warranty. Free shipping available.`;
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

