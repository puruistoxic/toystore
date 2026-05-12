import axios from 'axios';

// API base URL - use environment variable or default to relative path
// For local development, use localhost:3001, otherwise use the configured API URL
const getApiBaseUrl = () => {
  const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  return isDevelopment 
    ? 'http://localhost:3001/api'
    : (process.env.REACT_APP_API_URL || '/api');
};

const API_URL = getApiBaseUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Company settings API functions
export const companySettingsApi = {
  getSettings: () => api.get('/content/company-settings'),
  updateSettings: (data: any) => api.put('/content/company-settings', data),
};

// User management API functions
export const usersApi = {
  getUsers: (params?: { search?: string; role?: string; is_active?: boolean }) =>
    api.get('/admin/users', { params }),
  getUser: (id: number) =>
    api.get(`/admin/users/${id}`),
  createUser: (data: any) =>
    api.post('/admin/users', data),
  updateUser: (id: number, data: any) =>
    api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) =>
    api.delete(`/admin/users/${id}`),
  /** Unified people directory (admins + customers + guest contacts) */
  getDirectory: (params?: {
    type?: 'all' | 'admin' | 'customer' | 'guest';
    q?: string;
    status?: 'active' | 'inactive' | '';
    limit?: number;
    offset?: number;
  }) => api.get('/admin/users/directory', { params }),
};

/** Admin-only: unified activity timeline (panel + storefront + outreach). */
export const adminActivityApi = {
  getFeed: (params?: {
    scope?: 'all' | 'admin' | 'website';
    page?: number;
    limit?: number;
    q?: string;
    action?: string;
    entity_type?: string;
    username?: string;
  }) => api.get('/admin/activity-feed', { params }),
};

/** Storefront (DigiDukaanLive checkout) — admin JWT on /api/admin/store/... */
export const storefrontAdminApi = {
  getDashboard: (days = 30) => api.get('/admin/store/dashboard', { params: { days } }),
  getOrderStats: () => api.get('/admin/store/orders/stats'),
  getOrders: (params?: {
    status?: string;
    statuses?: string;
    payment_status?: string;
    q?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
    sort?: 'newest' | 'oldest' | 'total_desc' | 'total_asc';
  }) => api.get('/admin/store/orders', { params }),
  getOrder: (publicRef: string) => api.get(`/admin/store/orders/${encodeURIComponent(publicRef)}`),
  patchOrder: (
    publicRef: string,
    data: {
      status?: string;
      payment_status?: string;
      notes?: string | null;
      shipping_carrier?: string | null;
      tracking_number?: string | null;
      tracking_url?: string | null;
    },
  ) => api.patch(`/admin/store/orders/${encodeURIComponent(publicRef)}`, data),
  refundOrder: (
    publicRef: string,
    data: { reason?: string | null; amount?: number | null; method?: string | null },
  ) => api.post(`/admin/store/orders/${encodeURIComponent(publicRef)}/refund`, data),
  addOrderEvent: (publicRef: string, data: { message: string; visibility?: 'internal' | 'customer' }) =>
    api.post(`/admin/store/orders/${encodeURIComponent(publicRef)}/events`, data),
  getRecentOrders: (limit = 6) => api.get('/admin/store/orders', { params: { limit } }),
  getCustomers: (params?: { q?: string; limit?: number; offset?: number }) =>
    api.get('/admin/store/customers', { params }),
  getCustomer: (id: number | string) => api.get(`/admin/store/customers/${id}`),
  getOrderRequests: (params?: { status?: string; limit?: number; offset?: number }) =>
    api.get('/admin/store/order-requests', { params }),
  getOrderRequest: (id: number | string) => api.get(`/admin/store/order-requests/${id}`),
  patchOrderRequest: (id: number | string, data: { status: string }) =>
    api.patch(`/admin/store/order-requests/${id}`, data),
  getLeadStats: () => api.get('/admin/store/leads/stats'),
  getLeads: (params?: {
    channel?: string;
    status?: string;
    q?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/admin/store/leads', { params }),
  getLead: (id: number | string) => api.get(`/admin/store/leads/${id}`),
  patchLead: (id: number | string, data: { status?: string; notes?: string | null }) =>
    api.patch(`/admin/store/leads/${id}`, data),
};

// Content API functions (for products, categories, brands, etc.)
export const contentApi = {
  getProducts: (params?: {
    search?: string;
    is_active?: boolean;
    /** Only products flagged for homepage hero (public catalogue) */
    home_banner?: boolean;
  }) =>
    api.get('/content/products', {
      params: {
        ...params,
        home_banner: params?.home_banner === true ? 'true' : undefined,
      },
    }),
  getProduct: (id: string) =>
    api.get(`/content/products/${id}`),
  createProduct: (data: any) =>
    api.post('/content/products', data),
  updateProduct: (id: string, data: any) =>
    api.put(`/content/products/${id}`, data),
  deleteProduct: (id: string) =>
    api.delete(`/content/products/${id}`),
};

export default api;

