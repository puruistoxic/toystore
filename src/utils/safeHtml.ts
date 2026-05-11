import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';

/** Safe subset for catalogue copy from TinyMCE / pasted HTML */
const RICH_DESCRIPTION_CONFIG: Config = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'ul',
    'ol',
    'li',
    'a',
    'span',
    'h2',
    'h3',
    'h4',
    'blockquote',
    'div',
    'hr',
    'sub',
    'sup',
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

/**
 * Sanitize HTML for inline rendering (product descriptions, etc.).
 * Outside a browser (tests / SSR), returns a plain-text fallback.
 */
export function sanitizeRichDescription(html: string): string {
  const raw = html?.trim() ?? '';
  if (!raw) return '';
  if (typeof window === 'undefined') {
    return stripHtmlToPlain(raw);
  }
  return DOMPurify.sanitize(raw, RICH_DESCRIPTION_CONFIG);
}

/** Plain text for previews, meta fallbacks, and truncation. */
export function stripHtmlToPlain(html: string): string {
  if (!html?.trim()) return '';
  const withoutDangerous = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  if (typeof document !== 'undefined') {
    const el = document.createElement('div');
    el.innerHTML = withoutDangerous;
    return (el.textContent || el.innerText || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return withoutDangerous
    .replace(/<[^>]+>/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
