import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { invoicingApi, companySettingsApi } from '../../utils/api';
import { Proposal } from '../../types/invoicing';
import { Plus, Search, Edit, Trash2, FileText, Calendar, Download, Receipt } from 'lucide-react';
import { generateProposalPDF } from '../../utils/pdfGenerator';

export default function AdminProposals() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const handleConvertToInvoice = (proposal: Proposal) => {
    navigate(`/admin/invoices/new?proposal_id=${proposal.id}`);
  };

  const { data: proposals = [], isLoading } = useQuery<Proposal[]>({
    queryKey: ['proposals', statusFilter, search],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const response = await invoicingApi.getProposals(params);
      console.log('[Proposals Page] API Response:', response.data);
      if (response.data && response.data.length > 0) {
        console.log('[Proposals Page] First proposal from API:', {
          id: response.data[0].id,
          client_id: response.data[0].client_id,
          client_name: response.data[0].client_name,
          client_address: response.data[0].client_address,
          client_city: response.data[0].client_city,
          client_state: response.data[0].client_state,
          hasAddress: !!response.data[0].client_address,
          hasCity: !!response.data[0].client_city,
          hasState: !!response.data[0].client_state
        });
      }
      return response.data;
    },
    staleTime: 0 // Disable caching to always fetch fresh data
  });

  const { data: companySettings } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const response = await companySettingsApi.getSettings();
      return response.data;
    }
  });

  const handleDownloadPDF = async (proposal: Proposal) => {
    try {
      console.log('=== Downloading PDF for Proposal ===');
      console.log('Proposal from list:', proposal);
      console.log('Client Address:', proposal.client_address);
      console.log('Client City:', proposal.client_city);
      console.log('Client State:', proposal.client_state);
      console.log('====================================');
      const doc = await generateProposalPDF(proposal, companySettings || {});
      doc.save(`Proposal-${proposal.proposal_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoicingApi.deleteProposal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    }
  });

  const handleDelete = async (proposal: Proposal) => {
    if (window.confirm(`Are you sure you want to delete proposal ${proposal.proposal_number}?`)) {
      try {
        await deleteMutation.mutateAsync(proposal.id);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete proposal');
      }
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout title="Proposals">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Proposals</h2>
            <p className="text-sm text-gray-600 mt-1">Manage client proposals</p>
          </div>
          <Link
            to="/admin/proposals/new"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors touch-manipulation text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Proposal
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search proposals..."
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Proposals List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-gray-600">Loading proposals...</p>
          </div>
        ) : proposals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
            <p className="text-gray-600 mb-4">Create your first proposal to get started</p>
            <Link
              to="/admin/proposals/new"
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Proposal
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
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proposal
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valid Until
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {proposals.map((proposal: Proposal) => (
                      <tr key={proposal.id} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{proposal.proposal_number}</div>
                            <div className="text-sm text-gray-500">{proposal.title}</div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm text-gray-900">{proposal.client_name || 'N/A'}</div>
                          {proposal.client_company && (
                            <div className="text-sm text-gray-500">{proposal.client_company}</div>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(proposal.total, proposal.currency)}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          {proposal.valid_until ? (
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(proposal.valid_until).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleDownloadPDF(proposal)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md touch-manipulation"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {proposal.status === 'accepted' && (
                              <button
                                onClick={() => handleConvertToInvoice(proposal)}
                                className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md touch-manipulation"
                                title="Convert to Invoice"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                            )}
                            <Link
                              to={`/admin/proposals/${proposal.id}/edit`}
                              className="p-2 text-teal-600 hover:text-teal-900 hover:bg-teal-50 rounded-md touch-manipulation"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(proposal)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md touch-manipulation"
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

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {proposals.map((proposal: Proposal) => (
                <div key={proposal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{proposal.proposal_number}</div>
                      <div className="text-sm text-gray-500 truncate">{proposal.title}</div>
                    </div>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(proposal.status)}`}>
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-xs text-gray-500">Client:</span>
                      <div className="text-sm font-medium text-gray-900">{proposal.client_name || 'N/A'}</div>
                      {proposal.client_company && (
                        <div className="text-sm text-gray-500">{proposal.client_company}</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500">Amount:</span>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(proposal.total, proposal.currency)}
                        </div>
                      </div>
                      {proposal.valid_until && (
                        <div>
                          <span className="text-xs text-gray-500">Valid Until:</span>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(proposal.valid_until).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleDownloadPDF(proposal)}
                      className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md touch-manipulation"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                    {proposal.status === 'accepted' && (
                      <button
                        onClick={() => handleConvertToInvoice(proposal)}
                        className="flex items-center px-3 py-2 text-sm text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md touch-manipulation"
                        title="Convert to Invoice"
                      >
                        <Receipt className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Convert</span>
                      </button>
                    )}
                    <Link
                      to={`/admin/proposals/${proposal.id}/edit`}
                      className="flex items-center px-3 py-2 text-sm text-teal-600 hover:text-teal-900 hover:bg-teal-50 rounded-md touch-manipulation"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(proposal)}
                      className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md touch-manipulation"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Delete</span>
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
