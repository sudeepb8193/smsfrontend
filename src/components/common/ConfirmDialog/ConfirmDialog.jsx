import React from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle size={32} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={32} className="text-amber-500" />;
      case 'success':
        return <CheckCircle2 size={32} className="text-emerald-500" />;
      default:
        return <Info size={32} className="text-[#8A4A52]" />;
    }
  };

  const footer = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="secondary" onClick={onCancel} disabled={loading}>
        {cancelText}
      </Button>
      <Button variant={variant} onClick={onConfirm} loading={loading}>
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="small"
      closeOnOverlayClick={!loading}
      footer={footer}
    >
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
          {getIcon()}
        </div>
        <p className="text-sm text-[#C4B5BE] leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
