import React, { createContext, useContext, useState, ReactNode } from 'react';
import AlertModal from '../components/common/AlertModal';

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface AlertOptions {
  title?: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => Promise<boolean>;
  showConfirm: (options: Omit<AlertOptions, 'type'>) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const showAlert = (options: AlertOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlert(options);
      setResolvePromise(() => resolve);
    });
  };

  const showConfirm = (options: Omit<AlertOptions, 'type'>): Promise<boolean> => {
    return showAlert({
      ...options,
      type: 'confirm'
    });
  };

  const handleClose = (confirmed: boolean) => {
    if (alert) {
      if (confirmed && alert.onConfirm) {
        alert.onConfirm();
      } else if (!confirmed && alert.onCancel) {
        alert.onCancel();
      }
    }
    if (resolvePromise) {
      resolvePromise(confirmed);
    }
    setAlert(null);
    setResolvePromise(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {alert && (
        <AlertModal
          isOpen={!!alert}
          onClose={() => handleClose(false)}
          onConfirm={() => handleClose(true)}
          title={alert.title}
          message={alert.message}
          type={alert.type || 'info'}
          confirmText={alert.confirmText}
          cancelText={alert.cancelText}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

