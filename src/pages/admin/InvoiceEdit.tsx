import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { invoicingApi, companySettingsApi } from '../../utils/api';
import { ArrowLeft, Plus, Trash2, Download } from 'lucide-react';
import { InvoiceItem } from '../../types/invoicing';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import ProductSearch from '../../components/admin/ProductSearch';
import QuickAddProductModal from '../../components/admin/QuickAddProductModal';

export default function InvoiceEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    client_id: '',
    proposal_id: '',
    title: '',
    description: '',
    items: [] as InvoiceItem[],
    tax_rate: 18,
    discount: 0,
    currency: 'INR',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    invoice_type: 'confirmed' as 'confirmed' | 'sharing',
    payment_terms: '',
    notes: '',
    terms: ''
  });
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddItemIndex, setQuickAddItemIndex] = useState<number | null>(null);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await invoicingApi.getInvoice(id!);
      return response.data;
    },
    enabled: !!id
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await invoicingApi.getClients({ status: 'active' });
      return response.data;
    }
  });

  const { data: companySettings } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const response = await companySettingsApi.getSettings();
      return response.data;
    }
  });

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    try {
      const doc = await generateInvoicePDF(invoice, companySettings || {});
      doc.save(`Invoice-${invoice.invoice_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  useEffect(() => {
    if (invoice) {
      setFormData({
        client_id: invoice.client_id || '',
        proposal_id: invoice.proposal_id || '',
        title: invoice.title || '',
        description: invoice.description || '',
        items: invoice.items || [],
        tax_rate: invoice.tax_rate || 18,
        discount: invoice.discount || 0,
        currency: invoice.currency || 'INR',
        issue_date: invoice.issue_date ? invoice.issue_date.split('T')[0] : new Date().toISOString().split('T')[0],
        due_date: invoice.due_date ? invoice.due_date.split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: invoice.status || 'draft',
        invoice_type: invoice.invoice_type || 'confirmed',
        payment_terms: invoice.payment_terms || '',
        notes: invoice.notes || '',
        terms: invoice.terms || ''
      });
    }
  }, [invoice]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => invoicingApi.updateInvoice(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      navigate('/admin/invoices');
    }
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, price: 0, hsn_code: '' }]
    });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
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
      // Handle hsn_code - check for both null and undefined, and also try camelCase variant
      const hsnCode = product.hsn_code || product.hsnCode || '';
      newItems[index] = {
        ...newItems[index],
        description: product.name,
        hsn_code: hsnCode,
        price: product.price || 0,
        quantity: newItems[index].quantity || 1
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
    const taxAmount = formData.invoice_type === 'sharing' ? 0 : (subtotal * formData.tax_rate) / 100;
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
      await updateMutation.mutateAsync({
        ...formData,
        subtotal,
        tax_amount: taxAmount,
        total
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update invoice');
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  if (isLoading) {
    return (
      <AdminLayout title="Edit Invoice">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="mt-2 text-gray-600">Loading invoice...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Invoice">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/admin/invoices')} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Invoice</h2>
              <p className="text-sm text-gray-600 mt-1">Update invoice details</p>
            </div>
          </div>
          {invoice && (
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select a client</option>
                {clients.map((client: any) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company ? `(${client.company})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.invoice_type}
                onChange={(e) => setFormData({ ...formData, invoice_type: e.target.value as 'confirmed' | 'sharing' })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="confirmed">Confirmed (with GST)</option>
                <option value="sharing">Sharing (without GST)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%) {formData.invoice_type === 'sharing' && <span className="text-gray-500 text-xs">(disabled for sharing invoices)</span>}
                </label>
                <input
                  type="number"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  disabled={formData.invoice_type === 'sharing'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                <input
                  type="text"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  placeholder="e.g., Net 30"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
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
              onClick={() => navigate('/admin/invoices')}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 touch-manipulation text-sm font-medium"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Invoice'}
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
    </AdminLayout>
  );
}
