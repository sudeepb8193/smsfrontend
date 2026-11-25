import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { ToastContext } from './ToastContext';
import ToastContainer from './ToastContainer';
import {
  configureToastStore,
  subscribeToToasts,
  getToastSnapshot,
  dismissToast,
  pauseToast,
  resumeToast,
  toast,
} from './toastStore';

/**
 * Centralized ToastProvider mounting the fixed bottom-center ToastContainer
 * and providing the useToast() hook across the SMS application.
 */
export function ToastProvider({
  children,
  defaultDuration = 4000,
  maxToasts = 4,
}) {
  useEffect(() => {
    configureToastStore({ defaultDuration, maxToasts });
  }, [defaultDuration, maxToasts]);

  const toasts = useSyncExternalStore(
    subscribeToToasts,
    getToastSnapshot,
    getToastSnapshot,
  );

  const contextValue = useMemo(
    () => ({
      toasts,
      toast,
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
      dismiss: toast.dismiss,
      clear: toast.clear,
    }),
    [toasts],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        onPause={pauseToast}
        onResume={resumeToast}
      />
    </ToastContext.Provider>
  );
}

export default ToastProvider;
