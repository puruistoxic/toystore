import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoicingApi } from '../../utils/api';
import { Clock, Eye, Loader2, Plus, Edit, Trash2, RotateCcw, ChevronDown, ChevronUp, User, Calendar, FileText, AlertCircle, X } from 'lucide-react';
import { formatRelativeTime, formatDateTime } from '../../utils/dateUtils';

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

interface EntityHistoryProps {
  entityType: 'proposal' | 'invoice' | 'client';
  entityId: string;
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
  'proposal_id',
  'invoice_id'
];

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
      if (value.length > 0 && typeof value[0] === 'object' && value[0].hasOwnProperty('description')) {
        return `${value.length} item(s): ${value.map((item: any) => item.description || 'Item').slice(0, 3).join(', ')}${value.length > 3 ? '...' : ''}`;
      }
      return `${value.length} item(s)`;
    }
    const keys = Object.keys(value);
    if (keys.length === 0) return 'Empty object';
    if (keys.length <= 3) {
      return keys.map(k => `${k}: ${value[k]}`).join(', ');
    }
    return `${keys.length} properties`;
  }
  if (typeof value === 'string') {
    if (value.length > 150) {
      return value.substring(0, 150) + '...';
    }
    return value;
  }
  return String(value);
}

// Check if a field change is meaningful
function isMeaningfulChange(field: string, oldVal: any, newVal: any): boolean {
  if (SYSTEM_FIELDS.includes(field.toLowerCase())) {
    if (field === 'is_deleted' || field === 'deleted_at') {
      return oldVal !== newVal && (newVal === 1 || newVal !== null);
    }
    return false;
  }
  if (JSON.stringify(oldVal) === JSON.stringify(newVal)) {
    return false;
  }
  if ((!oldVal || oldVal === '' || oldVal === null) && 
      (!newVal || newVal === '' || newVal === null)) {
    return false;
  }
  return true;
}

// Extract field-level changes
function extractFieldChanges(before: any, after: any) {
  const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

  allKeys.forEach((key) => {
    const oldVal = before?.[key];
    const newVal = after?.[key];
    if (!isMeaningfulChange(key, oldVal, newVal)) {
      return;
    }
    changes.push({ field: key, oldValue: oldVal, newValue: newVal });
  });

  const importantFields = ['title', 'name', 'status', 'total', 'items', 'client_id', 'description'];
  changes.sort((a, b) => {
    const aImportant = importantFields.indexOf(a.field.toLowerCase());
    const bImportant = importantFields.indexOf(b.field.toLowerCase());
    if (aImportant !== -1 && bImportant !== -1) return aImportant - bImportant;
    if (aImportant !== -1) return -1;
    if (bImportant !== -1) return 1;
    return a.field.localeCompare(b.field);
  });

  return changes;
}

export default function EntityHistory({ entityType, entityId }: EntityHistoryProps) {
  const [expandedEntryId, setExpandedEntryId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery<{ history: HistoryEntry[] }>({
    queryKey: ['entity-history', entityType, entityId],
    queryFn: async () => {
      const response = await invoicingApi.getHistory(entityType, entityId);
      return response.data;
    },
    enabled: !!entityId
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DELETE':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'RESTORE':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Plus className="w-3 h-3" />;
      case 'UPDATE':
        return <Edit className="w-3 h-3" />;
      case 'DELETE':
        return <Trash2 className="w-3 h-3" />;
      case 'RESTORE':
        return <RotateCcw className="w-3 h-3" />;
      default:
        return <Edit className="w-3 h-3" />;
    }
  };


  const getChangeSummary = (entry: HistoryEntry): string => {
    if (entry.action === 'CREATE') {
      return 'Record created';
    }
    if (entry.action === 'DELETE') {
      return 'Record deleted';
    }
    if (entry.action === 'RESTORE') {
      return 'Record restored';
    }
    if (entry.action === 'UPDATE' && entry.changes) {
      const before = entry.changes.before || {};
      const after = entry.changes.after || {};
      const changedFields = Object.keys(after).filter(
        (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key])
      );
      if (changedFields.length > 0) {
        return `${changedFields.length} field${changedFields.length > 1 ? 's' : ''} changed`;
      }
    }
    return 'Record updated';
  };

  const toggleExpand = (entryId: number) => {
    setExpandedEntryId(expandedEntryId === entryId ? null : entryId);
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
        <span className="ml-2 text-xs text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-3">
        <p className="text-xs text-red-800">Failed to load history. Please try again.</p>
      </div>
    );
  }

  if (!data || !data.history || data.history.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
        <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
        <p className="text-xs text-gray-600">No history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.history.map((entry) => {
        const isExpanded = expandedEntryId === entry.id;
        const fieldChanges = entry.changes
          ? extractFieldChanges(entry.changes.before, entry.changes.after)
          : [];
        
        // For CREATE, extract meaningful fields
        const createdFields = entry.action === 'CREATE' && entry.changes?.created
          ? Object.keys(entry.changes.created)
              .filter(key => {
                if (!entry.changes?.created) return false;
                const value = entry.changes.created[key];
                return !SYSTEM_FIELDS.includes(key.toLowerCase()) && 
                       value !== null && 
                       value !== undefined && 
                       value !== '';
              })
              .map(key => ({
                field: key,
                oldValue: null,
                newValue: entry.changes?.created?.[key] ?? null
              }))
          : [];

        return (
          <div
            key={entry.id}
            className="bg-white border border-gray-200 rounded-md overflow-hidden transition-all"
          >
            {/* Summary Row - Clickable */}
            <div
              className="p-2.5 hover:border-teal-300 hover:shadow-sm transition-all cursor-pointer group relative"
              onClick={() => toggleExpand(entry.id)}
            >
              <div className="flex items-start gap-2 pr-8">
                {/* Action icon badge */}
                <div className={`p-1 rounded border flex-shrink-0 ${getActionColor(entry.action)}`}>
                  {getActionIcon(entry.action)}
                </div>
                
                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 leading-tight mb-0.5">
                    {getChangeSummary(entry)}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <span className="truncate">{entry.username}</span>
                    <span>•</span>
                    <span className="whitespace-nowrap">{formatRelativeTime(entry.created_at)}</span>
                  </div>
                </div>
              </div>
              
              {/* Action type label */}
              <div className={`absolute top-1.5 right-1.5 px-1 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider border ${getActionColor(entry.action)}`}>
                {entry.action}
              </div>
              
              {/* Expand/Collapse icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(entry.id);
                }}
                className="absolute bottom-1.5 right-1.5 p-1 text-gray-400 hover:text-teal-600 transition-all"
                title={isExpanded ? "Collapse" : "Expand details"}
              >
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50">
                <div className="p-3 max-h-[400px] overflow-y-auto">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 pb-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-500">User</p>
                        <p className="text-xs font-medium text-gray-900">{entry.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-500">Date & Time</p>
                        <p className="text-xs font-medium text-gray-900">{formatDateTime(entry.created_at)}</p>
                      </div>
                    </div>
                    {entry.entity_name && (
                      <div className="flex items-center space-x-2">
                        <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-500">Entity</p>
                          <p className="text-xs font-medium text-gray-900 truncate">{entry.entity_name}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Field Changes */}
                  {entry.action === 'UPDATE' && fieldChanges.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 mb-2">
                        Changed Fields ({fieldChanges.length})
                      </h4>
                      <div className="space-y-2">
                        {fieldChanges.map((change, index) => (
                          <div key={index} className="border border-gray-200 rounded-md p-2.5 bg-white">
                            <p className="text-[11px] font-semibold text-gray-900 mb-1.5">
                              {formatFieldName(change.field)}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <p className="text-[9px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Previous</p>
                                <div className="bg-red-50 border border-red-200 rounded p-1.5 min-h-[32px]">
                                  <p className="text-[11px] text-gray-700 break-words whitespace-pre-wrap">
                                    {formatValue(change.oldValue)}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-[9px] font-medium text-gray-500 mb-1 uppercase tracking-wide">New</p>
                                <div className="bg-green-50 border border-green-200 rounded p-1.5 min-h-[32px]">
                                  <p className="text-[11px] text-gray-700 break-words whitespace-pre-wrap">
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

                  {/* CREATE Fields */}
                  {entry.action === 'CREATE' && createdFields.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 mb-2">
                        Created Fields ({createdFields.length})
                      </h4>
                      <div className="space-y-2">
                        {createdFields.map((change, index) => (
                          <div key={index} className="border border-gray-200 rounded-md p-2.5 bg-white">
                            <p className="text-[11px] font-semibold text-gray-900 mb-1.5">
                              {formatFieldName(change.field)}
                            </p>
                            <div className="bg-green-50 border border-green-200 rounded p-1.5">
                              <p className="text-[11px] text-gray-700 break-words whitespace-pre-wrap">
                                {formatValue(change.newValue)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DELETE */}
                  {entry.action === 'DELETE' && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <p className="text-xs text-red-800">This record was deleted.</p>
                      </div>
                    </div>
                  )}

                  {/* RESTORE */}
                  {entry.action === 'RESTORE' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <p className="text-xs text-yellow-800">This record was restored from archive.</p>
                      </div>
                    </div>
                  )}

                  {/* No changes message */}
                  {entry.action === 'UPDATE' && fieldChanges.length === 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                      <p className="text-xs text-gray-600">No specific field changes detected.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

