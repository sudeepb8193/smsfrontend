import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

export const DeleteOrganisationModal = ({
  isOpen,
  onClose,
  onConfirm,
  organisation,
  loading,
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setConfirmInput('');
    setErrorMsg('');
  }, [isOpen, organisation]);

  if (!isOpen || !organisation) return null;

  const isMatching =
    confirmInput.trim().toLowerCase() === organisation.name.trim().toLowerCase();

  const handleConfirm = () => {
    if (!isMatching) {
      setErrorMsg(`Please type "${organisation.name}" exactly to confirm deletion.`);
      return;
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-rose-500/20 overflow-hidden text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-rose-500/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Delete Organisation?
              </h3>
              <p className="text-xs text-rose-500 font-medium">
                Irreversible Action Warning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm leading-relaxed">
            <strong>Warning:</strong> Deleting an organisation can affect its branches, users, customers, appointments, billing and other associated data.
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Type <span className="text-rose-500 font-bold font-mono">"{organisation.name}"</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => {
                setConfirmInput(e.target.value);
                setErrorMsg('');
              }}
              placeholder={`Type "${organisation.name}"`}
              className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-rose-500/30 focus:border-rose-500 transition-all placeholder:text-[var(--text-muted)]"
            />
            {errorMsg && (
              <p className="text-xs font-medium text-rose-500 mt-1">
                {errorMsg}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[var(--bg-input)] border-t border-[var(--border-color)]">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isMatching || loading}
            className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 ${isMatching
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] cursor-not-allowed'
              }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Organisation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteOrganisationModal;
