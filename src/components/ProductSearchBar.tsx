import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { contentApi } from '../utils/api';
import { hybridSearch } from '../utils/fuzzySearch';
import { getPlaceholderImage } from '../utils/imagePlaceholder';
import type { Product } from '../types/catalog';

interface ProductSearchBarProps {
  isHomePage?: boolean;
  className?: string;
  onProductSelect?: () => void;
}

const ProductSearchBar: React.FC<ProductSearchBarProps> = ({ isHomePage = false, className = '', onProductSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Fetch products from database
  const { data: dbProducts = [], isLoading } = useQuery({
    queryKey: ['products', 'search', searchTerm],
    queryFn: async () => {
      const response = await contentApi.getProducts({ is_active: true });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter out services and map to Product type
  const products = React.useMemo(() => {
    return dbProducts
      .filter((p: any) => {
        // Filter out services
        const name = (p.name || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        const serviceKeywords = ['installation', 'service', 'visit charge', 'maintenance', 'repair', 'consultation'];
        return !serviceKeywords.some(keyword => name.includes(keyword) || category.includes(keyword));
      })
      .map((p: any): Product => {
        // Handle images array
        const images = p.images ? (Array.isArray(p.images) ? p.images : [p.images]) : [];
        if (p.image && !images.includes(p.image)) {
          images.unshift(p.image);
        }
        if (images.length === 0 || !images[0] || images[0].trim() === '') {
          images.push(getPlaceholderImage(400, 300, p.name || 'Product'));
        }

        // Handle features
        const features = p.features ? (Array.isArray(p.features) ? p.features : []) : [];
        
        // Handle specifications
        const specifications = p.specifications ? (typeof p.specifications === 'object' ? p.specifications : {}) : {};
        
        // Parse occasion from JSON if it's a string
        let occasion: string[] = [];
        if (p.occasion) {
          if (typeof p.occasion === 'string') {
            try {
              occasion = JSON.parse(p.occasion);
            } catch {
              occasion = [p.occasion];
            }
          } else if (Array.isArray(p.occasion)) {
            occasion = p.occasion;
          }
        }

        return {
          id: p.id,
          name: p.name,
          slug: p.slug || p.id,
          description: p.description || p.short_description || 'High-quality toy product',
          price: p.price ? parseFloat(p.price) : 0,
          originalPrice: undefined,
          images: images,
          category: p.category || 'toys',
          brand: p.brand || 'DigiDukaanLive',
          model: specifications.model || specifications.Model || p.name,
          inStock: p.stock_quantity ? p.stock_quantity > 0 : true,
          stockQuantity: p.stock_quantity || 0,
          rating: 4.5,
          reviews: 0,
          features: features,
          specifications: specifications,
          warranty: p.warranty || undefined,
          // Toy-specific fields
          ageGroup: p.age_group,
          occasion: occasion,
          gender: p.gender,
          materialType: p.material_type,
          educationalValue: p.educational_value || false,
          minimumOrderQuantity: p.minimum_order_quantity || 1,
          bulkDiscountPercentage: p.bulk_discount_percentage || 0,
          sku: p.sku,
          priceIncludesGst: p.price_includes_gst || false,
        };
      });
  }, [dbProducts]);

  // Apply search filter
  const filteredProducts = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }
    const searchFields: (keyof Product)[] = ['name', 'description', 'category', 'brand', 'ageGroup'];
    return hybridSearch(products, searchTerm, searchFields).slice(0, 8); // Show max 8 results
  }, [products, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || filteredProducts.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev < filteredProducts.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < filteredProducts.length) {
            handleSelectProduct(filteredProducts[focusedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, filteredProducts, focusedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.length > 0);
    setFocusedIndex(-1);
  };

  const handleSelectProduct = (product: Product) => {
    setSearchTerm('');
    setIsOpen(false);
    setFocusedIndex(-1);
    if (onProductSelect) {
      onProductSelect();
    }
    navigate(`/products/${product.slug}`);
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            <Search className={`h-5 w-5 ${isHomePage ? 'text-white/70' : 'text-gray-400'}`} />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchTerm.trim() && filteredProducts.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder="Search products..."
          className={`w-full pl-10 pr-10 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
            isHomePage
              ? 'bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-white/60 focus:ring-white/50 focus:border-white/40'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500'
          }`}
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className={`h-5 w-5 ${isHomePage ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          <div className="py-2">
            {filteredProducts.map((product, index) => (
              <button
                key={product.id}
                onClick={() => handleSelectProduct(product)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                  index === focusedIndex ? 'bg-gray-50' : ''
                } ${index === 0 ? '' : 'border-t border-gray-100'}`}
              >
                <div className="flex items-center space-x-3">
                  {product.images && product.images.length > 0 && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {product.category && (
                        <span className="capitalize">{product.category.replace(/-/g, ' ')}</span>
                      )}
                      {product.price > 0 && (
                        <span className="ml-2 font-semibold text-primary-600">
                          ₹{product.price.toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && searchTerm.trim() && !isLoading && filteredProducts.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-4 px-4">
          <p className="text-sm text-gray-500 text-center">No products found</p>
        </div>
      )}
    </div>
  );
};

export default ProductSearchBar;
