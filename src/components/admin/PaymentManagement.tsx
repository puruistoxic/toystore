import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicingApi } from '../../utils/api';
import { InvoicePayment } from '../../types/invoicing';
import { Plus, Trash2, DollarSign, Calendar, CreditCard, FileText } from 'lucide-react';
import { useAlert } from '../../contexts/AlertContext';

interface PaymentManagementProps {
  invoiceId: string;
  invoiceTotal: number;
  paidAmount: number;
  currency?: string;
}

export default function PaymentManagement({
  invoiceId,
  invoiceTotal,
  paidAmount,
  currency = 'INR'
}: PaymentManagementProps) {
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useAlert();
  const [showAddForm, setShowAddForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer' as 'cash' | 'bank_transfer' | 'cheque' | 'credit_card' | 'debit_card' | 'upi' | 'other',
    reference_number: '',
    notes: ''
  });

  const { data: payments = [], isLoading } = useQuery<InvoicePayment[]>({
    queryKey: ['payments', invoiceId],
    queryFn: async () => {
      const response = await invoicingApi.getPayments(invoiceId);
      return response.data;
    }
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data: any) => invoicingApi.createPayment(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowAddForm(false);
      setPaymentForm({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'bank_transfer',
        reference_number: '',
        notes: ''
      });
    },
    onError: async (error: any) => {
      await showAlert({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to record payment'
      });
    }
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: number) => invoicingApi.deletePayment(invoiceId, paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: async (error: any) => {
      await showAlert({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to delete payment'
      });
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      cheque: 'Cheque',
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      upi: 'UPI',
      other: 'Other'
    };
    return labels[method] || method;
  };

  const getPaymentMethodIcon = (method: string) => {
    if (method === 'cash') return '💵';
    if (method === 'bank_transfer') return '🏦';
    if (method === 'cheque') return '📝';
    if (method === 'credit_card' || method === 'debit_card') return '💳';
    if (method === 'upi') return '📱';
    return '💰';
  };

  // Derive paid amount from payments so UI updates immediately after changes
  const totalPaidFromPayments = payments.reduce(
    (sum, p) => sum + (parseFloat(p.amount?.toString() || '0') || 0),
    0
  );

  // Use live payments once loaded; fall back to prop while query is loading
  const paymentsLoaded = !isLoading;
  const effectivePaidAmount = paymentsLoaded ? totalPaidFromPayments : paidAmount;
  const effectiveInvoiceTotal = parseFloat(invoiceTotal?.toString() || '0');
  const outstandingAmount = Math.max(effectiveInvoiceTotal - effectivePaidAmount, 0);
  const paymentPercentage =
    effectiveInvoiceTotal > 0 ? (effectivePaidAmount / effectiveInvoiceTotal) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentForm.amount);
    
    if (isNaN(amount) || amount <= 0) {
      await showAlert({
        type: 'warning',
        title: 'Invalid Amount',
        message: 'Please enter a valid payment amount'
      });
      return;
    }

    if (amount > outstandingAmount) {
      await showAlert({
        type: 'warning',
        title: 'Amount Exceeded',
        message: `Payment amount cannot exceed outstanding amount of ${formatCurrency(outstandingAmount)}`
      });
      return;
    }

    createPaymentMutation.mutate(paymentForm);
  };

  const handleQuickAmount = (percentage: number) => {
    const amount = (invoiceTotal * percentage) / 100;
    setPaymentForm({ ...paymentForm, amount: amount.toFixed(2) });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Management</h3>
          <p className="text-sm text-gray-600 mt-1">Record and track partial payments</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium w-full sm:w-auto touch-manipulation"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showAddForm ? 'Cancel' : 'Add Payment'}
        </button>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Total Amount</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900 mt-1">{formatCurrency(invoiceTotal)}</p>
            </div>
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0 ml-2" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Paid Amount</p>
              <p className="text-xl sm:text-2xl font-bold text-green-900 mt-1">
                {formatCurrency(effectivePaidAmount)}
              </p>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="text-xs text-green-700 font-medium">{paymentPercentage.toFixed(1)}%</div>
            </div>
          </div>
        </div>
        <div className={`rounded-lg p-4 border sm:col-span-2 lg:col-span-1 ${
          outstandingAmount > 0 
            ? 'bg-orange-50 border-orange-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                outstandingAmount > 0 ? 'text-orange-900' : 'text-gray-900'
              }`}>
                Outstanding
              </p>
              <p className={`text-xl sm:text-2xl font-bold mt-1 ${
                outstandingAmount > 0 ? 'text-orange-900' : 'text-gray-900'
              }`}>
                {formatCurrency(outstandingAmount)}
              </p>
            </div>
            {outstandingAmount === 0 && (
              <div className="text-green-600 text-sm font-medium flex-shrink-0 ml-2">✓ Paid</div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Progress Bar */}
      {invoiceTotal > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Payment Progress</span>
            <span className="text-sm text-gray-600">{paymentPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-teal-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Add Payment Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder={`Max: ${formatCurrency(outstandingAmount)}`}
                max={outstandingAmount}
                step="0.01"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation"
              />
              {outstandingAmount > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(25)}
                    className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 touch-manipulation"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(50)}
                    className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 touch-manipulation"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(75)}
                    className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 touch-manipulation"
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, amount: outstandingAmount.toFixed(2) })}
                    className="text-xs px-3 py-1.5 bg-teal-100 hover:bg-teal-200 rounded text-teal-700 font-medium touch-manipulation"
                  >
                    Full
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as any })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="upi">UPI</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                value={paymentForm.reference_number}
                onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                placeholder="Transaction ID, Cheque No., etc."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                rows={3}
                placeholder="Additional payment details or remarks..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm touch-manipulation"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium touch-manipulation w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPaymentMutation.isPending}
              className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 text-sm font-medium touch-manipulation w-full sm:w-auto"
            >
              {createPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      )}

      {/* Payment History */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Payment History</h4>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No payments recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "Add Payment" to record a payment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="bg-teal-100 p-2 rounded-lg flex-shrink-0">
                      <span className="text-xl sm:text-2xl">{getPaymentMethodIcon(payment.payment_method)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-2 mb-2">
                        <p className="text-base sm:text-lg font-bold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium w-fit">
                          {getPaymentMethodLabel(payment.payment_method)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{formatDate(payment.payment_date)}</span>
                        </div>
                        {payment.reference_number && (
                          <div className="flex items-center space-x-2 min-w-0">
                            <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="font-mono text-xs truncate">{payment.reference_number}</span>
                          </div>
                        )}
                      </div>
                      {payment.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 break-words">
                          <strong>Notes:</strong> {payment.notes}
                        </div>
                      )}
                      <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-1 sm:gap-0 text-xs text-gray-400 break-words">
                        {payment.created_at && (
                          <span className="break-words">Recorded on {formatDate(payment.created_at)}</span>
                        )}
                        {payment.created_by && (
                          <span className="text-gray-500 break-words">
                            {payment.created_at && <span className="hidden sm:inline"> • </span>}
                            Recorded by: {payment.created_by_full_name || payment.created_by_username || `User ID: ${payment.created_by}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const confirmed = await showConfirm({
                        title: 'Delete Payment',
                        message: 'Are you sure you want to delete this payment record? This action cannot be undone.',
                        confirmText: 'Delete',
                        cancelText: 'Cancel'
                      });
                      if (confirmed) {
                        deletePaymentMutation.mutate(payment.id);
                      }
                    }}
                    className="self-end sm:self-start p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors touch-manipulation flex-shrink-0"
                    title="Delete payment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Summary Table */}
      {payments.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="text-sm font-semibold text-gray-900 mb-3">Payment Summary</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Payments:</span>
                <span className="font-medium text-gray-900">
                  {payments.length} payment{payments.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Paid:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(payments.reduce((sum, p) => sum + (parseFloat(p.amount?.toString() || '0') || 0), 0))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Outstanding:</span>
                <span className={`font-medium ${outstandingAmount > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                  {formatCurrency(outstandingAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


