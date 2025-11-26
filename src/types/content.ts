// Comprehensive type definitions for all content types

export interface Location {
  id: string;
  name: string;
  slug: string;
  state: string;
  country: string;
  description: string;
  shortDescription: string;
  services: string[]; // Service IDs available in this location
  products: string[]; // Product IDs available in this location
  landmarks?: string[];
  coverageAreas?: string[];
  image?: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  stats?: {
    projectsCompleted?: number;
    customersServed?: number;
    yearsActive?: number;
  };
  testimonials?: string[]; // Testimonial IDs
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: 'cctv' | 'gps' | 'security' | 'maintenance' | 'accessories' | 'other';
  logoUrl?: string;
  localLogo?: string;
  website?: string;
  products: string[]; // Product IDs
  services: string[]; // Service IDs
  partnershipType: 'authorized-dealer' | 'partner' | 'distributor' | 'reseller';
  partnershipSince?: string;
  certifications?: string[];
  image?: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  features?: string[];
  warranty?: string;
  support?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  icon?: string;
  services: string[]; // Service IDs
  products: string[]; // Product IDs
  useCases?: Array<{
    title: string;
    description: string;
    image?: string;
  }>;
  caseStudies?: string[]; // Case study IDs
  testimonials?: string[]; // Testimonial IDs
  image?: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  stats?: {
    clientsServed?: number;
    projectsCompleted?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'service' | 'product' | 'both';
  description: string;
  shortDescription: string;
  parentCategory?: string; // For nested categories
  icon?: string;
  services?: string[]; // Service IDs
  products?: string[]; // Product IDs
  image?: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  industry: string; // Industry ID
  location: string; // Location ID
  services: string[]; // Service IDs
  products: string[]; // Product IDs
  brand?: string; // Brand ID
  client?: {
    name: string;
    type: string;
    logo?: string;
  };
  challenge: string;
  solution: string;
  results: Array<{
    metric: string;
    value: string;
    improvement?: string;
  }>;
  images?: string[];
  testimonial?: string; // Testimonial ID
  featured: boolean;
  publishedAt: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  location?: string; // Location ID
  industry?: string; // Industry ID
  service?: string; // Service ID
  product?: string; // Product ID
  rating: number;
  review: string;
  image?: string;
  featured: boolean;
  verified: boolean;
  publishedAt: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role?: string;
    image?: string;
  };
  category: string;
  tags: string[];
  featuredImage?: string;
  images?: string[];
  relatedServices?: string[]; // Service IDs
  relatedProducts?: string[]; // Product IDs
  relatedLocations?: string[]; // Location IDs
  published: boolean;
  featured: boolean;
  publishedAt: string;
  readingTime?: number; // in minutes
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'services' | 'products' | 'installation' | 'maintenance' | 'pricing' | 'warranty' | 'support';
  relatedService?: string; // Service ID
  relatedProduct?: string; // Product ID
  relatedLocation?: string; // Location ID
  order: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Generic content interface for template usage
export interface ContentItem {
  id: string;
  title?: string; // Optional - can use 'name' instead
  name?: string; // Alternative to title
  slug: string;
  description: string;
  shortDescription?: string;
  image?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  stats?: {
    projectsCompleted?: number;
    customersServed?: number;
    yearsActive?: number;
    clientsServed?: number;
  };
  [key: string]: any; // Allow additional properties
}

