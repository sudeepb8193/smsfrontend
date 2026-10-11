import React, { useState } from 'react';
import Modal from '../../../components/shared/Modal';
import Input from '../../../components/shared/Input';
import Textarea from '../../../components/shared/Textarea';
import Button from '../../../components/shared/Button';
import Toggle from '../../../components/shared/Toggle';
import { Layers, Plus } from 'lucide-react';
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

export const CreateModuleModal = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [moduleLabel, setModuleLabel] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [description, setDescription] = useState('');
  const [selectedActions, setSelectedActions] = useState(['view', 'create', 'edit', 'delete']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Auto-generate slug from label if not manually customized
  const handleLabelChange = (val) => {
    setModuleLabel(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    setModuleCode(slug);
  };

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
    if (!moduleCode.trim()) nextErrors.moduleCode = 'Module code is required';
    if (!/^[a-z0-9_-]+$/.test(moduleCode.trim())) {
      nextErrors.moduleCode = 'Module code must be lowercase letters, numbers, and underscores';
    }
    if (selectedActions.length === 0) {
      nextErrors.actions = 'Select at least one supported action for this module';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await onSuccess({
        moduleCode: moduleCode.trim(),
        moduleLabel: moduleLabel.trim(),
        actions: selectedActions,
        description: description.trim() || undefined,
      });
      // Reset form
      setModuleLabel('');
      setModuleCode('');
      setDescription('');
      setSelectedActions(['view', 'create', 'edit', 'delete']);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to register module');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Application Module"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/40 rounded-xl p-3.5 flex items-center gap-3 text-primary-800 dark:text-primary-200 text-xs">
          <Layers size={18} className="shrink-0 text-primary-600 dark:text-primary-400" />
          <p>
            Define a new business module and its authorized operations. The permissions catalog will dynamically generate corresponding permissions for all roles.
          </p>
        </div>

        <Input
          label="Module Display Name"
          placeholder="e.g. Gift Cards & Vouchers, Client Feedback"
          value={moduleLabel}
          onChange={(e) => handleLabelChange(e.target.value)}
          error={errors.moduleLabel}
          required
        />

        <Input
          label="Module Identifier Code"
          placeholder="e.g. gift_cards"
          value={moduleCode}
          onChange={(e) => setModuleCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
          error={errors.moduleCode}
          helperText="Unique machine code used in API access checks (lowercase alphanumeric)"
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
            icon={Plus}
          >
            Create Module & Actions
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateModuleModal;
