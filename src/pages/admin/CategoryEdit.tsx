import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import CategoryForm from '../../components/admin/CategoryForm';

export default function CategoryEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return null;
  }

  return (
    <AdminLayout title="Edit Category">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Edit category</h2>
        <button
          type="button"
          onClick={() => navigate('/admin/categories')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Back to list
        </button>
      </div>
      <CategoryForm categoryId={id} />
    </AdminLayout>
  );
}


