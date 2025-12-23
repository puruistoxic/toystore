import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicingApi } from '../../utils/api';
import { X, Mail, Calendar, Trash2, Send, Plus } from 'lucide-react';
import { InvoiceReminder } from '../../types/invoicing';
import { useAlert } from '../../contexts/AlertContext';

interface PaymentReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  dueDate: string;
  clientEmail?: string;
}

export default function PaymentReminderModal({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  dueDate,
  clientEmail
}: PaymentReminderModalProps) {
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useAlert();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    reminder_type: 'after_due' as 'before_due' | 'on_due' | 'after_due' | 'custom',
    reminder_date: '',
    days_before_after: 0
  });

  const { data: reminders = [], isLoading } = useQuery<InvoiceReminder[]>({
    queryKey: ['reminders', invoiceId],
    queryFn: async () => {
      const response = await invoicingApi.getReminders(invoiceId);
      return response.data;
    },
    enabled: isOpen && !!invoiceId
  });

  const sendReminderMutation = useMutation({
    mutationFn: (reminderId?: number) => invoicingApi.sendReminder(invoiceId, reminderId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', invoiceId] });
      await showAlert({
        type: 'success',
        title: 'Success',
        message: 'Reminder email sent successfully!'
      });
    },
    onError: async (error: any) => {
      await showAlert({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to send reminder'
      });
    }
  });

  const handleSendNow = async () => {
    const confirmed = await showConfirm({
      title: 'Send Reminder',
      message: 'Send payment reminder email now?',
      confirmText: 'Send',
      cancelText: 'Cancel'
    });
    if (confirmed) {
      sendReminderMutation.mutate(undefined);
    }
  };

  const createReminderMutation = useMutation({
    mutationFn: (data: any) => invoicingApi.createReminder(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', invoiceId] });
      setShowCreateForm(false);
      setReminderForm({
        reminder_type: 'after_due',
        reminder_date: '',
        days_before_after: 0
      });
    },
    onError: async (error: any) => {
      await showAlert({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to create reminder'
      });
    }
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (reminderId: number) => invoicingApi.deleteReminder(invoiceId, reminderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', invoiceId] });
    },
    onError: async (error: any) => {
      await showAlert({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to delete reminder'
      });
    }
  });

  useEffect(() => {
    if (reminderForm.reminder_type === 'before_due') {
      const due = new Date(dueDate);
      due.setDate(due.getDate() - (reminderForm.days_before_after || 3));
      setReminderForm({ ...reminderForm, reminder_date: due.toISOString().split('T')[0] });
    } else if (reminderForm.reminder_type === 'on_due') {
      setReminderForm({ ...reminderForm, reminder_date: dueDate.split('T')[0] });
    } else if (reminderForm.reminder_type === 'after_due') {
      const due = new Date(dueDate);
      due.setDate(due.getDate() + (reminderForm.days_before_after || 1));
      setReminderForm({ ...reminderForm, reminder_date: due.toISOString().split('T')[0] });
    }
  }, [reminderForm.reminder_type, reminderForm.days_before_after, dueDate]);

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderForm.reminder_date) {
      await showAlert({
        type: 'warning',
        title: 'Validation Error',
        message: 'Please select a reminder date'
      });
      return;
    }
    createReminderMutation.mutate(reminderForm);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Payment Reminders</h2>
            <p className="text-sm text-gray-600 mt-1">Invoice: {invoiceNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!clientEmail && (
            <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
              ⚠️ Client email not found. Cannot send reminders.
            </div>
          )}

          {/* Quick Send Button */}
          {clientEmail && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="text-sm font-medium text-blue-900">Send Reminder Now</p>
                <p className="text-xs text-blue-700 mt-1">Send an immediate payment reminder email</p>
              </div>
              <button
                onClick={handleSendNow}
                disabled={sendReminderMutation.isPending}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendReminderMutation.isPending ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          )}

          {/* Create New Reminder */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Scheduled Reminders</h3>
              {clientEmail && (
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="flex items-center px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {showCreateForm ? 'Cancel' : 'Schedule Reminder'}
                </button>
              )}
            </div>

            {showCreateForm && clientEmail && (
              <form onSubmit={handleCreateReminder} className="space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Type
                  </label>
                  <select
                    value={reminderForm.reminder_type}
                    onChange={(e) => setReminderForm({ ...reminderForm, reminder_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="before_due">Before Due Date</option>
                    <option value="on_due">On Due Date</option>
                    <option value="after_due">After Due Date</option>
                    <option value="custom">Custom Date</option>
                  </select>
                </div>

                {reminderForm.reminder_type !== 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Days {reminderForm.reminder_type === 'before_due' ? 'Before' : reminderForm.reminder_type === 'after_due' ? 'After' : 'On'} Due Date
                    </label>
                    <input
                      type="number"
                      value={reminderForm.days_before_after}
                      onChange={(e) => setReminderForm({ ...reminderForm, days_before_after: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Date
                  </label>
                  <input
                    type="date"
                    value={reminderForm.reminder_date}
                    onChange={(e) => setReminderForm({ ...reminderForm, reminder_date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createReminderMutation.isPending}
                    className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    {createReminderMutation.isPending ? 'Creating...' : 'Schedule'}
                  </button>
                </div>
              </form>
            )}

            {/* Reminders List */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
              </div>
            ) : reminders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No scheduled reminders
              </div>
            ) : (
              <div className="space-y-2">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(reminder.reminder_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {reminder.reminder_type.replace('_', ' ')}
                          {reminder.email_sent && (
                            <span className="ml-2 text-green-600">✓ Sent</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!reminder.email_sent && clientEmail && (
                        <button
                          onClick={() => sendReminderMutation.mutate(reminder.id)}
                          disabled={sendReminderMutation.isPending}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md"
                          title="Send now"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          const confirmed = await showConfirm({
                            title: 'Delete Reminder',
                            message: 'Are you sure you want to delete this reminder?',
                            confirmText: 'Delete',
                            cancelText: 'Cancel'
                          });
                          if (confirmed) {
                            deleteReminderMutation.mutate(reminder.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
