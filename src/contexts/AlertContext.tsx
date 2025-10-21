'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomAlert, { AlertType } from '@/components/CustomAlert';

interface AlertConfig {
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((message: string, type: AlertType = 'info') => {
    setAlertConfig({ message, type });
  }, []);

  const showSuccess = useCallback((message: string) => {
    setAlertConfig({ message, type: 'success' });
  }, []);

  const showError = useCallback((message: string) => {
    setAlertConfig({ message, type: 'error' });
  }, []);

  const showWarning = useCallback((message: string) => {
    setAlertConfig({ message, type: 'warning' });
  }, []);

  const showInfo = useCallback((message: string) => {
    setAlertConfig({ message, type: 'info' });
  }, []);

  const showConfirm = useCallback(
    (message: string, onConfirm: () => void, onCancel?: () => void) => {
      setAlertConfig({
        message,
        type: 'confirm',
        onConfirm,
        onCancel,
      });
    },
    []
  );

  const closeAlert = useCallback(() => {
    setAlertConfig(null);
  }, []);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
      }}
    >
      {children}
      {alertConfig && (
        <CustomAlert
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={closeAlert}
          onConfirm={alertConfig.onConfirm}
          onCancel={alertConfig.onCancel}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
