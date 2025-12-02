import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Package,
  ShoppingBag,
  MapPin,
  Award,
  Building2,
  FileText,
  MessageSquare,
  LogOut,
  Settings
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: 'Services',
      description: 'Manage services offered',
      icon: Package,
      link: '/admin/services',
      color: 'bg-blue-500'
    },
    {
      title: 'Products',
      description: 'Manage product catalog',
      icon: ShoppingBag,
      link: '/admin/products',
      color: 'bg-green-500'
    },
    {
      title: 'Locations',
      description: 'Manage service locations',
      icon: MapPin,
      link: '/admin/locations',
      color: 'bg-purple-500'
    },
    {
      title: 'Brands',
      description: 'Manage brand partnerships',
      icon: Award,
      link: '/admin/brands',
      color: 'bg-yellow-500'
    },
    {
      title: 'Industries',
      description: 'Manage industry sectors',
      icon: Building2,
      link: '/admin/industries',
      color: 'bg-indigo-500'
    },
    {
      title: 'Case Studies',
      description: 'Manage case studies',
      icon: FileText,
      link: '/admin/case-studies',
      color: 'bg-pink-500'
    },
    {
      title: 'Testimonials',
      description: 'Manage customer testimonials',
      icon: MessageSquare,
      link: '/admin/testimonials',
      color: 'bg-teal-500'
    }
  ];

  return (
    <AdminLayout title="Admin Dashboard">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-4 space-y-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Content Management</h2>
          <p className="text-gray-600">
            Manage all components of your website from here. Select a section to get started.
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.link}
                to={item.link}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-teal-300 transition-all group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${item.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/services/new"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-center font-medium hover:bg-teal-700 transition-colors"
            >
              Add New Service
            </Link>
            <Link
              to="/admin/products/new"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-center font-medium hover:bg-teal-700 transition-colors"
            >
              Add New Product
            </Link>
            <Link
              to="/admin/testimonials/new"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-center font-medium hover:bg-teal-700 transition-colors"
            >
              Add New Testimonial
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

