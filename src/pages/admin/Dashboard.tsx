import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { invoicingApi } from '../../utils/api';
import InvoiceStats from '../../components/admin/InvoiceStats';
import SalesTrend from '../../components/admin/SalesTrend';
import {
  Users,
  Plus,
  AlertCircle,
  DollarSign
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [period, setPeriod] = useState(30);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-stats', period],
    queryFn: async () => {
      const response = await invoicingApi.getDashboardStats(period);
      return response.data;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <AdminLayout title="Admin Dashboard">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-4 space-y-8">
        {/* Invoice Statistics Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invoice Overview</h2>
              <p className="text-sm text-gray-600 mt-1">Summary of your invoicing activity</p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <Link
                to="/admin/invoices/new"
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="mt-2 text-gray-600">Loading statistics...</p>
            </div>
          ) : dashboardData ? (
            <>
              <InvoiceStats stats={dashboardData.invoices} />
              
              {/* Sales Trend and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <SalesTrend data={dashboardData.sales_trend || []} />
                
                {/* Recent Invoices */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
                    <Link
                      to="/admin/invoices"
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      View All
                    </Link>
                  </div>
                  {dashboardData.recent_invoices && dashboardData.recent_invoices.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.recent_invoices.map((invoice: any) => (
                        <Link
                          key={invoice.id}
                          to={`/admin/invoices/${invoice.id}/edit`}
                          className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-teal-300 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {invoice.invoice_number}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {invoice.client_name || 'N/A'} • {invoice.title}
                              </p>
                            </div>
                            <div className="ml-4 text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(invoice.total)}
                              </p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {invoice.status}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No recent invoices
                    </div>
                  )}
                </div>
              </div>

              {/* Overdue Invoices Alert */}
              {dashboardData.overdue_invoices && dashboardData.overdue_invoices.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Overdue Invoices ({dashboardData.overdue_invoices.length})
                      </h3>
                    </div>
                    <Link
                      to="/admin/invoices?status=overdue"
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {dashboardData.overdue_invoices.slice(0, 5).map((invoice: any) => {
                      const outstanding = (invoice.total || 0) - (invoice.paid_amount || 0);
                      return (
                        <Link
                          key={invoice.id}
                          to={`/admin/invoices/${invoice.id}/edit`}
                          className="block p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900">
                                  {invoice.invoice_number}
                                </p>
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                  {invoice.days_overdue} days overdue
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {invoice.client_name || 'N/A'} • Due: {new Date(invoice.due_date).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                            <div className="ml-4 text-right">
                              <p className="text-sm font-semibold text-red-600">
                                {formatCurrency(outstanding)} due
                              </p>
                              <p className="text-xs text-gray-500">
                                Total: {formatCurrency(invoice.total)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Invoice Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Invoice Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link
                    to="/admin/invoices/new"
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-all group"
                  >
                    <div className="bg-teal-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New Invoice</p>
                      <p className="text-xs text-gray-500">Create a new invoice</p>
                    </div>
                  </Link>
                  <Link
                    to="/admin/invoices?status=overdue"
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all group"
                  >
                    <div className="bg-red-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Overdue</p>
                      <p className="text-xs text-gray-500">View overdue invoices</p>
                    </div>
                  </Link>
                  <Link
                    to="/admin/invoices?status=paid"
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all group"
                  >
                    <div className="bg-green-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Paid Invoices</p>
                      <p className="text-xs text-gray-500">View paid invoices</p>
                    </div>
                  </Link>
                  <Link
                    to="/admin/clients/new"
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all group"
                  >
                    <div className="bg-blue-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New Client</p>
                      <p className="text-xs text-gray-500">Add a new client</p>
                    </div>
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}

