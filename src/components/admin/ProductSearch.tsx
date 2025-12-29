import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { Search, Plus, X } from 'lucide-react';
import { hybridSearch } from '../../utils/fuzzySearch';

interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price?: number;
  hsn_code?: string;
  category?: string;
  brand?: string;
  is_active?: boolean;
}

interface ProductSearchProps {
  value: string;
  onChange: (product: Product | null) => void;
  onAddNew?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function ProductSearch({
  value,
  onChange,
  onAddNew,
  placeholder = 'Search products...',
  className = '',
  disabled = false
}: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'search', searchTerm],
    queryFn: async () => {
      const response = await api.get('/content/products', {
        params: { 
          search: searchTerm || undefined,
          is_active: true,
          exclude_services: 'false' // Include all products, don't filter services
        }
      });
      return response.data || [];
    },
    enabled: isOpen,
    staleTime: 0, // Always refetch to get latest products
    refetchOnMount: true
  });

  // Load all products for initial display
  const { data: allProducts = [] } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const response = await api.get('/content/products', {
        params: {
          exclude_services: 'false' // Include all products, don't filter services
        }
      });
      return (response.data || []).filter((p: Product) => p.is_active !== false);
    },
    staleTime: 0, // Always refetch to get latest products
    refetchOnMount: true
  });

  useEffect(() => {
    // Sync with external value prop
    if (value) {
      // Check if current selection matches the value
      const currentMatches = selectedProduct && (
        selectedProduct.name === value || 
        selectedProduct.id === value || 
        selectedProduct.slug === value
      );
      
      if (currentMatches) {
        // Already synced, ensure searchTerm matches
        if (searchTerm !== selectedProduct.name) {
          setSearchTerm(selectedProduct.name);
        }
        return;
      }
      
      // Try to find the product in allProducts
      const found = allProducts.find((p: Product) => 
        p.name === value || p.id === value || p.slug === value
      );
      
      if (found) {
        setSelectedProduct(found);
        setSearchTerm(found.name);
      } else {
        // Product not found in list yet, but value is set - show the value
        // This happens when a new product is just created
        setSearchTerm(value);
        // Keep selectedProduct as null for now, it will be set when products refresh
      }
    } else {
      // Value is empty, clear selection
      if (selectedProduct || searchTerm) {
        setSelectedProduct(null);
        setSearchTerm('');
      }
    }
  }, [value, allProducts]); // Watch allProducts array for changes

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setIsOpen(false);
    onChange(product);
  };

  const handleClear = () => {
    setSelectedProduct(null);
    setSearchTerm('');
    onChange(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    
    // If cleared, reset selection
    if (!term) {
      setSelectedProduct(null);
      onChange(null);
    }
  };

  // Apply fuzzy search to products for better matching
  const displayProducts = useMemo(() => {
    if (searchTerm.length >= 1) {
      // Use hybrid search for better multi-word and typo tolerance
      const searchFields: (keyof Product)[] = ['name', 'description', 'category', 'brand', 'hsn_code'];
      return hybridSearch(products, searchTerm, searchFields).slice(0, 20);
    }
    return isOpen ? allProducts.slice(0, 10) : [];
  }, [searchTerm, products, allProducts, isOpen]);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={selectedProduct ? selectedProduct.name : (value || searchTerm || '')}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
          {selectedProduct && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {onAddNew && !disabled && (
            <button
              type="button"
              onClick={onAddNew}
              className="p-1 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded"
              title="Add new product"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {isLoading && searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
          ) : displayProducts.length > 0 ? (
            <ul className="py-1">
              {displayProducts.map((product: Product) => (
                <li
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="px-4 py-2.5 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate mb-1">
                        {product.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-1">
                        {product.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            {product.category}
                          </span>
                        )}
                        {product.brand && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                            {product.brand}
                          </span>
                        )}
                        {product.hsn_code && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                            HSN: {product.hsn_code}
                          </span>
                        )}
                      </div>
                      {product.description && (
                        <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No products found. {onAddNew && (
                <button
                  type="button"
                  onClick={onAddNew}
                  className="text-teal-600 hover:text-teal-700 font-medium ml-1"
                >
                  Add new product
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              Start typing to search products
            </div>
          )}
        </div>
      )}
    </div>
  );
}









