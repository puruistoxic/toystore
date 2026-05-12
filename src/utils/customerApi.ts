/**
 * Customer-scoped axios instance.
 *
 * Distinct from the admin `api.ts` instance because:
 *   - Reads from localStorage.customer_token (not admin_token).
 *   - Does NOT auto-redirect on 401 (admin api redirects to /admin/login,
 *     which is wrong for storefront customers).
 *
 * Routes consumed: /customer/auth/*, /orders/*
 */
import axios from 'axios';

const CUSTOMER_TOKEN_KEY = 'customer_token';

function getApiBaseUrl(): string {
  const isDevelopment =
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost');
  return isDevelopment
    ? 'http://localhost:3001/api'
    : process.env.REACT_APP_API_URL || '/api';
}

const customerApi = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

customerApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem(CUSTOMER_TOKEN_KEY);
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function getCustomerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function setCustomerToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  else window.localStorage.removeItem(CUSTOMER_TOKEN_KEY);
}

export { CUSTOMER_TOKEN_KEY };
export default customerApi;
