import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductForm from '../../components/admin/ProductForm';

export default function ProductNew() {
  const navigate = useNavigate();

  return (
    <AdminLayout title="Add Product">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Create new product</h2>
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Back to list
        </button>
      </div>
      <ProductForm />
    </AdminLayout>
  );
}


