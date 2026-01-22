import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search
} from 'lucide-react';
import { contentApi } from '../utils/api';
import type { Product } from '../types/catalog';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import { hybridSearch } from '../utils/fuzzySearch';
import { getPlaceholderImage } from '../utils/imagePlaceholder';

// Smart function to determine if an item is a service (not a product)
function isServiceItem(dbProduct: any): boolean {
  const name = (dbProduct.name || '').toLowerCase();
  const category = (dbProduct.category || '').toLowerCase();
  const description = (dbProduct.description || '').toLowerCase();
  
  // Service indicators in name
  const serviceKeywords = [
    'installation',
    'service',
    'visit charge',
    'visit',
    'maintenance',
    'repair',
    'consultation',
    'support',
    'setup',
    'configuration',
    'training',
    'amc',
    'annual maintenance'
  ];
  
  // Service categories
  const serviceCategories = [
    'installation service',
    'maintenance service',
    'visit charge',
    'software service',
    'internet service',
    'service'
  ];
  
  // Check if name contains service keywords
  if (serviceKeywords.some(keyword => name.includes(keyword))) {
    return true;
  }
  
  // Check if category is a service category
  if (serviceCategories.some(cat => category.includes(cat))) {
    return true;
  }
  
  // Check if description strongly indicates a service
  if (description.includes('service') && (
    description.includes('installation') ||
    description.includes('visit') ||
    description.includes('maintenance') ||
    description.includes('support')
  )) {
    return true;
  }
  
  return false;
}

// Map database product to frontend Product interface
function mapDbProductToFrontend(dbProduct: any): Product {
  const images = dbProduct.images ? (Array.isArray(dbProduct.images) ? dbProduct.images : [dbProduct.images]) : [];
  if (dbProduct.image && !images.includes(dbProduct.image)) {
    images.unshift(dbProduct.image);
  }
  if (images.length === 0 || !images[0] || images[0].trim() === '') {
    images.push(getPlaceholderImage(400, 300, dbProduct.name || 'Product'));
  }

  const features = dbProduct.features ? (Array.isArray(dbProduct.features) ? dbProduct.features : []) : [];
  const specifications = dbProduct.specifications ? (typeof dbProduct.specifications === 'object' ? dbProduct.specifications : {}) : {};

  // Parse occasion from JSON if it's a string
  let occasion: string[] = [];
  if (dbProduct.occasion) {
    if (typeof dbProduct.occasion === 'string') {
      try {
        occasion = JSON.parse(dbProduct.occasion);
      } catch {
        occasion = [dbProduct.occasion];
      }
    } else if (Array.isArray(dbProduct.occasion)) {
      occasion = dbProduct.occasion;
    }
  }

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug || dbProduct.id,
    description: dbProduct.description || dbProduct.short_description || 'High-quality toy product',
    price: dbProduct.price || 0,
    originalPrice: undefined, // No pricing displayed
    images: images,
    category: dbProduct.category || 'toys',
    brand: dbProduct.brand || 'Khandelwal Toy Store',
    model: specifications.model || specifications.Model || dbProduct.name,
    inStock: dbProduct.stock_quantity ? dbProduct.stock_quantity > 0 : true,
    stockQuantity: dbProduct.stock_quantity || 0,
    rating: 4.5, // Default rating
    reviews: 0, // Default reviews
    features: features,
    specifications: specifications,
    warranty: dbProduct.warranty || undefined,
    // Toy-specific fields
    ageGroup: dbProduct.age_group,
    occasion: occasion,
    gender: dbProduct.gender,
    materialType: dbProduct.material_type,
    educationalValue: dbProduct.educational_value || false,
    minimumOrderQuantity: dbProduct.minimum_order_quantity || 1,
    bulkDiscountPercentage: dbProduct.bulk_discount_percentage || 0,
    sku: dbProduct.sku
  };
}

const Products: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch products from database
  const { data: dbProducts = [], isLoading, error } = useQuery({
    queryKey: ['products', 'public'],
    queryFn: async () => {
      const response = await contentApi.getProducts({ is_active: true });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Map database products to frontend format and filter out services
  const products = useMemo(() => {
    return dbProducts
      .filter((dbProduct: any) => !isServiceItem(dbProduct)) // Filter out services
      .map(mapDbProductToFrontend);
  }, [dbProducts]);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'action-figures', name: 'Action Figures' },
    { id: 'art-crafts', name: 'Art and Crafts' },
    { id: 'baby-rattles', name: 'Baby Rattles' },
    { id: 'bath-toys', name: 'Bath Toys' },
    { id: 'card-board-games', name: 'Card & Board Games' },
    { id: 'doll-doll-house', name: 'Doll & Doll House' },
    { id: 'drone', name: 'Drone' },
    { id: 'educational-learning', name: 'Educational & Learning Toys' },
    { id: 'electric-ride-ons', name: 'Electric Ride Ons' },
    { id: 'manual-ride-ons', name: 'Manual Ride Ons' },
    { id: 'metal-toys', name: 'Metal Toys' },
    { id: 'musical-toys', name: 'Musical Toys' },
    { id: 'musical-instruments', name: 'Musical Instruments' },
    { id: 'remote-control', name: 'Remote Control Toys' },
    { id: 'role-play-set', name: 'Role Play Set' },
    { id: 'soft-toys', name: 'Soft Toys' },
    { id: 'sports-toys', name: 'Sports Toys' },
    { id: 'train-set', name: 'Train Set' },
    { id: 'vehicles-pull-back', name: 'Vehicles & Pull Back' },
    { id: 'wooden-toys', name: 'Wooden Toys' }
  ];

  const filteredProducts = useMemo(() => {
    // First filter by category
    let filtered = products.filter((product: Product) => {
      return selectedCategory === 'all' || product.category === selectedCategory;
    });
    
    // Then apply smart fuzzy search
    if (searchTerm) {
      const searchFields: (keyof Product)[] = ['name', 'description', 'category', 'brand', 'model'];
      filtered = hybridSearch(filtered, searchTerm, searchFields);
    }
    
    return filtered;
  }, [products, selectedCategory, searchTerm]);

  return (
    <>
      <SEO
        title="Wholesale Toys - Action Figures, Educational Toys, Board Games | Khandelwal Toy Store"
        description="Khandelwal Toy Store - Wholesale toy supplier. Wide range of toys including action figures, educational toys, board games, remote control toys, and more. Best wholesale prices with bulk discounts."
        path="/products"
      />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Our Products
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Discover our wide range of high-quality toys for all ages. Best wholesale prices with bulk discounts.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <p className="font-semibold">Error loading products</p>
              <p className="text-sm text-gray-600 mt-2">Please try again later</p>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                showBestSellerBadge={false}
              />
            ))}
          </div>
        )}

        {!isLoading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Products;
