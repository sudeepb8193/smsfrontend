import React, { useState } from 'react';
import Modal from '../../../components/shared/Modal';
import Input from '../../../components/shared/Input';
import Textarea from '../../../components/shared/Textarea';
import CustomSelector from '../../../components/shared/CustomSelector';
import Button from '../../../components/shared/Button';
import { Shield, Copy, ArrowRight } from 'lucide-react';

export const CreateRoleModal = ({
  isOpen,
  onClose,
  onSubmit,
  existingRoles = [],
  loading = false,
  organizationId = null,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clonedFromRoleId: '',
  });
  const [errors, setErrors] = useState({});

  const roleOptions = [
    { value: '', label: 'Start from scratch (blank permissions)' },
    ...existingRoles.map((r) => ({
      value: r.id,
      label: `Clone from ${r.name} (${r.roleType === 'system' ? 'System' : 'Custom'})`,
    })),
  ];

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = 'Role name is required';
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = 'Role name must be at least 2 characters';
    } else if (formData.name.trim().length > 80) {
      nextErrors.name = 'Role name must not exceed 80 characters';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      clonedFromRoleId: formData.clonedFromRoleId || undefined,
      organizationId: organizationId || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Custom Role"
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/40 rounded-xl p-3.5 flex items-center gap-3 text-primary-800 dark:text-primary-200 text-xs mb-2">
          <Shield size={18} className="shrink-0 text-primary-600 dark:text-primary-400" />
          <p>
            Custom roles allow fine-grained access control tailored to your salon’s team structure. After creating the role, you can customize its module permissions and branch scopes.
          </p>
        </div>

        <Input
          label="Role Name"
          placeholder="e.g. Senior Hair Stylist, Lead Receptionist"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
        />

        <Textarea
          label="Role Description"
          placeholder="Brief description of the responsibilities and scope of this role..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Copy size={13} className="text-primary-500" />
            Clone Existing Permissions (Optional)
          </label>
          <CustomSelector
            options={roleOptions}
            value={formData.clonedFromRoleId}
            onChange={(val) => setFormData({ ...formData, clonedFromRoleId: val })}
            placeholder="Start from scratch (blank permissions)"
            isClearable={false}
          />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Select an existing role to copy its permissions as a starting template.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={ArrowRight}
          >
            Create & Configure Permissions
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateRoleModal;
