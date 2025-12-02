import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import BrandForm from '../../components/admin/BrandForm';

export default function BrandNew() {
  const navigate = useNavigate();

  return (
    <AdminLayout title="Add Brand">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Create new brand</h2>
        <button
          type="button"
          onClick={() => navigate('/admin/brands')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Back to list
        </button>
      </div>
      <BrandForm />
    </AdminLayout>
  );
}


