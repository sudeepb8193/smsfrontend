import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import CustomSelector from '../../../../components/shared/CustomSelector';
import DatePicker from '../../../../components/shared/DatePicker';
import Textarea from '../../../../components/shared/Textarea';
import { toast } from 'sonner';
import { submitManualAttendance } from '../../api/staffAttendanceApi';

export const ManualEntryModal = ({
  isOpen,
  onClose,
  onSuccess,
  staffList = [],
  branchId,
  organizationId,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [checkInTime, setCheckInTime] = useState('09:00');
  const [checkOutTime, setCheckOutTime] = useState('17:00');
  const [status, setStatus] = useState('present');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) {
      toast.error('Please select an employee.');
      return;
    }
    if (!attendanceDate) {
      toast.error('Please select attendance date.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build ISO timestamps using the date and HH:mm
      const inDate = checkInTime ? `${attendanceDate}T${checkInTime}:00.000Z` : undefined;
      const outDate = checkOutTime ? `${attendanceDate}T${checkOutTime}:00.000Z` : undefined;

      await submitManualAttendance(
        {
          staffId: selectedStaffId,
          branchId,
          attendanceDate,
          checkInAt: inDate,
          checkOutAt: outDate,
          status,
          reason,
        },
        organizationId,
      );

      toast.success('Manual attendance recorded successfully.');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to record manual attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const staffOptions = staffList.map((s) => ({
    value: s.id,
    label: `${s.fullName} (${s.employeeCode})`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manual Attendance Entry"
      description="Record an authorized manager attendance punch on behalf of an employee."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <CustomSelector
            label="Employee *"
            options={staffOptions}
            value={selectedStaffId}
            onChange={(val) => setSelectedStaffId(val)}
            placeholder="Select staff member..."
            isSearchable
            required
          />
        </div>

        <div>
          <DatePicker
            label="Attendance Date *"
            value={attendanceDate}
            onChange={setAttendanceDate}
            maxDate={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Check-In Time"
            type="time"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
          />
          <Input
            label="Check-Out Time"
            type="time"
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
          />
        </div>

        <div>
          <CustomSelector
            label="Override Status"
            options={[
              { value: 'present', label: 'Present' },
              { value: 'late', label: 'Late' },
              { value: 'early_exit', label: 'Early Exit' },
              { value: 'half_day', label: 'Half Day' },
              { value: 'absent', label: 'Absent' },
            ]}
            value={status}
            onChange={(val) => setStatus(val)}
            isClearable={false}
            isSearchable={false}
          />
        </div>

        <div>
          <Textarea
            label="Manager Reason / Note (Optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Employee forgot card, manager verified physical arrival."
            rows={2}
            maxLength={255}
            showCharCount={true}
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--border-color)]">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Recording...' : 'Save Attendance'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ManualEntryModal;
