import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from '../Button/Button';

export const ErrorMessage = ({
  message = 'An unexpected error occurred.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <AlertCircle size={20} className="shrink-0 text-red-400" />
        <span className="font-medium">{message}</span>
      </div>

      {onRetry && (
        <Button variant="ghost" size="small" icon={RotateCcw} onClick={onRetry} className="text-red-400 hover:bg-red-500/15">
          Retry
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
