import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  size = 'medium',
  closeOnOverlayClick = true,
  children,
  footer,
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-xl',
    large: 'max-w-3xl',
    fullscreen: 'max-w-full h-screen max-h-screen rounded-none',
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick && onClose) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* 100% Solid Fullscreen Dimmed Backdrop with Oversized Bleed & Blur to eliminate any browser top edge gaps */}
      <div
        className="fixed -inset-10 bg-black/75 backdrop-blur-md transition-opacity duration-200 animate-fadeOnly"
        onClick={handleOverlayClick}
        aria-hidden="true"
        style={{
          WebkitBackdropFilter: 'blur(8px)',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal Dialog Centering Wrapper */}
      <div
        className="min-h-full flex items-center justify-center p-4 relative z-10"
        onClick={handleOverlayClick}
      >
        <div
          className={`relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] w-full overflow-hidden text-[var(--text-primary)] transition-all duration-200 animate-fadeIn ${
            sizeClasses[size] || sizeClasses.medium
          } ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between gap-3 shrink-0">
            {title && (
              <h3 id="modal-title" className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                {title}
              </h3>
            )}
            {onClose && (
              <button
                type="button"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] p-1.5 rounded-lg transition-all cursor-pointer"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-input)] flex items-center justify-end gap-3 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export default Modal;
