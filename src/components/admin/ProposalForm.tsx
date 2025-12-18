import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from './AdminLayout';
import { invoicingApi, companySettingsApi } from '../../utils/api';
import { ArrowLeft, Plus, Trash2, Download, Receipt } from 'lucide-react';
import { ProposalItem, Proposal } from '../../types/invoicing';
import { generateProposalPDF } from '../../utils/pdfGenerator';
import ProductSearch from './ProductSearch';
import QuickAddProductModal from './QuickAddProductModal';
import QuickAddClientModal from './QuickAddClientModal';

interface ProposalFormProps {
  mode: 'new' | 'edit';
  proposalId?: string;
}

export default function ProposalForm({ mode, proposalId }: ProposalFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    description: '',
    items: [] as ProposalItem[],
    tax_rate: 18,
    discount: 0,
    currency: 'INR',
    valid_until: '',
    status: 'draft',
    notes: '',
    terms: ''
  });
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddItemIndex, setQuickAddItemIndex] = useState<number | null>(null);
  const [showQuickAddClientModal, setShowQuickAddClientModal] = useState(false);

  // Fetch proposal data for edit mode
  const { data: proposal, isLoading: isLoadingProposal } = useQuery<Proposal>({
    queryKey: ['proposal', proposalId],
    queryFn: async () => {
      const response = await invoicingApi.getProposal(proposalId!);
      return response.data;
    },
    enabled: mode === 'edit' && !!proposalId
  });

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await invoicingApi.getClients({ status: 'active' });
      return response.data;
    }
  });

  // Fetch company settings for PDF generation
  const { data: companySettings } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const response = await companySettingsApi.getSettings();
      return response.data;
    }
  });

  // Load proposal data for edit mode
  useEffect(() => {
    if (mode === 'edit' && proposal) {
      setFormData({
        client_id: proposal.client_id || '',
        title: proposal.title || '',
        description: proposal.description || '',
        items: proposal.items || [],
        tax_rate: proposal.tax_rate || 18,
        discount: proposal.discount || 0,
        currency: proposal.currency || 'INR',
        valid_until: proposal.valid_until ? proposal.valid_until.split('T')[0] : '',
        status: proposal.status || 'draft',
        notes: proposal.notes || '',
        terms: proposal.terms || ''
      });
    }
  }, [proposal, mode]);

  const handleDownloadPDF = async () => {
    if (!proposal) return;
    try {
      const doc = await generateProposalPDF(proposal, companySettings || {});
      doc.save(`Proposal-${proposal.proposal_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => invoicingApi.createProposal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      navigate('/admin/proposals');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => invoicingApi.updateProposal(proposalId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      navigate('/admin/proposals');
    }
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, price: 0, hsn_code: '' }]
    });
  };

  const updateItem = (index: number, field: keyof ProposalItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].quantity * newItems[index].price;
    }
    setFormData({ ...formData, items: newItems });
  };

  const handleProductSelect = (index: number, product: any) => {
    if (product) {
      const newItems = [...formData.items];
      const hsnCode = product.hsn_code || product.hsnCode || '';
      newItems[index] = {
        ...newItems[index],
        description: product.name,
        hsn_code: hsnCode,
        price: product.price || 0,
        quantity: newItems[index].quantity || 1,
        product_id: product.id || product.slug || undefined
      };
      newItems[index].total = newItems[index].quantity * newItems[index].price;
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleQuickAddProduct = (index: number) => {
    setQuickAddItemIndex(index);
    setShowQuickAddModal(true);
  };

  const handleProductAdded = (product: any) => {
    if (quickAddItemIndex !== null) {
      handleProductSelect(quickAddItemIndex, product);
    }
    setShowQuickAddModal(false);
    setQuickAddItemIndex(null);
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = (subtotal * formData.tax_rate) / 100;
    const total = subtotal + taxAmount - formData.discount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id) {
      alert('Please select a client');
      return;
    }
    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    const { subtotal, taxAmount, total } = calculateTotals();
    try {
      if (mode === 'new') {
        await createMutation.mutateAsync({
          ...formData,
          subtotal,
          tax_amount: taxAmount,
          total
        });
      } else {
        await updateMutation.mutateAsync({
          ...formData,
          subtotal,
          tax_amount: taxAmount,
          total
        });
      }
    } catch (error: any) {
      alert(error.response?.data?.message || `Failed to ${mode === 'new' ? 'create' : 'update'} proposal`);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();
  const isLoading = mode === 'edit' && isLoadingProposal;
  const isSubmitting = mode === 'new' ? createMutation.isPending : updateMutation.isPending;
  const pageTitle = mode === 'new' ? 'New Proposal' : 'Edit Proposal';
  
  // Determine if client field should be disabled
  // Client can only be changed in draft status or when creating new proposal
  // Once sent/accepted/rejected, client should be locked
  const isClientEditable = mode === 'new' || (mode === 'edit' && proposal?.status === 'draft');

  if (isLoading) {
    return (
      <AdminLayout title={pageTitle}>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="mt-2 text-gray-600">Loading proposal...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={pageTitle}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/admin/proposals')} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'new' ? 'New Proposal' : 'Edit Proposal'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {mode === 'edit' && proposal?.proposal_number && (
                  <span className="font-medium text-teal-600">Proposal #: {proposal.proposal_number}</span>
                )}
                {mode === 'new' && 'Create a new client proposal'}
                {mode === 'edit' && !proposal?.proposal_number && 'Update proposal details'}
              </p>
            </div>
          </div>
          {mode === 'edit' && proposal && (
            <div className="flex items-center space-x-2">
              {proposal.status === 'accepted' && (
                <button
                  onClick={() => navigate(`/admin/invoices/new?proposal_id=${proposal.id}`)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Convert to Invoice
                </button>
              )}
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client <span className="text-red-500">*</span>
                {!isClientEditable && mode === 'edit' && (
                  <span className="text-xs text-gray-500 ml-2">(Locked - proposal has been sent/finalized)</span>
                )}
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  required
                  disabled={!isClientEditable}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                >
                  <option value="">Select a client</option>
                  {clients.map((client: any) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.company ? `(${client.company})` : ''}
                    </option>
                  ))}
                </select>
                {isClientEditable && (
                  <button
                    type="button"
                    onClick={() => setShowQuickAddClientModal(true)}
                    className="px-3 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    title="Add new client"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Items</label>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium touch-manipulation"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </button>
            </div>

            {formData.items.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No items added. Click "Add Item" to start.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Column Headers - Desktop Only */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-2 border-b border-gray-300">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-600 uppercase">HSN Code</label>
                  </div>
                  <div className="col-span-4">
                    <label className="text-xs font-medium text-gray-600 uppercase">Description</label>
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs font-medium text-gray-600 uppercase">Quantity</label>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-600 uppercase">Unit Price</label>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-600 uppercase">Amount</label>
                  </div>
                  <div className="col-span-1"></div>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-4">
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="HSN Code"
                          value={item.hsn_code || ''}
                          onChange={(e) => updateItem(index, 'hsn_code', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div className="col-span-4">
                        <ProductSearch
                          value={item.description}
                          onChange={(product) => handleProductSelect(index, product)}
                          onAddNew={() => handleQuickAddProduct(index)}
                          placeholder="Search or select product..."
                          className="w-full"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="text-sm font-medium text-gray-700">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: formData.currency }).format(
                            (item.quantity || 0) * (item.price || 0)
                          )}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md touch-manipulation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md touch-manipulation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">HSN Code</label>
                        <input
                          type="text"
                          placeholder="Enter HSN Code"
                          value={item.hsn_code || ''}
                          onChange={(e) => updateItem(index, 'hsn_code', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
                        <ProductSearch
                          value={item.description}
                          onChange={(product) => handleProductSelect(index, product)}
                          onAddNew={() => handleQuickAddProduct(index)}
                          placeholder="Search or select product..."
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price</label>
                          <input
                            type="number"
                            placeholder="Price"
                            value={item.price}
                            onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation"
                          />
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-600">Amount:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: formData.currency }).format(
                              (item.quantity || 0) * (item.price || 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                <input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation"
                />
              </div>
              {mode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: formData.currency }).format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({formData.tax_rate}%):</span>
                <span className="font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: formData.currency }).format(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: formData.currency }).format(formData.discount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                <span>Total:</span>
                <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: formData.currency }).format(total)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/proposals')}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 touch-manipulation text-sm font-medium"
            >
              {isSubmitting ? (mode === 'new' ? 'Creating...' : 'Updating...') : (mode === 'new' ? 'Create Proposal' : 'Update Proposal')}
            </button>
          </div>
        </form>
      </div>

      <QuickAddProductModal
        isOpen={showQuickAddModal}
        onClose={() => {
          setShowQuickAddModal(false);
          setQuickAddItemIndex(null);
        }}
        onProductAdded={handleProductAdded}
      />

      <QuickAddClientModal
        isOpen={showQuickAddClientModal}
        onClose={() => setShowQuickAddClientModal(false)}
        onClientAdded={(client) => {
          setFormData({ ...formData, client_id: client.id });
          setShowQuickAddClientModal(false);
        }}
      />
    </AdminLayout>
  );
}
