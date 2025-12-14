import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { Search, Plus, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
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
}

export default function ProductSearch({
  value,
  onChange,
  onAddNew,
  placeholder = 'Search products...',
  className = ''
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
          is_active: true 
        }
      });
      return response.data || [];
    },
    enabled: isOpen,
    staleTime: 30000
  });

  // Load all products for initial display
  const { data: allProducts = [] } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const response = await api.get('/content/products');
      return (response.data || []).filter((p: Product) => p.is_active !== false);
    },
    staleTime: 60000
  });

  useEffect(() => {
    // If value is set but no product selected, try to find it
    if (value && !selectedProduct) {
      const found = allProducts.find((p: Product) => p.name === value || p.id === value);
      if (found) {
        setSelectedProduct(found);
      }
    }
  }, [value, allProducts, selectedProduct]);

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

  const displayProducts = searchTerm.length >= 1 ? products.slice(0, 20) : (isOpen ? allProducts.slice(0, 10) : []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={selectedProduct ? selectedProduct.name : searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
          {selectedProduct && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {onAddNew && (
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

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {isLoading && searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
          ) : displayProducts.length > 0 ? (
            <ul className="py-1">
              {displayProducts.map((product: Product) => (
                <li
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="px-4 py-2 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </div>
                      {product.category && (
                        <div className="text-xs text-gray-500">
                          {product.category} {product.brand && `• ${product.brand}`}
                        </div>
                      )}
                      {product.price && (
                        <div className="text-xs text-gray-600 mt-1">
                          ₹{product.price.toLocaleString('en-IN')}
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
