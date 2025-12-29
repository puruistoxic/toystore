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
};

// Invoicing API functions
export const invoicingApi = {
  // Clients
  getClients: (params?: { status?: string; search?: string }) => 
    api.get('/invoicing/clients', { params }),
  getClient: (id: string) => 
    api.get(`/invoicing/clients/${id}`),
  createClient: (data: any) => 
    api.post('/invoicing/clients', data),
  updateClient: (id: string, data: any) => 
    api.put(`/invoicing/clients/${id}`, data),
  deleteClient: (id: string) => 
    api.delete(`/invoicing/clients/${id}`),

  // History
  getHistory: (entityType: 'proposal' | 'invoice' | 'client', entityId: string) =>
    api.get(`/invoicing/history/${entityType}/${entityId}`),

  // Proposals
  getProposals: (params?: { status?: string; client_id?: string; search?: string }) => 
    api.get('/invoicing/proposals', { params }),
  getProposal: (id: string) => 
    api.get(`/invoicing/proposals/${id}`),
  createProposal: (data: any) => 
    api.post('/invoicing/proposals', data),
  updateProposal: (id: string, data: any) => 
    api.put(`/invoicing/proposals/${id}`, data),
  deleteProposal: (id: string) => 
    api.delete(`/invoicing/proposals/${id}`),

  // Invoices
  getInvoices: (params?: { status?: string; client_id?: string; search?: string }) => 
    api.get('/invoicing/invoices', { params }),
  getInvoice: (id: string) => 
    api.get(`/invoicing/invoices/${id}`),
  createInvoice: (data: any) => 
    api.post('/invoicing/invoices', data),
  updateInvoice: (id: string, data: any) => 
    api.put(`/invoicing/invoices/${id}`, data),
  deleteInvoice: (id: string) => 
    api.delete(`/invoicing/invoices/${id}`),

  // Payments
  getPayments: (invoiceId: string) => 
    api.get(`/invoicing/invoices/${invoiceId}/payments`),
  createPayment: (invoiceId: string, data: any) => 
    api.post(`/invoicing/invoices/${invoiceId}/payments`, data),
  deletePayment: (invoiceId: string, paymentId: number) => 
    api.delete(`/invoicing/invoices/${invoiceId}/payments/${paymentId}`),

  // Reminders
  getReminders: (invoiceId: string) => 
    api.get(`/invoicing/invoices/${invoiceId}/reminders`),
  createReminder: (invoiceId: string, data: any) => 
    api.post(`/invoicing/invoices/${invoiceId}/reminders`, data),
  sendReminder: (invoiceId: string, reminderId?: number) => 
    reminderId 
      ? api.post(`/invoicing/invoices/${invoiceId}/reminders/${reminderId}/send`)
      : api.post(`/invoicing/invoices/${invoiceId}/send-reminder`),
  deleteReminder: (invoiceId: string, reminderId: number) => 
    api.delete(`/invoicing/invoices/${invoiceId}/reminders/${reminderId}`),

  // Dashboard
  getDashboardStats: (period?: number) => 
    api.get('/invoicing/dashboard/stats', { params: { period } }),
};

// Content API functions (for products, categories, brands, etc.)
export const contentApi = {
  getProducts: (params?: { search?: string; is_active?: boolean }) =>
    api.get('/content/products', { params }),
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

