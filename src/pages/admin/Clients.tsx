import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { invoicingApi } from '../../utils/api';
import { Client } from '../../types/invoicing';
import { Plus, Search, Edit, Trash2, Users, Mail, Phone, Building2 } from 'lucide-react';
import { useAlert } from '../../contexts/AlertContext';

export default function AdminClients() {
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useAlert();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', statusFilter, search],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const response = await invoicingApi.getClients(params);
      return response.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoicingApi.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  });

  const handleDelete = async (client: Client) => {
    const confirmed = await showConfirm({
      title: 'Delete Client',
      message: `Are you sure you want to delete ${client.name}?`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(client.id);
      } catch (error: any) {
        await showAlert({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.message || 'Failed to delete client'
        });
      }
    }
  };

  return (
    <AdminLayout title="Clients">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your client database</p>
          </div>
          <Link
            to="/admin/clients/new"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors touch-manipulation text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Clients List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-gray-600">Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first client</p>
            <Link
              to="/admin/clients/new"
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client: Client) => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 xl:px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-3 flex-shrink-0">
                              <span className="text-teal-600 font-semibold text-sm">
                                {client.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{client.name}</div>
                              {client.company && (
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                  <Building2 className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                  <span className="truncate">{client.company}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {client.email && (
                              <div className="flex items-center mb-1">
                                <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{client.email}</span>
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center">
                                <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{client.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              client.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : client.status === 'inactive'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 xl:px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1 xl:space-x-2">
                            <Link
                              to={`/admin/clients/${client.id}/edit`}
                              className="p-1.5 xl:p-2 text-teal-600 hover:text-teal-900 hover:bg-teal-50 rounded-md touch-manipulation transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(client)}
                              className="p-1.5 xl:p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md touch-manipulation transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tablet/Mobile Card View */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
              {clients.map((client: Client) => (
                <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex items-center flex-1 min-w-0 pr-2">
                      <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-teal-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-teal-600 font-semibold text-sm sm:text-base">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">{client.name}</div>
                        {client.company && (
                          <div className="text-xs sm:text-sm text-gray-500 flex items-center mt-1">
                            <Building2 className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                            <span className="truncate">{client.company}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                        client.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : client.status === 'inactive'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </span>
                  </div>
                  
                  {(client.email || client.phone) && (
                    <div className="space-y-2 mb-3 sm:mb-4">
                      {client.email && (
                        <a
                          href={`mailto:${client.email}`}
                          className="flex items-center text-sm text-gray-700 hover:text-teal-600 transition-colors"
                        >
                          <Mail className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </a>
                      )}
                      {client.phone && (
                        <a
                          href={`tel:${client.phone}`}
                          className="flex items-center text-sm text-gray-700 hover:text-teal-600 transition-colors"
                        >
                          <Phone className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{client.phone}</span>
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    <Link
                      to={`/admin/clients/${client.id}/edit`}
                      className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-teal-600 hover:text-teal-900 hover:bg-teal-50 rounded-md touch-manipulation transition-colors min-w-[80px] sm:min-w-[100px]"
                    >
                      <Edit className="w-4 h-4 mr-1.5" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(client)}
                      className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md touch-manipulation transition-colors min-w-[80px] sm:min-w-[100px]"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
