import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { invoicingApi, companySettingsApi } from '../../utils/api';
import { Invoice } from '../../types/invoicing';
import { Plus, Search, Edit, Trash2, FileText, Calendar, DollarSign, Download, Mail, CreditCard } from 'lucide-react';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import PaymentReminderModal from '../../components/admin/PaymentReminderModal';
import PaymentManagementModal from '../../components/admin/PaymentManagementModal';

export default function AdminInvoices() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [reminderModalInvoice, setReminderModalInvoice] = useState<Invoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', statusFilter, search],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const response = await invoicingApi.getInvoices(params);
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

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const doc = await generateInvoicePDF(invoice, companySettings || {});
      doc.save(`Invoice-${invoice.invoice_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoicingApi.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const handleDelete = async (invoice: Invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
      try {
        await deleteMutation.mutateAsync(invoice.id);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete invoice');
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
      pending_approval: 'bg-amber-100 text-amber-800',
      approved: 'bg-blue-100 text-blue-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-indigo-100 text-indigo-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      disputed: 'bg-orange-100 text-orange-800',
      on_hold: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-pink-100 text-pink-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout title="Invoices">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
            <p className="text-sm text-gray-600 mt-1">Manage client invoices and payments</p>
          </div>
          <Link
            to="/admin/invoices/new"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors touch-manipulation text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search invoices..."
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
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="disputed">Disputed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Invoices List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-gray-600">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600 mb-4">Create your first invoice to get started</p>
            <Link
              to="/admin/invoices/new"
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
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
                        Invoice
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
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
                    {invoices.map((invoice: Invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                            <div className="text-sm text-gray-500">{invoice.title}</div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm text-gray-900">{invoice.client_name || 'N/A'}</div>
                          {invoice.client_company && (
                            <div className="text-sm text-gray-500">{invoice.client_company}</div>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(invoice.total, invoice.currency)}
                          </div>
                          {invoice.paid_amount && invoice.paid_amount > 0 && (
                            <div className="text-xs text-gray-500">
                              Paid: {formatCurrency(invoice.paid_amount, invoice.currency)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setPaymentModalInvoice(invoice)}
                              className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md touch-manipulation"
                              title="Payment Management"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setReminderModalInvoice(invoice)}
                              className="p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-md touch-manipulation"
                              title="Payment Reminders"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(invoice)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md touch-manipulation"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/admin/invoices/${invoice.id}/edit`}
                              className="p-2 text-teal-600 hover:text-teal-900 hover:bg-teal-50 rounded-md touch-manipulation"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(invoice)}
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
              {invoices.map((invoice: Invoice) => (
                <div key={invoice.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{invoice.invoice_number}</div>
                      <div className="text-sm text-gray-500 truncate">{invoice.title}</div>
                    </div>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-xs text-gray-500">Client:</span>
                      <div className="text-sm font-medium text-gray-900">{invoice.client_name || 'N/A'}</div>
                      {invoice.client_company && (
                        <div className="text-sm text-gray-500">{invoice.client_company}</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500">Amount:</span>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.total, invoice.currency)}
                        </div>
                        {invoice.paid_amount && invoice.paid_amount > 0 && (
                          <div className="text-xs text-gray-500">
                            Paid: {formatCurrency(invoice.paid_amount, invoice.currency)}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Due Date:</span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setReminderModalInvoice(invoice)}
                      className="flex items-center px-3 py-2 text-sm text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded-md touch-manipulation"
                      title="Payment Reminders"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Reminders</span>
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(invoice)}
                      className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md touch-manipulation"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                    <Link
                      to={`/admin/invoices/${invoice.id}/edit`}
                      className="flex items-center px-3 py-2 text-sm text-teal-600 hover:text-teal-900 hover:bg-teal-50 rounded-md touch-manipulation"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(invoice)}
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

      {reminderModalInvoice && (
        <PaymentReminderModal
          isOpen={!!reminderModalInvoice}
          onClose={() => setReminderModalInvoice(null)}
          invoiceId={reminderModalInvoice.id}
          invoiceNumber={reminderModalInvoice.invoice_number}
          dueDate={reminderModalInvoice.due_date}
          clientEmail={reminderModalInvoice.client_email}
        />
      )}

      {paymentModalInvoice && (
        <PaymentManagementModal
          isOpen={!!paymentModalInvoice}
          onClose={() => setPaymentModalInvoice(null)}
          invoice={paymentModalInvoice}
        />
      )}
    </AdminLayout>
  );
}
