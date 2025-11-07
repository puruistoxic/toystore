import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Navigation,
  Wrench,
  Search,
  Star,
  MessageCircle,
  Eye,
  CheckCircle
} from 'lucide-react';
import { products } from '../data/products';
import type { Product } from '../types/catalog';
import SEO from '../components/SEO';

const Products: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'cctv', name: 'CCTV Equipment' },
    { id: 'gps', name: 'GPS Trackers' },
    { id: 'security', name: 'Security Systems' },
    { id: 'maintenance', name: 'Maintenance' },
    { id: 'accessories', name: 'Accessories' }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.brand.toLowerCase().includes(search) ||
        product.model.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <>
      <SEO
        title="Security Products - CCTV Cameras, GPS Trackers, Security Systems in Ramgarh, Jharkhand"
        description="Buy CCTV cameras, GPS trackers, security lockers, video door phones from CP Plus, Hikvision, Panasonic, Godrej in Ramgarh, Jharkhand. Authorized dealers with warranty."
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
              High-quality security and tracking equipment from leading brands - CP Plus, Hikvision, Panasonic, Godrej, and more
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const quoteLink = `/quote-request?type=product&id=${product.id}`;

            return (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Product Image */}
              <div className="relative h-48 bg-gray-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-400">
                    {product.category === 'cctv' && <Camera className="h-16 w-16" />}
                    {product.category === 'gps' && <Navigation className="h-16 w-16" />}
                    {product.category === 'maintenance' && <Wrench className="h-16 w-16" />}
                  </div>
                </div>
                {!product.inStock && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Out of Stock
                  </div>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Sale
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Brand and Rating */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{product.brand}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                </div>

                {/* Product Name */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Price */}
                <div className="flex items-center mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-gray-500 line-through ml-2">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center mb-4">
                  {product.inStock ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">In Stock ({product.stockQuantity})</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <span className="text-sm">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {product.features.slice(0, 3).map((feature, index) => (
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
                  <Link
                    to={quoteLink}
                    className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Request Quote
                  </Link>
                </div>
              </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
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
