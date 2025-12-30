import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import TemplateForm from '../../components/admin/TemplateForm';

export default function TemplateEdit() {
  const navigate = useNavigate();

  return (
    <AdminLayout title="Edit Template">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Edit template</h2>
        <button
          type="button"
          onClick={() => navigate('/admin/templates')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Back to list
        </button>
      </div>
      <TemplateForm />
    </AdminLayout>
  );
}


