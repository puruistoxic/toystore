import React from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
  confirmText?: string;
  cancelText?: string;
}

export default function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText,
  cancelText
}: AlertModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'confirm':
        return <AlertCircle className="w-6 h-6 text-blue-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'success':
        return 'Success';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      case 'confirm':
        return 'Confirm';
      default:
        return 'Information';
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'confirm':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-teal-600 hover:bg-teal-700';
    }
  };

  const isConfirmType = type === 'confirm' || onConfirm !== undefined;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <h3 className="text-lg font-semibold text-gray-900">
                {getTitle()}
              </h3>
            </div>
            {!isConfirmType && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap break-words">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
            {isConfirmType ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium touch-manipulation w-full sm:w-auto"
                >
                  {cancelText || 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                  }}
                  className={`px-4 py-2.5 ${getConfirmButtonColor()} text-white rounded-lg transition-colors text-sm font-medium touch-manipulation w-full sm:w-auto`}
                >
                  {confirmText || (type === 'confirm' ? 'Confirm' : 'OK')}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className={`px-4 py-2.5 ${getConfirmButtonColor()} text-white rounded-lg transition-colors text-sm font-medium touch-manipulation w-full sm:w-auto`}
              >
                {confirmText || 'OK'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

