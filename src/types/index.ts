export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: 'cctv' | 'gps' | 'maintenance' | 'accessories';
  inStock: boolean;
  stockQuantity: number;
  specifications?: Record<string, string>;
  features: string[];
  brand: string;
  model: string;
  warranty: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: 'cctv-installation' | 'gps-installation' | 'maintenance' | 'repair' | 'consultation';
  images: string[];
  features: string[];
  includes: string[];
  requirements: string[];
  availability: 'available' | 'limited' | 'unavailable';
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId?: string;
  serviceId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  type: 'product' | 'service';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: User['address'];
  paymentMethod: 'cash' | 'card' | 'upi' | 'netbanking';
  createdAt: string;
  updatedAt: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  service?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
