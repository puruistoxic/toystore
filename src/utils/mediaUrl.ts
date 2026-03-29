/**
 * Uploaded product images are served from the API (`/uploads/...`).
 * In dev, CRA runs on :3000 while the API is usually :3001 — resolve to a full URL when needed.
 */
export function getApiOrigin(): string {
  const fromEnv = process.env.REACT_APP_API_URL;
  if (fromEnv && fromEnv.trim()) {
    return fromEnv.replace(/\/api\/?$/i, '').replace(/\/$/, '') || '';
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${window.location.protocol}//localhost:3001`;
    }
  }
  return '';
}

export function resolveMediaUrl(url: string | undefined | null): string {
  if (url == null || typeof url !== 'string') return '';
  const u = url.trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u) || u.startsWith('data:')) return u;
  if (u.startsWith('/uploads/')) {
    const origin = getApiOrigin();
    return origin ? `${origin}${u}` : u;
  }
  return u;
}
