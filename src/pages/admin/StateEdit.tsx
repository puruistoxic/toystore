import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import StateForm from '../../components/admin/StateForm';

export default function StateEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return null;
  }

  return (
    <AdminLayout title="Edit State">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Edit state</h2>
        <button
          type="button"
          onClick={() => navigate('/admin/states')}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Back to list
        </button>
      </div>
      <StateForm stateId={id} />
    </AdminLayout>
  );
}







