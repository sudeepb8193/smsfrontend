import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import DatePicker from '../../../../components/shared/DatePicker';
import TimePicker from '../../../../components/shared/TimePicker';
import Textarea from '../../../../components/shared/Textarea';
import { toast } from 'sonner';
import { submitCorrectionRequest } from '../../api/staffAttendanceApi';

export const CorrectionRequestModal = ({
  isOpen,
  onClose,
  onSuccess,
  prefilledDate,
  prefilledAttendanceId,
  staffId,
  organizationId,
}) => {
  const [correctionDate, setCorrectionDate] = useState(
    prefilledDate || new Date().toISOString().split('T')[0],
  );
  const [requestedCheckIn, setRequestedCheckIn] = useState('09:00');
  const [requestedCheckOut, setRequestedCheckOut] = useState('17:00');
  const [reason, setReason] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('A reason is required to submit an attendance correction.');
      return;
    }
    if (!requestedCheckIn && !requestedCheckOut) {
      toast.error('Please specify at least one proposed punch time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const inDate = requestedCheckIn
        ? `${correctionDate}T${requestedCheckIn}:00.000Z`
        : undefined;
      const outDate = requestedCheckOut
        ? `${correctionDate}T${requestedCheckOut}:00.000Z`
        : undefined;

      await submitCorrectionRequest(
        {
          attendanceId: prefilledAttendanceId || undefined,
          staffId: staffId || undefined,
          correctionDate,
          requestedCheckInAt: inDate,
          requestedCheckOutAt: outDate,
          reason: reason.trim(),
          supportingDocumentUrl: documentUrl.trim() || undefined,
        },
        organizationId,
      );

      toast.success('Correction request submitted and queued for manager review.');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to submit correction request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Attendance Correction"
      description="Submit a formal punch correction request for manager sign-off. Original records remain preserved in audit history."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <DatePicker
            label="Attendance Date *"
            value={correctionDate}
            onChange={setCorrectionDate}
            maxDate={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TimePicker
            label="Proposed Check-In Time"
            value={requestedCheckIn}
            onChange={(val) => setRequestedCheckIn(val)}
            timeFormat="24h"
            step={15}
          />
          <TimePicker
            label="Proposed Check-Out Time"
            value={requestedCheckOut}
            onChange={(val) => setRequestedCheckOut(val)}
            timeFormat="24h"
            step={15}
          />
        </div>

        <div>
          <Textarea
            label="Reason for Correction"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Forgot to clock out at the front-desk tablet when leaving at 5:00 PM."
            rows={3}
            maxLength={255}
            showCharCount={true}
            required
          />
        </div>

        <div>
          <Input
            label="Supporting Document / Evidence Link (Optional)"
            type="url"
            value={documentUrl}
            onChange={(e) => setDocumentUrl(e.target.value)}
            placeholder="https://... (screenshot, note, or reference link)"
            maxLength={500}
            showCharCount={true}
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--border-color)]">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CorrectionRequestModal;
