import React from 'react';
import { X, User, Calendar, FileText, AlertCircle } from 'lucide-react';

interface ChangeDetail {
  field: string;
  oldValue: any;
  newValue: any;
}

interface HistoryEntry {
  id: number;
  user_id: number;
  username: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
  entity_type: string;
  entity_id: string;
  entity_name: string | null;
  changes: {
    before?: any;
    after?: any;
    created?: any;
    deleted?: any;
  } | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyEntry: HistoryEntry | null;
}

// Helper function to format field names
function formatFieldName(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Helper function to format values for display
function formatValue(value: any): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      if (value.length === 0) return 'Empty';
      // For items array, show summary
      if (value.length > 0 && typeof value[0] === 'object' && value[0].hasOwnProperty('description')) {
        return `${value.length} item(s): ${value.map((item: any) => item.description || 'Item').slice(0, 3).join(', ')}${value.length > 3 ? '...' : ''}`;
      }
      return `${value.length} item(s)`;
    }
    // For objects, show a compact representation
    const keys = Object.keys(value);
    if (keys.length === 0) return 'Empty object';
    if (keys.length <= 3) {
      return keys.map(k => `${k}: ${value[k]}`).join(', ');
    }
    return `${keys.length} properties`;
  }
  if (typeof value === 'string') {
    // Truncate very long strings
    if (value.length > 150) {
      return value.substring(0, 150) + '...';
    }
    return value;
  }
  return String(value);
}

// System fields that should be filtered out unless they're meaningful changes
const SYSTEM_FIELDS = [
  'id',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'deleted_at',
  'deleted_by',
  'is_deleted',
  'proposal_id', // For invoices created from proposals
  'invoice_id' // For payments
];

// Check if a field change is meaningful
function isMeaningfulChange(field: string, oldVal: any, newVal: any): boolean {
  // Always exclude system fields unless it's a deletion/restore
  if (SYSTEM_FIELDS.includes(field.toLowerCase())) {
    // Only show if it's a meaningful change (e.g., is_deleted going from 0 to 1)
    if (field === 'is_deleted' || field === 'deleted_at') {
      return oldVal !== newVal && (newVal === 1 || newVal !== null);
    }
    return false;
  }

  // Skip if values are the same
  if (JSON.stringify(oldVal) === JSON.stringify(newVal)) {
    return false;
  }

  // Skip empty to empty transitions
  if ((!oldVal || oldVal === '' || oldVal === null) && 
      (!newVal || newVal === '' || newVal === null)) {
    return false;
  }

  return true;
}

// Extract field-level changes from before/after objects
function extractFieldChanges(before: any, after: any): ChangeDetail[] {
  const changes: ChangeDetail[] = [];
  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

  allKeys.forEach((key) => {
    const oldVal = before?.[key];
    const newVal = after?.[key];

    // Only include meaningful changes
    if (!isMeaningfulChange(key, oldVal, newVal)) {
      return;
    }

    changes.push({
      field: key,
      oldValue: oldVal,
      newValue: newVal
    });
  });

  // Sort changes: important fields first, then alphabetically
  const importantFields = ['title', 'name', 'status', 'total', 'items', 'client_id', 'description'];
  changes.sort((a, b) => {
    const aImportant = importantFields.indexOf(a.field.toLowerCase());
    const bImportant = importantFields.indexOf(b.field.toLowerCase());
    
    if (aImportant !== -1 && bImportant !== -1) {
      return aImportant - bImportant;
    }
    if (aImportant !== -1) return -1;
    if (bImportant !== -1) return 1;
    
    return a.field.localeCompare(b.field);
  });

  return changes;
}

export default function HistoryModal({ isOpen, onClose, historyEntry }: HistoryModalProps) {
  if (!isOpen || !historyEntry) return null;

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'RESTORE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const fieldChanges: ChangeDetail[] = historyEntry.changes
    ? extractFieldChanges(historyEntry.changes.before, historyEntry.changes.after)
    : [];

  const isCreate = historyEntry.action === 'CREATE';
  const isDelete = historyEntry.action === 'DELETE';
  const isRestore = historyEntry.action === 'RESTORE';

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 z-[100]"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative z-[101] inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getActionColor(historyEntry.action)}`}>
                  {historyEntry.action}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Change Details
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Basic Info - Compact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">User</p>
                  <p className="text-sm font-medium text-gray-900">{historyEntry.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Date & Time</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(historyEntry.created_at)}</p>
                </div>
              </div>

              {historyEntry.entity_name && (
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Entity</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{historyEntry.entity_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Changes Section - CREATE */}
            {isCreate && historyEntry.changes?.created && (() => {
              // Filter out system fields and show only meaningful fields
              const created = historyEntry.changes.created;
              const meaningfulFields: ChangeDetail[] = [];
              
              Object.keys(created).forEach(key => {
                if (!SYSTEM_FIELDS.includes(key.toLowerCase()) && created[key] !== null && created[key] !== undefined && created[key] !== '') {
                  meaningfulFields.push({
                    field: key,
                    oldValue: null,
                    newValue: created[key]
                  });
                }
              });
              
              if (meaningfulFields.length === 0) {
                return null;
              }
              
              return (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Created Fields ({meaningfulFields.length})
                  </h4>
                  <div className="space-y-2.5">
                    {meaningfulFields.map((change, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-3">
                        <p className="text-xs font-semibold text-gray-900 mb-2">
                          {formatFieldName(change.field)}
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded p-2">
                          <p className="text-xs text-gray-700 break-words whitespace-pre-wrap">
                            {formatValue(change.newValue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {isDelete && historyEntry.changes?.deleted && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Deleted Data</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                    {JSON.stringify(historyEntry.changes.deleted, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {isRestore && (
              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">This record was restored from archive.</p>
                  </div>
                </div>
              </div>
            )}

            {historyEntry.action === 'UPDATE' && fieldChanges.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Changed Fields ({fieldChanges.length})
                </h4>
                <div className="space-y-2.5">
                  {fieldChanges.map((change, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3 hover:border-teal-300 transition-colors">
                      <p className="text-xs font-semibold text-gray-900 mb-2">
                        {formatFieldName(change.field)}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Previous</p>
                          <div className="bg-red-50 border border-red-200 rounded p-2 min-h-[40px]">
                            <p className="text-xs text-gray-700 break-words whitespace-pre-wrap">
                              {formatValue(change.oldValue)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">New</p>
                          <div className="bg-green-50 border border-green-200 rounded p-2 min-h-[40px]">
                            <p className="text-xs text-gray-700 break-words whitespace-pre-wrap">
                              {formatValue(change.newValue)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {historyEntry.action === 'UPDATE' && fieldChanges.length === 0 && (
              <div className="mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">No specific field changes detected.</p>
                </div>
              </div>
            )}

            {/* Technical Details (Collapsible) */}
            <details className="mt-6">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                Technical Details
              </summary>
              <div className="mt-3 space-y-2 text-xs text-gray-600">
                {historyEntry.ip_address && (
                  <p>
                    <span className="font-medium">IP Address:</span> {historyEntry.ip_address}
                  </p>
                )}
                {historyEntry.user_agent && (
                  <p>
                    <span className="font-medium">User Agent:</span> {historyEntry.user_agent}
                  </p>
                )}
                <p>
                  <span className="font-medium">Entity ID:</span> {historyEntry.entity_id}
                </p>
                <p>
                  <span className="font-medium">Log ID:</span> {historyEntry.id}
                </p>
              </div>
            </details>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

