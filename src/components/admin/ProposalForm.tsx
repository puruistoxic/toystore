import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAlert } from '../../contexts/AlertContext';
import AdminLayout from './AdminLayout';
import { invoicingApi, companySettingsApi } from '../../utils/api';
import { ArrowLeft, Plus, Trash2, Download, Receipt } from 'lucide-react';
import { ProposalItem, Proposal } from '../../types/invoicing';
import { generateProposalPDF } from '../../utils/pdfGenerator';
import ProductSearch from './ProductSearch';
import QuickAddProductModal from './QuickAddProductModal';
import QuickAddClientModal from './QuickAddClientModal';
import ClientSearch from './ClientSearch';
import RichTextEditor from './RichTextEditor';
import TemplateSelector from './TemplateSelector';
import EntityHistory from './EntityHistory';
import { formatDateForInput } from '../../utils/dateUtils';

interface ProposalFormProps {
  mode: 'new' | 'edit';
  proposalId?: string;
}

export default function ProposalForm({ mode, proposalId }: ProposalFormProps) {
  const { showAlert } = useAlert();
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
    proposal_type: 'confirmed' as 'confirmed' | 'sharing',
    payment_terms: '',
    token_amount: 0,
    warranty_details: '',
    work_completion_period: '',
    notes: '',
    terms: ''
  });
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddItemIndex, setQuickAddItemIndex] = useState<number | null>(null);
  const [showQuickAddClientModal, setShowQuickAddClientModal] = useState(false);
  const [paymentTermsSelectValue, setPaymentTermsSelectValue] = useState<string>('');
  const [advancePaymentType, setAdvancePaymentType] = useState<'amount' | 'percentage'>('amount');
  const [advancePaymentValue, setAdvancePaymentValue] = useState<number>(0);

  // Update token_amount when advance payment value or type changes
  useEffect(() => {
    if (advancePaymentValue > 0) {
      const { total } = calculateTotals();
      const calculatedAmount = advancePaymentType === 'percentage' 
        ? (total * advancePaymentValue) / 100 
        : advancePaymentValue;
      if (Math.abs(formData.token_amount - calculatedAmount) > 0.01) {
        setFormData(prev => ({ ...prev, token_amount: calculatedAmount }));
      }
    } else {
      if (formData.token_amount !== 0) {
        setFormData(prev => ({ ...prev, token_amount: 0 }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancePaymentValue, advancePaymentType]);

  // Fetch proposal data for edit mode
  const { data: proposal, isLoading: isLoadingProposal } = useQuery<Proposal>({
    queryKey: ['proposal', proposalId],
    queryFn: async () => {
      const response = await invoicingApi.getProposal(proposalId!);
      return response.data;
    },
    enabled: mode === 'edit' && !!proposalId
  });

  // ClientSearch component handles its own data fetching

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
      const paymentTerms = proposal.payment_terms || '';
      const isCustomPayment = paymentTerms && !['token', 'net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt'].includes(paymentTerms);
      
      setFormData({
        client_id: proposal.client_id || '',
        title: proposal.title || '',
        description: proposal.description || '',
        items: proposal.items || [],
        tax_rate: proposal.tax_rate || 18,
        discount: proposal.discount || 0,
        currency: proposal.currency || 'INR',
        valid_until: proposal.valid_until ? formatDateForInput(proposal.valid_until) : '',
        status: proposal.status || 'draft',
        proposal_type: proposal.proposal_type || 'confirmed',
        payment_terms: paymentTerms,
        token_amount: proposal.token_amount || 0,
        warranty_details: proposal.warranty_details || '',
        work_completion_period: proposal.work_completion_period || '',
        notes: proposal.notes || '',
        terms: proposal.terms || ''
      });
      
      // Set the select value based on payment terms
      if (isCustomPayment) {
        setPaymentTermsSelectValue('custom');
      } else {
        setPaymentTermsSelectValue(paymentTerms);
      }
      
      // Initialize advance payment fields
      if (proposal.token_amount && proposal.token_amount > 0) {
        const { total } = calculateTotals();
        // Try to determine if it was percentage or amount
        // If token_amount is close to a round percentage of total, assume it was percentage
        const possiblePercentage = (proposal.token_amount / total) * 100;
        if (possiblePercentage > 0 && possiblePercentage <= 100 && Math.abs(possiblePercentage - Math.round(possiblePercentage)) < 0.1) {
          setAdvancePaymentType('percentage');
          setAdvancePaymentValue(Math.round(possiblePercentage));
        } else {
          setAdvancePaymentType('amount');
          setAdvancePaymentValue(proposal.token_amount);
        }
      }
    }
  }, [proposal, mode]);

  const handleDownloadPDF = async () => {
    if (!proposal) return;
    try {
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
        price: 0, // No pricing displayed
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
    const taxRate = formData.tax_rate || 18;
    let subtotal = 0;
    let totalTaxAmount = 0;

    // Calculate subtotal and tax for each item
    formData.items.forEach((item) => {
      const itemPrice = item.price || 0;
      const quantity = item.quantity || 0;
      const itemTotal = itemPrice * quantity;
      
      if (formData.proposal_type === 'confirmed' && item.price_includes_gst) {
        // Price already includes GST - extract base price and tax
        // base_price = price / (1 + tax_rate/100)
        // tax = price - base_price
        const basePrice = itemTotal / (1 + taxRate / 100);
        const itemTax = itemTotal - basePrice;
        subtotal += basePrice;
        totalTaxAmount += itemTax;
      } else if (formData.proposal_type === 'confirmed') {
        // Price excludes GST - add tax on top
        subtotal += itemTotal;
        totalTaxAmount += (itemTotal * taxRate) / 100;
      } else {
        // Sharing proposal - no tax
        subtotal += itemTotal;
      }
    });

    const total = subtotal + totalTaxAmount - (formData.discount || 0);
    
    // Calculate advance payment amount
    let advancePaymentAmount = 0;
    if (advancePaymentValue > 0) {
      if (advancePaymentType === 'percentage') {
        advancePaymentAmount = (total * advancePaymentValue) / 100;
      } else {
        advancePaymentAmount = advancePaymentValue;
      }
    }
    
    // Ensure advancePaymentAmount is always a number
    advancePaymentAmount = Number(advancePaymentAmount) || 0;

    return { subtotal, taxAmount: totalTaxAmount, total, advancePaymentAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id) {
      await showAlert({
        type: 'warning',
        title: 'Validation Error',
        message: 'Please select a client'
      });
      return;
    }
    if (formData.items.length === 0) {
      await showAlert({
        type: 'warning',
        title: 'Validation Error',
        message: 'Please add at least one item'
      });
      return;
    }
    // Validate advance payment if payment terms is token
    if (formData.payment_terms === 'token' && (!advancePaymentValue || advancePaymentValue <= 0)) {
      await showAlert({
        type: 'warning',
        title: 'Validation Error',
        message: 'Please enter a valid advance payment amount or percentage when payment terms is set to "Token"'
      });
      return;
    }

    const { subtotal, taxAmount, total, advancePaymentAmount } = calculateTotals();
    try {
      if (mode === 'new') {
        await createMutation.mutateAsync({
          ...formData,
          subtotal,
          tax_amount: taxAmount,
          total,
          token_amount: advancePaymentAmount
        });
      } else {
        await updateMutation.mutateAsync({
          ...formData,
          subtotal,
          tax_amount: taxAmount,
          total,
          token_amount: advancePaymentAmount
        });
      }
    } catch (error: any) {
      await showAlert({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || `Failed to ${mode === 'new' ? 'create' : 'update'} proposal`
      });
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();
  const isLoading = mode === 'edit' && isLoadingProposal;
  const isSubmitting = mode === 'new' ? createMutation.isPending : updateMutation.isPending;
  const pageTitle = mode === 'new' ? 'New Proposal' : 'Edit Proposal';
  
  // Determine if proposal is read-only (has been converted to invoice)
  const isReadOnly = mode === 'edit' && proposal?.has_invoice === 1;
  
  // Determine if client field should be disabled
  // Client can only be changed in draft status or when creating new proposal
  // Once sent/accepted/rejected, client should be locked
  // Also disabled if proposal has been converted to invoice
  const isClientEditable = !isReadOnly && (mode === 'new' || (mode === 'edit' && proposal?.status === 'draft'));

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
      <div className="max-w-7xl mx-auto">
        {/* Sticky Header with Actions - Sticky on wider screens, positioned below AdminLayout header */}
        <div className="sticky top-[64px] md:top-[64px] z-30 bg-white border-b border-gray-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                <button onClick={() => navigate('/admin/proposals')} className="text-gray-600 hover:text-gray-900 flex-shrink-0 touch-manipulation">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                    {mode === 'new' ? 'New Proposal' : 'Edit Proposal'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">
                    {mode === 'edit' && proposal?.proposal_number && (
                      <span className="font-medium text-teal-600">Proposal #: {proposal.proposal_number}</span>
                    )}
                    {mode === 'new' && 'Create a new client proposal'}
                    {mode === 'edit' && !proposal?.proposal_number && 'Update proposal details'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              {mode === 'edit' && proposal && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Status:</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      disabled={isReadOnly}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-xs sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed touch-manipulation"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  {proposal.status === 'accepted' && (!proposal.has_invoice || proposal.has_invoice === 0) && (
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/invoices/new?proposal_id=${proposal.id}`)}
                      className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium touch-manipulation whitespace-nowrap"
                    >
                      <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      <span className="hidden sm:inline">Convert to Invoice</span>
                      <span className="sm:hidden">Convert</span>
                    </button>
                  )}
                  {proposal.status === 'accepted' && proposal.has_invoice === 1 && (
                    <span 
                      className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed text-xs sm:text-sm font-medium whitespace-nowrap"
                      title="This proposal has already been converted to an invoice. Delete the invoice to convert again."
                    >
                      <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      <span className="hidden sm:inline">Already Converted</span>
                      <span className="sm:hidden">Converted</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium touch-manipulation whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => navigate('/admin/proposals')}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium touch-manipulation whitespace-nowrap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="proposal-form"
                  disabled={isSubmitting || isReadOnly}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 text-xs sm:text-sm font-medium touch-manipulation whitespace-nowrap"
                >
                  {isSubmitting ? (mode === 'new' ? 'Creating...' : 'Updating...') : (mode === 'new' ? 'Create Proposal' : 'Update Proposal')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Form Content */}
          <div className="flex-1 min-w-0 space-y-6">
            <form id="proposal-form" onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client <span className="text-red-500">*</span>
                {!isClientEditable && mode === 'edit' && (
                  <span className="text-xs text-gray-500 ml-2">(Locked - proposal has been sent/finalized)</span>
                )}
              </label>
              <ClientSearch
                value={formData.client_id}
                onChange={(client) => {
                  setFormData({ ...formData, client_id: client?.id || '' });
                }}
                onAddNew={isClientEditable ? () => setShowQuickAddClientModal(true) : undefined}
                placeholder="Search or select client..."
                className="w-full"
                disabled={!isClientEditable}
              />
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
                disabled={isReadOnly}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                disabled={isReadOnly}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proposal Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.proposal_type}
                onChange={(e) => setFormData({ ...formData, proposal_type: e.target.value as 'confirmed' | 'sharing' })}
                required
                disabled={isReadOnly}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="confirmed">Confirmed (with GST)</option>
                <option value="sharing">Sharing (without GST)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
              <input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={isReadOnly}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-600 uppercase">Quantity</label>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-600 uppercase">Price (₹)</label>
                  </div>
                  <div className="col-span-1">
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
                          disabled={isReadOnly}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Quantity"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          disabled={isReadOnly}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Price"
                          value={item.price || ''}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                          disabled={isReadOnly}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="col-span-1 flex items-center">
                        <span className="text-sm font-medium text-gray-700">
                          ₹{((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={isReadOnly}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
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
                          disabled={isReadOnly}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
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
                          disabled={isReadOnly}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Quantity"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          disabled={isReadOnly}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Price"
                          value={item.price || ''}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                          disabled={isReadOnly}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                        <div className="px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium text-gray-700">
                          ₹{((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals Section */}
          {formData.items.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
              <div className="flex justify-end">
                <div className="w-full sm:w-auto sm:min-w-[280px] space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">₹{calculateTotals().subtotal.toFixed(2)}</span>
                  </div>
                  {formData.proposal_type === 'confirmed' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax ({formData.tax_rate}%):</span>
                        <span className="font-medium text-gray-900">₹{calculateTotals().taxAmount.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {formData.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-red-600">-₹{formData.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-teal-600">₹{calculateTotals().total.toFixed(2)}</span>
                  </div>
                  {(() => {
                    const totals = calculateTotals();
                    return totals.advancePaymentAmount > 0 && (
                      <>
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                          <span className="text-gray-600">Advance Payment:</span>
                          <span className="font-medium text-gray-900">₹{Number(totals.advancePaymentAmount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-gray-900">Balance Due:</span>
                          <span className="text-teal-600">₹{(totals.total - (totals.advancePaymentAmount || 0)).toFixed(2)}</span>
                        </div>
                      </>
                    );
                  })()}
                  {formData.proposal_type === 'sharing' && (
                    <div className="text-xs text-gray-500 mt-2">
                      * Sharing proposal (without GST)
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
              <div className="space-y-2">
                <select
                  value={paymentTermsSelectValue || (formData.payment_terms && !['token', 'net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt'].includes(formData.payment_terms) ? 'custom' : (formData.payment_terms || ''))}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPaymentTermsSelectValue(value);
                    if (value === 'custom') {
                      // If selecting custom, keep existing custom text or set empty
                      if (!formData.payment_terms || ['token', 'net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt'].includes(formData.payment_terms)) {
                        setFormData({ ...formData, payment_terms: '' });
                      }
                      // Don't change payment_terms if it's already custom text
                    } else if (value === '') {
                      // Clear payment terms if selecting empty option
                      setFormData({ 
                        ...formData, 
                        payment_terms: '', 
                        token_amount: 0 
                      });
                    } else {
                      setFormData({ 
                        ...formData, 
                        payment_terms: value, 
                        token_amount: value === 'token' ? formData.token_amount : 0 
                      });
                    }
                  }}
                  disabled={isReadOnly}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select payment terms</option>
                  <option value="token">Token</option>
                  <option value="net_15">Net 15</option>
                  <option value="net_30">Net 30</option>
                  <option value="net_45">Net 45</option>
                  <option value="net_60">Net 60</option>
                  <option value="due_on_receipt">Due on Receipt</option>
                  <option value="custom">Custom</option>
                </select>
                {(paymentTermsSelectValue === 'custom' || (formData.payment_terms && !['token', 'net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt'].includes(formData.payment_terms))) && (
                  <input
                    type="text"
                    value={formData.payment_terms || ''}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    disabled={isReadOnly}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="e.g., 50% advance, 50% on delivery"
                  />
                )}
              </div>
            </div>
            {(formData.payment_terms === 'token' || paymentTermsSelectValue === 'custom') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Payment {formData.payment_terms === 'token' && <span className="text-red-500">*</span>}
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={advancePaymentType}
                      onChange={(e) => {
                        setAdvancePaymentType(e.target.value as 'amount' | 'percentage');
                        setAdvancePaymentValue(0);
                      }}
                      disabled={isReadOnly}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="amount">Amount (₹)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                    <input
                      type="number"
                      step={advancePaymentType === 'percentage' ? '0.01' : '0.01'}
                      min="0"
                      max={advancePaymentType === 'percentage' ? '100' : undefined}
                      value={advancePaymentValue || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setAdvancePaymentValue(value);
                      }}
                      required={formData.payment_terms === 'token'}
                      disabled={isReadOnly}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder={advancePaymentType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                    />
                  </div>
                  {advancePaymentValue > 0 && (() => {
                    const totals = calculateTotals();
                    return (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        Advance Payment: ₹{Number(totals.advancePaymentAmount || 0).toFixed(2)}
                        {advancePaymentType === 'percentage' && ` (${advancePaymentValue}% of ₹${totals.total.toFixed(2)})`}
                      </div>
                    );
                  })()}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {paymentTermsSelectValue === 'custom' 
                    ? 'Optional: Enter advance payment as amount or percentage. This will be shown in the proposal totals.'
                    : 'Enter the token/advance payment as amount or percentage'}
                </p>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Work Completion Period</label>
                <TemplateSelector
                  category="work_completion"
                  onSelect={(content) => setFormData({ ...formData, work_completion_period: content.trim() })}
                  currentValue={formData.work_completion_period}
                  disabled={isReadOnly}
                />
              </div>
              <input
                type="text"
                value={formData.work_completion_period}
                onChange={(e) => setFormData({ ...formData, work_completion_period: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation"
                placeholder="e.g., 15-30 working days after advance payment"
              />
            </div>
          </div>

          {/* Warranty Details */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Warranty Details</label>
              <TemplateSelector
                category="warranty"
                onSelect={(content) => setFormData({ ...formData, warranty_details: content })}
                currentValue={formData.warranty_details}
                disabled={isReadOnly}
              />
            </div>
            <RichTextEditor
              value={formData.warranty_details || ''}
              onChange={(content) => setFormData({ ...formData, warranty_details: content })}
              id="warranty-details-editor"
              height={200}
              disabled={isReadOnly}
            />
            <p className="mt-1 text-xs text-gray-500">
              Use templates for standard warranty terms. You can customize the content as needed.
            </p>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <TemplateSelector
                category="notes"
                onSelect={(content) => setFormData({ ...formData, notes: content })}
                currentValue={formData.notes}
                disabled={isReadOnly}
              />
            </div>
            <RichTextEditor
              value={formData.notes || ''}
              onChange={(content) => setFormData({ ...formData, notes: content })}
              id="notes-editor"
              height={180}
              disabled={isReadOnly}
            />
          </div>

          {/* Terms & Conditions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Terms & Conditions</label>
              <TemplateSelector
                category="terms"
                onSelect={(content) => setFormData({ ...formData, terms: content })}
                currentValue={formData.terms}
                disabled={isReadOnly}
              />
            </div>
            <RichTextEditor
              value={formData.terms || ''}
              onChange={(content) => setFormData({ ...formData, terms: content })}
              id="terms-editor"
              height={180}
              disabled={isReadOnly}
            />
          </div>
            </form>
          </div>

          {/* History Sidebar - Only visible on wide screens (lg and above, 1024px+) */}
          {mode === 'edit' && proposal?.id && (
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-[140px]">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Change History</h3>
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto -mx-1 px-1">
                  <EntityHistory entityType="proposal" entityId={proposal.id} />
                </div>
              </div>
            </div>
          )}
        </div>
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


