import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import DatePicker from '../../../../components/shared/DatePicker';
import Textarea from '../../../../components/shared/Textarea';
import CustomSelector from '../../../../components/shared/CustomSelector';
import { ArrowLeftRight, Users, Calendar, AlertCircle } from 'lucide-react';

export default function ShiftSwapModal({
  isOpen,
  onClose,
  onSubmit,
  staffList = [],
  loading = false,
}) {
  const [staffAId, setStaffAId] = useState(staffList[0]?.id || '');
  const [staffBId, setStaffBId] = useState(staffList[1]?.id || '');
  const [dateA, setDateA] = useState(() => new Date().toISOString().substring(0, 10));
  const [dateB, setDateB] = useState(() => new Date().toISOString().substring(0, 10));
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState(null);

  const staffOptions = staffList.map((s) => ({
    value: s.id,
    label: `${s.fullName} (${s.employeeCode || 'EMP'})`,
  }));

  const staffA = staffList.find((s) => s.id === staffAId);
  const staffB = staffList.find((s) => s.id === staffBId);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!staffAId || !staffBId) {
      setFormError('Both employees must be selected');
      return;
    }
    if (staffAId === staffBId) {
      setFormError('Cannot swap shifts with the same employee');
      return;
    }
    if (!dateA || !dateB) {
      setFormError('Dates for both shifts must be specified');
      return;
    }
    if (!reason.trim()) {
      setFormError('A mandatory reason is required for shift swaps');
      return;
    }

    onSubmit({
      staffAId,
      staffBId,
      dateA,
      dateB,
      reason: reason.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Guided 2-Person Shift Swap"
      size="large"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="shift-swap-form"
            variant="primary"
            loading={loading}
          >
            Confirm Shift Swap
          </Button>
        </div>
      }
    >
      <form id="shift-swap-form" onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-500 font-medium">
            {formError}
          </div>
        )}

        {/* Side-by-side Employee & Shift Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Side A */}
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-3">
            <div className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Employee A</span>
            </div>
            <div>
              <CustomSelector
                label="Select Stylist *"
                options={staffOptions}
                value={staffAId}
                onChange={setStaffAId}
                placeholder="Select First Employee..."
                isSearchable={false}
                isClearable={false}
              />
            </div>
            <div>
              <DatePicker
                label="Shift Date *"
                value={dateA}
                onChange={(val) => setDateA(val)}
                required
              />
            </div>
          </div>

          {/* Side B */}
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-3">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Employee B</span>
            </div>
            <div>
              <CustomSelector
                label="Select Stylist *"
                options={staffOptions.filter((opt) => opt.value !== staffAId)}
                value={staffBId}
                onChange={setStaffBId}
                placeholder="Select Second Employee..."
                isSearchable={false}
                isClearable={false}
              />
            </div>
            <div>
              <DatePicker
                label="Shift Date *"
                value={dateB}
                onChange={(val) => setDateB(val)}
                required
              />
            </div>
          </div>
        </div>

        {/* Swap Preview Visualization */}
        {staffA && staffB && (
          <div className="p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-xs text-[var(--text-primary)] flex items-center justify-between gap-3 shadow-xs">
            <div className="flex-1 text-center font-semibold">
              <span className="font-bold text-[var(--text-primary)]">{staffA.fullName}</span> takes shift on{' '}
              <span className="text-primary-600 dark:text-primary-400 font-mono font-bold">{dateB}</span>
            </div>
            <ArrowLeftRight size={20} className="shrink-0 text-primary-500 animate-pulse" />
            <div className="flex-1 text-center font-semibold">
              <span className="font-bold text-[var(--text-primary)]">{staffB.fullName}</span> takes shift on{' '}
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{dateA}</span>
            </div>
          </div>
        )}

        {/* Reason using shared Textarea */}
        <div>
          <Textarea
            label="Reason for Swap (Mandatory Audit Trail) *"
            value={reason}
            maxLength={255}
            showCharCount
            onChange={(e) => setReason(e.target.value.slice(0, 255))}
            placeholder="e.g. Mutual schedule agreement, weekend family obligations..."
            rows={2}
            required
          />
        </div>

        {/* Notice */}
        <div className="text-[11px] text-[var(--text-muted)] flex items-start gap-2 p-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl">
          <AlertCircle size={15} className="shrink-0 text-primary-500 mt-0.5" />
          <span>
            Both sides of the swap will be linked atomically in the system. Canceling or rolling back one side
            will automatically prompt and reverse both linked records.
          </span>
        </div>
      </form>
    </Modal>
  );
}
