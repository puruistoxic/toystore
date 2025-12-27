import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Camera,
  Navigation,
  Wrench,
  Search,
  Star,
  MessageCircle,
  Eye,
  CheckCircle,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import { contentApi } from '../utils/api';
import type { Product } from '../types/catalog';
import SEO from '../components/SEO';
import { getPlaceholderImage, handleImageError } from '../utils/imagePlaceholder';
import QuoteRequestModal from '../components/QuoteRequestModal';
import { hybridSearch } from '../utils/fuzzySearch';

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

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug || dbProduct.id,
    description: dbProduct.description || dbProduct.short_description || 'Professional IT solution',
    price: dbProduct.price || 0,
    originalPrice: undefined, // No pricing displayed
    images: images,
    category: dbProduct.category || 'accessories',
    brand: dbProduct.brand || 'WAINSO',
    model: specifications.model || specifications.Model || dbProduct.name,
    inStock: true, // Default to in stock if not specified
    stockQuantity: 0, // Not tracked in current schema
    rating: 4.5, // Default rating
    reviews: 0, // Default reviews
    features: features,
    specifications: specifications,
    warranty: dbProduct.warranty || undefined
  };
}

const Products: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
    { id: 'erp', name: 'ERP & Connectors' },
    { id: 'software', name: 'Software & Licenses' },
    { id: 'hardware', name: 'Laptops & Servers' },
    { id: 'networking', name: 'Networking' },
    { id: 'security', name: 'Security & CCTV' }
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
        title="IT & ERP Products - Hardware, Networking, Software, Security | WAINSO"
        description="IT procurement with implementation support: laptops, servers, firewalls, Wi‑Fi, ERP suites, software licenses, CCTV kits, and connectors. Delivered and supported across India."
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
              Curated IT and security stack: hardware, networking, software, ERP, and CCTV with deployment-ready support.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product: Product) => {
            return (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {product.images && product.images.length > 0 && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => handleImageError(e, product.name)}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 px-2 text-center">{product.name}</p>
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Category and Brand Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {product.category && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {product.category}
                    </span>
                  )}
                  {product.brand && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.brand}
                    </span>
                  )}
                  {product.model && product.model !== product.name && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {product.model}
                    </span>
                  )}
                </div>

                {/* Product Name */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {product.features.slice(0, 3).map((feature: string, index: number) => (
                      <li key={index} className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/products/${product.slug}`}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center flex items-center justify-center shadow-sm hover:shadow-md"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setQuoteModalOpen(true);
                    }}
                    className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Request Quote
                  </button>
                </div>
              </div>
              </div>
            );
          })}
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

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={quoteModalOpen}
        onClose={() => {
          setQuoteModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct || undefined}
        productId={selectedProduct?.id ? selectedProduct.id.toString() : undefined}
      />
    </div>
    </>
  );
};

export default Products;
