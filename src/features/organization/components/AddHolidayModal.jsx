import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { organizationApi } from '../../../services/organization.api';
import { Modal } from '../../../components/common/Modal/Modal';
import { Input } from '../../../components/common/Input/Input';
import { Textarea } from '../../../components/common/Textarea/Textarea';
import { Button } from '../../../components/common/Button/Button';

export const AddHolidayModal = ({ orgId, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    holidayDate: '',
    isRecurringAnnually: false,
    branchId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        holidayDate: formData.holidayDate,
        isRecurringAnnually: formData.isRecurringAnnually,
        branchId: formData.branchId ? parseInt(formData.branchId, 10) : undefined,
      };
      await organizationApi.createHoliday(orgId, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create holiday');
    } finally {
      setLoading(false);
    }
  };

  const footerButtons = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="add-holiday-form"
        variant="primary"
        loading={loading}
        icon={Sparkles}
      >
        Save Holiday
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Holiday Event"
      size="medium"
      footer={footerButtons}
    >
      <form id="add-holiday-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
            {error}
          </div>
        )}

        <Input
          label="Holiday Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. New Year Day / Christmas"
        />

        <Input
          label="Holiday Date"
          type="date"
          required
          value={formData.holidayDate}
          onChange={(e) => setFormData({ ...formData, holidayDate: e.target.value })}
        />

        <Textarea
          label="Description (Optional)"
          rows={2}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Annual salon holiday closure"
        />

        <label className="flex items-center gap-2 pt-1 text-xs text-[var(--text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isRecurringAnnually}
            onChange={(e) => setFormData({ ...formData, isRecurringAnnually: e.target.checked })}
            className="rounded border-[var(--border-color)] text-primary-600 focus:ring-0 bg-[var(--bg-input)]"
          />
          <span>Recurring Annually (Applies automatically every year)</span>
        </label>
      </form>
    </Modal>
  );
};
