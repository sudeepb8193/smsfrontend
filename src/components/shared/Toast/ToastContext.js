import { createContext, useContext } from 'react';

export const ToastContext = createContext(null);

/**
 * Access the SMS Toast notification API and active toast list.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
