import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  confirmLabel,
  cancelText = 'Cancel',
  cancelLabel,
  variant = 'danger',
  confirmVariant,
  loading = false,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const handleCancel = onCancel || onClose;
  const actualConfirmText = confirmLabel || confirmText;
  const actualCancelText = cancelLabel || cancelText;
  const actualVariant = confirmVariant || variant;

  const getIcon = () => {
    switch (actualVariant) {
      case 'danger':
        return <AlertTriangle size={32} className="text-danger-500" />;
      case 'warning':
        return <AlertTriangle size={32} className="text-warning-500" />;
      case 'success':
        return <CheckCircle2 size={32} className="text-success-500" />;
      default:
        return <Info size={32} className="text-primary-500" />;
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="secondary" onClick={handleCancel} disabled={loading}>
        {actualCancelText}
      </Button>
      <Button variant={actualVariant} onClick={onConfirm} loading={loading}>
        {actualConfirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      size="small"
      closeOnOverlayClick={!loading}
      footer={footer}
    >
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-14 h-14 rounded-full bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-center">
          {getIcon()}
        </div>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
