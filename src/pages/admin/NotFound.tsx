import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminNotFound() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const content = (
    <div className="max-w-xl w-full mx-auto bg-white shadow-md rounded-2xl px-6 py-8 border border-gray-100">
      <p className="text-sm font-semibold text-teal-600 mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Admin page not found</h1>
      <p className="text-sm text-gray-600 mb-6">
        The admin page you are looking for does not exist:{' '}
        <span className="font-mono text-gray-800 break-all">{location.pathname}</span>
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto inline-flex justify-center px-4 py-2.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Go back
        </button>
        {isAuthenticated ? (
          <Link
            to="/admin/dashboard"
            className="w-full sm:w-auto inline-flex justify-center px-5 py-2.5 rounded-full bg-teal-600 text-sm font-medium text-white hover:bg-teal-700 shadow-sm"
          >
            Go to dashboard
          </Link>
        ) : (
          <Link
            to="/admin/login"
            className="w-full sm:w-auto inline-flex justify-center px-5 py-2.5 rounded-full bg-teal-600 text-sm font-medium text-white hover:bg-teal-700 shadow-sm"
          >
            Go to admin login
          </Link>
        )}
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex justify-center px-4 py-2.5 rounded-full border border-transparent text-sm font-medium text-teal-700 hover:bg-teal-50"
        >
          Go to homepage
        </Link>
      </div>
    </div>
  );

  if (isAuthenticated) {
    return <AdminLayout title="Page not found">{content}</AdminLayout>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      {content}
    </div>
  );
}


