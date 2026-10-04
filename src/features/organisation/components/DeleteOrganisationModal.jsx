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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-100 dark:border-rose-900/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Organisation?
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Irreversible Action Warning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-200 text-sm leading-relaxed">
            <strong>Warning:</strong> Deleting an organisation can affect its branches, users, customers, appointments, billing and other associated data.
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Type <span className="text-rose-600 dark:text-rose-400 font-bold font-mono">"{organisation.name}"</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => {
                setConfirmInput(e.target.value);
                setErrorMsg('');
              }}
              placeholder={`Type "${organisation.name}"`}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
            {errorMsg && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-1">
                {errorMsg}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isMatching || loading}
            className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 ${
              isMatching
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
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
