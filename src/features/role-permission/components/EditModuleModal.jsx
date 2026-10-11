import React, { useState, useEffect } from 'react';
import Modal from '../../../components/shared/Modal';
import Input from '../../../components/shared/Input';
import Textarea from '../../../components/shared/Textarea';
import Button from '../../../components/shared/Button';
import Toggle from '../../../components/shared/Toggle';
import { Layers, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_ACTIONS = [
  { key: 'view', label: 'View', desc: 'Read & view records in this module' },
  { key: 'create', label: 'Create', desc: 'Create new entries' },
  { key: 'edit', label: 'Edit', desc: 'Modify existing records' },
  { key: 'delete', label: 'Delete', desc: 'Remove records' },
  { key: 'approve', label: 'Approve', desc: 'Authorize workflows & transactions' },
  { key: 'export', label: 'Export', desc: 'Download CSV / Excel reports' },
  { key: 'print', label: 'Print', desc: 'Print slips & document outputs' },
];

export const EditModuleModal = ({
  isOpen,
  onClose,
  module,
  onSuccess,
}) => {
  const [moduleLabel, setModuleLabel] = useState('');
  const [description, setDescription] = useState('');
  const [selectedActions, setSelectedActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (module) {
      setModuleLabel(module.moduleLabel || '');
      setDescription(module.description || module.permissions?.[0]?.description || '');
      const existingActions = module.permissions?.map((p) => p.action) || ['view'];
      setSelectedActions(existingActions);
      setErrors({});
    }
  }, [module, isOpen]);

  const handleToggleAction = (actionKey) => {
    if (selectedActions.includes(actionKey)) {
      if (actionKey === 'view' && selectedActions.length > 1) {
        toast.warning('View is mandatory when other module actions are active');
        return;
      }
      setSelectedActions(selectedActions.filter((a) => a !== actionKey));
    } else {
      setSelectedActions([...selectedActions, actionKey]);
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!moduleLabel.trim()) nextErrors.moduleLabel = 'Module name is required';
    if (selectedActions.length === 0) {
      nextErrors.actions = 'Select at least one supported action for this module';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate() || !module) return;

    try {
      setLoading(true);
      await onSuccess(module.moduleCode, {
        moduleLabel: moduleLabel.trim(),
        description: description.trim() || undefined,
        actions: selectedActions,
      });
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update module');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Module: ${module?.moduleLabel || ''}`}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/40 rounded-xl p-3.5 flex items-center gap-3 text-primary-800 dark:text-primary-200 text-xs">
          <Layers size={18} className="shrink-0 text-primary-600 dark:text-primary-400" />
          <p>
            Update the display name, description, and available operation actions for this module. Changes will synchronize across all role permission matrixes.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Module Identifier Code
          </label>
          <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80 select-none">
            {module?.moduleCode || ''}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Module identifier code is immutable to preserve system integrity.</span>
        </div>

        <Input
          label="Module Display Name"
          placeholder="e.g. Gift Cards & Vouchers"
          value={moduleLabel}
          onChange={(e) => setModuleLabel(e.target.value)}
          error={errors.moduleLabel}
          required
        />

        <Textarea
          label="Module Description (Optional)"
          placeholder="Brief description of this module's functional capabilities..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        {/* Action Capabilities */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Supported Action Operations <span className="text-danger-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AVAILABLE_ACTIONS.map((act) => {
              const isChecked = selectedActions.includes(act.key);
              return (
                <div
                  key={act.key}
                  onClick={() => handleToggleAction(act.key)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-primary-50/80 dark:bg-primary-950/30 border-primary-500/50 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {act.label}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      {act.desc}
                    </span>
                  </div>
                  <Toggle
                    checked={isChecked}
                    onChange={() => handleToggleAction(act.key)}
                    size="sm"
                    color="primary"
                    aria-label={`Toggle ${act.label}`}
                  />
                </div>
              );
            })}
          </div>
          {errors.actions && (
            <p className="text-xs text-danger-500 font-medium mt-1">{errors.actions}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={Save}
          >
            Save Module Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditModuleModal;
