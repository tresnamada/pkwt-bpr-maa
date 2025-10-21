'use client';

import { useState, useCallback } from 'react';
import { AlertType } from '@/components/CustomAlert';

interface AlertConfig {
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmConfig extends AlertConfig {
  onConfirm: () => void;
  onCancel?: () => void;
}

export function useCustomAlert() {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
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

  const showConfirm = useCallback((config: ConfirmConfig) => {
    setConfirmConfig(config);
  }, []);

  const closeAlert = useCallback(() => {
    setAlertConfig(null);
    setConfirmConfig(null);
  }, []);

  return {
    alertConfig,
    confirmConfig,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    closeAlert,
  };
}
