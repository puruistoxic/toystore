import React from 'react';
import { X } from 'lucide-react';
import PaymentManagement from './PaymentManagement';
import { Invoice } from '../../types/invoicing';

interface PaymentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export default function PaymentManagementModal({
  isOpen,
  onClose,
  invoice
}: PaymentManagementModalProps) {
  if (!isOpen || !invoice) return null;

  const invoiceTotal = parseFloat(invoice.total?.toString() || '0');
  const paidAmount = parseFloat(invoice.paid_amount?.toString() || '0');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Center modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-teal-600 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Payment Management</h3>
              <p className="text-sm text-teal-100 mt-1">
                Invoice #{invoice.invoice_number} - {invoice.client_name || 'Client'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-gray-50 px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <PaymentManagement
              invoiceId={invoice.id}
              invoiceTotal={invoiceTotal}
              paidAmount={paidAmount}
              currency={invoice.currency || 'INR'}
            />
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


