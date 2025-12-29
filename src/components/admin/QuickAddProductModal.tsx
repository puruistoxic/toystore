import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { X, Plus } from 'lucide-react';
import MasterQuickAddModal from './MasterQuickAddModal';
import { useAlert } from '../../contexts/AlertContext';

interface QuickAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (product: any) => void;
}

export default function QuickAddProductModal({
  isOpen,
  onClose,
  onProductAdded
}: QuickAddProductModalProps) {
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    price_includes_gst: false,
    hsn_code: '',
    category: '',
    brand: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);

  // Fetch categories and brands
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/content/categories');
      return (response.data || []).map((c: any) => ({
        id: c.slug || c.id,
        name: c.name
      }));
    }
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await api.get('/content/brands');
      return (response.data || []).map((b: any) => ({
        id: b.slug || b.id,
        name: b.name
      }));
    }
  });

  const handleClose = () => {
    setFormData({
      name: '',
      price: '',
      price_includes_gst: false,
      hsn_code: '',
      category: '',
      brand: '',
      description: ''
    });
    setError(null);
    onClose();
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Let backend generate UUID - don't send ID from frontend
      // Generate slug from name (backend will also generate if not provided)
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const payload: any = {
        // Don't include id - let backend generate UUID
        name: data.name.trim(),
        slug: slug || undefined, // Let backend generate if empty
        is_active: true
      };
      
      // Only include fields that have values
      if (data.price && data.price.trim()) {
        const priceValue = parseFloat(data.price);
        if (!isNaN(priceValue)) {
          payload.price = priceValue;
        }
      }
      
      // Include price_includes_gst if explicitly set
      if (data.price_includes_gst !== undefined) {
        payload.price_includes_gst = data.price_includes_gst;
      }
      
      if (data.hsn_code && data.hsn_code.trim()) {
        payload.hsn_code = data.hsn_code.trim();
      }
      
      if (data.category && data.category.trim()) {
        payload.category = data.category.trim();
      }
      
      if (data.brand && data.brand.trim()) {
        payload.brand = data.brand.trim();
      }
      
      if (data.description && data.description.trim()) {
        payload.description = data.description.trim();
        payload.short_description = data.description.trim();
      }

      console.log('[QuickAddProductModal] Creating product with payload:', payload);
      const response = await api.post('/content/products', payload);
      console.log('[QuickAddProductModal] Product creation response:', response.data);
      return response.data;
    },
    onSuccess: async (responseData) => {
      try {
        console.log('[QuickAddProductModal] Product created successfully, responseData:', responseData);
        
        // Invalidate products query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
        queryClient.invalidateQueries({ queryKey: ['products', 'search'] });
        
        // Wait a brief moment for database to commit
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Try to fetch the created product by ID
        const productId = responseData?.id;
        if (productId) {
          try {
            console.log('[QuickAddProductModal] Fetching product by ID:', productId);
            const response = await api.get(`/content/products/${productId}`);
            if (response.data) {
              console.log('[QuickAddProductModal] Product fetched successfully:', response.data);
              onProductAdded(response.data);
              handleClose();
              return;
            } else {
              console.warn('[QuickAddProductModal] Product fetched but response.data is empty');
            }
          } catch (error: any) {
            console.warn('[QuickAddProductModal] Could not fetch created product by ID, trying search:', error);
            console.warn('[QuickAddProductModal] Error details:', error.response?.data || error.message);
          }
        } else {
          console.warn('[QuickAddProductModal] No ID in responseData:', responseData);
        }
        
        // Fallback: Try to fetch by searching for the product name
        try {
          console.log('[QuickAddProductModal] Searching for product by name:', formData.name.trim());
          const response = await api.get('/content/products', {
            params: { search: formData.name.trim(), is_active: true }
          });
          if (response.data && response.data.length > 0) {
            // Find the exact match (most recent)
            const found = response.data.find((p: any) => 
              p.name && p.name.trim().toLowerCase() === formData.name.trim().toLowerCase()
            );
            if (found) {
              console.log('[QuickAddProductModal] Product found by search:', found);
              onProductAdded(found);
              handleClose();
              return;
            }
            // If no exact match, use the first result
            if (response.data[0]) {
              console.log('[QuickAddProductModal] Using first search result:', response.data[0]);
              onProductAdded(response.data[0]);
              handleClose();
              return;
            }
          }
        } catch (error: any) {
          console.warn('[QuickAddProductModal] Could not fetch created product by search:', error);
        }
        
      // Final fallback: Use form data to construct product object
      // Use the ID from responseData (should be UUID from backend)
      const newProduct: any = {
        id: responseData?.id || null, // Backend should always return an ID
        name: formData.name.trim(),
        price: formData.price && formData.price.trim() ? parseFloat(formData.price) : 0,
        price_includes_gst: formData.price_includes_gst || false,
        hsn_code: formData.hsn_code && formData.hsn_code.trim() ? formData.hsn_code.trim() : null,
        description: formData.description && formData.description.trim() ? formData.description.trim() : null,
        category: formData.category && formData.category.trim() ? formData.category.trim() : null,
        brand: formData.brand && formData.brand.trim() ? formData.brand.trim() : null,
        is_active: true
      };
        
        // Ensure product has required fields for invoice/proposal forms
        if (!newProduct.price || isNaN(newProduct.price)) {
          newProduct.price = 0;
        }
        
        console.log('[QuickAddProductModal] Using fallback product object:', newProduct);
        onProductAdded(newProduct);
        handleClose();
      } catch (error: any) {
        console.error('[QuickAddProductModal] Error in onSuccess handler:', error);
        const errorMessage = error.message || 'Failed to process created product';
        setError(errorMessage);
        await showAlert({
          type: 'error',
          title: 'Error Processing Product',
          message: errorMessage
        });
      }
    },
    onError: async (error: any) => {
      console.error('[QuickAddProductModal] Product creation error:', error);
      console.error('[QuickAddProductModal] Error response:', error.response);
      console.error('[QuickAddProductModal] Error response data:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to create product';
      setError(errorMessage);
      await showAlert({
        type: 'error',
        title: 'Error Creating Product',
        message: errorMessage
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    createMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add New Product</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HSN Code
              </label>
              <input
                type="text"
                value={formData.hsn_code}
                onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                maxLength={20}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="priceIncludesGst"
              type="checkbox"
              checked={formData.price_includes_gst}
              onChange={(e) => setFormData({ ...formData, price_includes_gst: e.target.checked })}
              className="h-4 w-4 text-teal-600 border-gray-300 rounded"
            />
            <label htmlFor="priceIncludesGst" className="text-sm text-gray-700">
              Price includes GST
            </label>
            <span className="text-xs text-gray-500 ml-2">
              (Check if the product price already includes GST)
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <div className="flex gap-2">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-teal-600 hover:text-teal-700 transition-colors flex-shrink-0"
                title="Add new category"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <div className="flex gap-2">
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select brand</option>
                {brands.map((br: any) => (
                  <option key={br.id} value={br.id}>
                    {br.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowBrandModal(true)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-teal-600 hover:text-teal-700 transition-colors flex-shrink-0"
                title="Add new brand"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      {/* Category quick-add modal */}
      {showCategoryModal && (
        <MasterQuickAddModal
          title="Add Category"
          onClose={() => setShowCategoryModal(false)}
          onCreated={async (id, name) => {
            setFormData((prev) => ({ ...prev, category: id }));
            setShowCategoryModal(false);
            // Refresh categories list
            queryClient.invalidateQueries({ queryKey: ['categories'] });
          }}
          endpoint="/content/categories"
        />
      )}

      {/* Brand quick-add modal */}
      {showBrandModal && (
        <MasterQuickAddModal
          title="Add Brand"
          onClose={() => setShowBrandModal(false)}
          onCreated={async (id, name) => {
            setFormData((prev) => ({ ...prev, brand: id }));
            setShowBrandModal(false);
            // Refresh brands list
            queryClient.invalidateQueries({ queryKey: ['brands'] });
          }}
          endpoint="/content/brands"
        />
      )}
    </div>
  );
}








