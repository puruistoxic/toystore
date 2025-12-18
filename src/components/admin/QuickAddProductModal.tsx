import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { X, Plus } from 'lucide-react';
import MasterQuickAddModal from './MasterQuickAddModal';

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
  const [formData, setFormData] = useState({
    name: '',
    price: '',
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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Generate ID (required by backend)
      const id = Date.now().toString();
      
      // Generate slug from name
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `product-${id}`;
      
      const payload = {
        id: id,
        name: data.name.trim(),
        slug: slug,
        price: data.price && data.price.trim() ? parseFloat(data.price) : null,
        hsn_code: data.hsn_code && data.hsn_code.trim() ? data.hsn_code.trim() : null,
        category: data.category && data.category.trim() ? data.category.trim() : null,
        brand: data.brand && data.brand.trim() ? data.brand.trim() : null,
        description: data.description && data.description.trim() ? data.description.trim() : null,
        short_description: data.description && data.description.trim() ? data.description.trim() : null,
        is_active: true
      };

      const response = await api.post('/content/products', payload);
      return response.data;
    },
    onSuccess: async (responseData) => {
      // Invalidate products query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Try to fetch the created product by ID
      if (responseData.id) {
        try {
          const response = await api.get(`/content/products/${responseData.id}`);
          onProductAdded(response.data);
          handleClose();
          return;
        } catch (error) {
          console.warn('Could not fetch created product by ID, trying search');
        }
      }
      
      // Fallback: Try to fetch by searching for the product name
      try {
        const response = await api.get('/content/products', {
          params: { search: formData.name, is_active: true }
        });
        if (response.data && response.data.length > 0) {
          // Find the exact match (most recent)
          const found = response.data.find((p: any) => p.name === formData.name);
          if (found) {
            onProductAdded(found);
            handleClose();
            return;
          }
        }
      } catch (error) {
        console.warn('Could not fetch created product, using form data');
      }
      
      // Final fallback: Use form data to construct product object
      const newProduct = {
        id: responseData.id || Date.now().toString(),
        name: formData.name,
        price: formData.price ? parseFloat(formData.price) : null,
        hsn_code: formData.hsn_code || null,
        description: formData.description || null,
        category: formData.category || null,
        brand: formData.brand || null
      };
      
      onProductAdded(newProduct);
      handleClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'Failed to create product');
    }
  });

  const handleClose = () => {
    setFormData({
      name: '',
      price: '',
      hsn_code: '',
      category: '',
      brand: '',
      description: ''
    });
    setError(null);
    onClose();
  };

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


