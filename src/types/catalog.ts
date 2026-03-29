export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  /** YouTube (or youtu.be) links; playable in product modal / detail */
  videoUrls?: string[];
  /** Homepage hero slide ids (`1`–`4`) where this product appears in “In focus” */
  homeBannerSlides?: string[];
  category: string;
  brand: string;
  model: string;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviews: number;
  features: string[];
  specifications: Record<string, string>;
  warranty?: string;
  // Toy-specific fields
  ageGroup?: string;
  occasion?: string[];
  gender?: 'boys' | 'girls' | 'unisex' | 'all';
  materialType?: string;
  educationalValue?: boolean;
  minimumOrderQuantity?: number;
  bulkDiscountPercentage?: number;
  sku?: string;
  priceIncludesGst?: boolean;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  iconName: 'Camera' | 'Navigation' | 'Settings' | 'Wrench' | 'MessageCircle';
  features: string[];
  includes: string[];
}

