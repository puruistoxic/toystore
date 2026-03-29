/**
 * Image Placeholder Utilities
 *
 * Functions to generate and handle placeholder images when product images are missing
 */

/** Escape text for safe use inside SVG (Unicode allowed; only XML special chars escaped). */
function escapeSvgText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Generate a placeholder image URL using a placeholder service
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param text - Optional text to display on placeholder
 * @returns Placeholder image URL
 */
export function getPlaceholderImage(width: number = 400, height: number = 300, text?: string): string {
  // Using placeholder.com service with fallback to data URI
  if (text) {
    // Use data URI for text-based placeholders (more reliable)
    return getDataURIPlaceholder(width, height, text);
  }
  // For simple placeholders, use external service
  return `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280`;
}

/**
 * Generate a data URI placeholder (works offline).
 * Uses UTF-8 via encodeURIComponent — avoids btoa(), which throws on non-Latin1 (e.g. em dash, Hindi).
 */
export function getDataURIPlaceholder(width: number = 400, height: number = 300, text: string = 'No Image'): string {
  const short = text.length > 48 ? `${text.slice(0, 45)}…` : text;
  const safe = escapeSvgText(short);
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle" dy=".3em">${safe}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Handle image load error by replacing with placeholder
 * @param event - Image error event
 * @param placeholderText - Optional text for placeholder
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>, placeholderText?: string): void {
  const target = event.currentTarget;
  const productName = target.alt || placeholderText || 'Product';
  // Use data URI as it's more reliable (works offline, no external dependency)
  target.src = getDataURIPlaceholder(400, 300, productName);
  target.onerror = null; // Prevent infinite loop
}






