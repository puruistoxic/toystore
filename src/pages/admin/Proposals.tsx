import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { invoicingApi, companySettingsApi } from '../../utils/api';
import { Proposal } from '../../types/invoicing';
import { Plus, Search, Edit, Trash2, FileText, Calendar, Download, Receipt, X } from 'lucide-react';
import { generateProposalPDF } from '../../utils/pdfGenerator';
import { useAlert } from '../../contexts/AlertContext';
import { formatDateOnly } from '../../utils/dateUtils';

export default function AdminProposals() {
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useAlert();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [statusChangeModal, setStatusChangeModal] = useState<{ isOpen: boolean; proposal: Proposal | null; newStatus: string }>({
    isOpen: false,
    proposal: null,
    newStatus: ''
  });

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
      await showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate PDF'
      });
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoicingApi.deleteProposal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      // Fetch the full proposal data first to ensure we have all required fields
      const proposalResponse = await invoicingApi.getProposal(id);
      const proposal = proposalResponse.data;
      
      if (!proposal) throw new Error('Proposal not found');
      
      // Update only the status field while keeping all other fields
      return invoicingApi.updateProposal(id, {
        ...proposal,
        status
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setStatusChangeModal({ isOpen: false, proposal: null, newStatus: '' });
      showAlert({
        type: 'success',
        title: 'Status Updated',
        message: 'Proposal status has been updated successfully'
      });
    },
    onError: (error: any) => {
      showAlert({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update proposal status'
      });
    }
  });

  const handleStatusChangeClick = (proposal: Proposal) => {
    // Don't allow status change if proposal is accepted and has invoice
    if (proposal.status === 'accepted' && proposal.has_invoice === 1) {
      showAlert({
        type: 'warning',
        title: 'Cannot Change Status',
        message: 'This proposal has been converted to an invoice and its status cannot be changed. Delete the invoice first if you need to modify the proposal.'
      });
      return;
    }
    
    setStatusChangeModal({
      isOpen: true,
      proposal,
      newStatus: proposal.status
    });
  };

  const handleStatusChangeConfirm = async () => {
    if (!statusChangeModal.proposal) return;
    
    if (statusChangeModal.newStatus === statusChangeModal.proposal.status) {
      setStatusChangeModal({ isOpen: false, proposal: null, newStatus: '' });
      return;
    }

    const confirmed = await showConfirm({
      title: 'Change Proposal Status',
      message: `Are you sure you want to change the status of proposal ${statusChangeModal.proposal.proposal_number} from "${statusChangeModal.proposal.status.charAt(0).toUpperCase() + statusChangeModal.proposal.status.slice(1)}" to "${statusChangeModal.newStatus.charAt(0).toUpperCase() + statusChangeModal.newStatus.slice(1)}"?`,
      confirmText: 'Change Status',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      updateStatusMutation.mutate({
        id: statusChangeModal.proposal.id,
        status: statusChangeModal.newStatus
      });
    }
  };

  const handleDelete = async (proposal: Proposal) => {
    // Check if proposal is accepted and has an invoice
    if (proposal.status === 'accepted' && proposal.has_invoice === 1) {
      await showAlert({
        type: 'error',
        title: 'Cannot Delete Proposal',
        message: 'This proposal has been converted to an invoice and cannot be deleted. Please delete the associated invoice first.'
      });
      return;
    }

    const confirmed = await showConfirm({
      title: 'Delete Proposal',
      message: `Are you sure you want to delete proposal ${proposal.proposal_number}?`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(proposal.id);
      } catch (error: any) {
        await showAlert({
          type: 'error',
          title: 'Error',
          message: error.response?.data?.message || 'Failed to delete proposal'
        });
      }
    }
  };

  const canDeleteProposal = (proposal: Proposal) => {
    // Proposals can only be deleted if they are not accepted with an invoice
    return !(proposal.status === 'accepted' && proposal.has_invoice === 1);
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
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proposal
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valid Until
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
                    {proposals.map((proposal: Proposal) => (
                      <tr key={proposal.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 xl:px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{proposal.proposal_number}</div>
                            <div className="text-sm text-gray-500 mt-0.5">{proposal.title}</div>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div className="text-sm text-gray-900">{proposal.client_name || 'N/A'}</div>
                          {proposal.client_company && (
                            <div className="text-sm text-gray-500 mt-0.5">{proposal.client_company}</div>
                          )}
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(proposal.total, proposal.currency)}
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          {proposal.valid_until ? (
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                              <span>{formatDateOnly(proposal.valid_until)}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <button
                            onClick={() => handleStatusChangeClick(proposal)}
                            disabled={proposal.status === 'accepted' && proposal.has_invoice === 1}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColor(proposal.status)}`}
                            title={proposal.status === 'accepted' && proposal.has_invoice === 1 
                              ? 'Status cannot be changed - proposal has been converted to invoice'
                              : 'Click to change status'}
                          >
                            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                          </button>
                        </td>
                        <td className="px-4 xl:px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1 xl:space-x-2">
                            <button
                              onClick={() => handleDownloadPDF(proposal)}
                              className="p-1.5 xl:p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md touch-manipulation transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {proposal.status === 'accepted' && (!proposal.has_invoice || proposal.has_invoice === 0) && (
                              <button
                                onClick={() => handleConvertToInvoice(proposal)}
                                className="p-1.5 xl:p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md touch-manipulation transition-colors"
                                title="Convert to Invoice"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                            )}
                            {proposal.status === 'accepted' && proposal.has_invoice === 1 && (
                              <span 
                                className="p-1.5 xl:p-2 text-gray-400 cursor-not-allowed"
                                title="This proposal has already been converted to an invoice. Delete the invoice to convert again."
                              >
                                <Receipt className="w-4 h-4" />
                              </span>
                            )}
                            {canDeleteProposal(proposal) ? (
                              <Link
                                to={`/admin/proposals/${proposal.id}/edit`}
                                className="p-1.5 xl:p-2 text-teal-600 hover:text-teal-900 hover:bg-teal-50 rounded-md touch-manipulation transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                            ) : (
                              <span 
                                className="p-1.5 xl:p-2 text-gray-400 cursor-not-allowed"
                                title="This proposal has been converted to an invoice and is read-only. Delete the invoice to edit."
                              >
                                <Edit className="w-4 h-4" />
                              </span>
                            )}
                            {canDeleteProposal(proposal) ? (
                              <button
                                onClick={() => handleDelete(proposal)}
                                className="p-1.5 xl:p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md touch-manipulation transition-colors"
                                title="Delete Proposal"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span 
                                className="p-1.5 xl:p-2 text-gray-400 cursor-not-allowed"
                                title="This proposal has been converted to an invoice and cannot be deleted. Delete the invoice first."
                              >
                                <Trash2 className="w-4 h-4" />
                              </span>
                            )}
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
              {proposals.map((proposal: Proposal) => (
                <div key={proposal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">{proposal.proposal_number}</div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">{proposal.title}</div>
                    </div>
                    <button
                      onClick={() => handleStatusChangeClick(proposal)}
                      disabled={proposal.status === 'accepted' && proposal.has_invoice === 1}
                      className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColor(proposal.status)}`}
                      title={proposal.status === 'accepted' && proposal.has_invoice === 1 
                        ? 'Status cannot be changed - proposal has been converted to invoice'
                        : 'Tap to change status'}
                    >
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </button>
                  </div>
                  
                  <div className="space-y-2.5 sm:space-y-3 mb-3 sm:mb-4">
                    <div>
                      <span className="text-xs text-gray-500 font-medium">Client:</span>
                      <div className="text-sm sm:text-base font-medium text-gray-900 mt-0.5">{proposal.client_name || 'N/A'}</div>
                      {proposal.client_company && (
                        <div className="text-xs sm:text-sm text-gray-500 mt-0.5">{proposal.client_company}</div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                      <div>
                        <span className="text-xs text-gray-500 font-medium">Amount:</span>
                        <div className="text-sm sm:text-base font-semibold text-gray-900 mt-0.5">
                          {formatCurrency(proposal.total, proposal.currency)}
                        </div>
                      </div>
                      {proposal.valid_until && (
                        <div>
                          <span className="text-xs text-gray-500 font-medium">Valid Until:</span>
                          <div className="flex items-center text-sm text-gray-500 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                            <span>{formatDateOnly(proposal.valid_until)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleDownloadPDF(proposal)}
                      className="flex items-center justify-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md touch-manipulation transition-colors min-w-[44px] sm:min-w-0"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4 sm:mr-1.5" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                    {proposal.status === 'accepted' && (!proposal.has_invoice || proposal.has_invoice === 0) && (
                      <button
                        onClick={() => handleConvertToInvoice(proposal)}
                        className="flex items-center justify-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md touch-manipulation transition-colors min-w-[44px] sm:min-w-0"
                        title="Convert to Invoice"
                      >
                        <Receipt className="w-4 h-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">Convert</span>
                      </button>
                    )}
                    {proposal.status === 'accepted' && proposal.has_invoice === 1 && (
                      <span 
                        className="flex items-center justify-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 cursor-not-allowed min-w-[44px] sm:min-w-0"
                        title="This proposal has already been converted to an invoice. Delete the invoice to convert again."
                      >
                        <Receipt className="w-4 h-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">Converted</span>
                      </span>
                    )}
                    {canDeleteProposal(proposal) ? (
                      <Link
                        to={`/admin/proposals/${proposal.id}/edit`}
                        className="flex items-center justify-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-teal-600 hover:text-teal-900 hover:bg-teal-50 rounded-md touch-manipulation transition-colors min-w-[44px] sm:min-w-0"
                      >
                        <Edit className="w-4 h-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                    ) : (
                      <span 
                        className="flex items-center justify-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 cursor-not-allowed min-w-[44px] sm:min-w-0"
                        title="This proposal has been converted to an invoice and is read-only. Delete the invoice to edit."
                      >
                        <Edit className="w-4 h-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </span>
                    )}
                    {canDeleteProposal(proposal) ? (
                      <button
                        onClick={() => handleDelete(proposal)}
                        className="flex items-center justify-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md touch-manipulation transition-colors min-w-[44px] sm:min-w-0"
                        title="Delete Proposal"
                      >
                        <Trash2 className="w-4 h-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    ) : (
                      <span 
                        className="flex items-center justify-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 cursor-not-allowed min-w-[44px] sm:min-w-0"
                        title="This proposal has been converted to an invoice and cannot be deleted. Delete the invoice first."
                      >
                        <Trash2 className="w-4 h-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Status Change Modal */}
      {statusChangeModal.isOpen && statusChangeModal.proposal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setStatusChangeModal({ isOpen: false, proposal: null, newStatus: '' })}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Change Proposal Status</h3>
                  <button
                    onClick={() => setStatusChangeModal({ isOpen: false, proposal: null, newStatus: '' })}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Proposal Details */}
                <div className="mb-6 space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Proposal Number</p>
                      <p className="text-sm font-semibold text-gray-900">{statusChangeModal.proposal.proposal_number}</p>
                    </div>
                    
                    {statusChangeModal.proposal.title && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Title</p>
                        <p className="text-sm text-gray-900">{statusChangeModal.proposal.title}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Client</p>
                      <p className="text-sm text-gray-900">{statusChangeModal.proposal.client_name || 'N/A'}</p>
                      {statusChangeModal.proposal.client_company && (
                        <p className="text-xs text-gray-600 mt-0.5">{statusChangeModal.proposal.client_company}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Amount</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(statusChangeModal.proposal.total, statusChangeModal.proposal.currency)}
                        </p>
                      </div>
                      
                      {statusChangeModal.proposal.valid_until && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Valid Until</p>
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                            <span>{formatDateOnly(statusChangeModal.proposal.valid_until)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Current Status</p>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(statusChangeModal.proposal.status)}`}>
                        {statusChangeModal.proposal.status.charAt(0).toUpperCase() + statusChangeModal.proposal.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={statusChangeModal.newStatus}
                    onChange={(e) => setStatusChangeModal({ ...statusChangeModal, newStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleStatusChangeConfirm}
                  disabled={updateStatusMutation.isPending || statusChangeModal.newStatus === statusChangeModal.proposal.status}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Confirm Change'}
                </button>
                <button
                  onClick={() => setStatusChangeModal({ isOpen: false, proposal: null, newStatus: '' })}
                  disabled={updateStatusMutation.isPending}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
