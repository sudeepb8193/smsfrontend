import React, { useState, useEffect } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Input from '../../../components/shared/Input';
import Toggle from '../../../components/shared/Toggle';
import Badge from '../../../components/shared/Badge';
import Loader from '../../../components/shared/Loader';
import { toast } from 'sonner';
import {
  saveOrganizationPolicy,
  saveBranchPolicy,
  deleteBranchPolicy,
} from '../api/staffAttendanceApi';
import {
  Settings,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const AttendanceSettingsTab = ({
  policyData,
  isLoading,
  branchId,
  organizationId,
  onRefresh,
  canManage,
}) => {
  const [lateGrace, setLateGrace] = useState('10');
  const [earlyExitGrace, setEarlyExitGrace] = useState('10');
  const [halfDayThreshold, setHalfDayThreshold] = useState('240');
  const [overtimeThreshold, setOvertimeThreshold] = useState('15');
  const [overtimeApproval, setOvertimeApproval] = useState(true);
  const [absentCutoff, setAbsentCutoff] = useState('120');
  const [allowedMethods, setAllowedMethods] = useState([
    'biometric',
    'geofenced_app',
    'manual',
  ]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (policyData) {
      setLateGrace(String(policyData.lateGraceMinutes ?? 10));
      setEarlyExitGrace(String(policyData.earlyExitGraceMinutes ?? 10));
      setHalfDayThreshold(String(policyData.halfDayThresholdMinutes ?? 240));
      setOvertimeThreshold(String(policyData.overtimeThresholdMinutes ?? 15));
      setOvertimeApproval(policyData.overtimeRequiresApproval ?? true);
      setAbsentCutoff(String(policyData.absentCutoffMinutes ?? 120));

      const methods = (policyData.allowedCheckinMethods || '')
        .split(',')
        .map((m) => m.trim().toLowerCase())
        .filter(Boolean);
      if (methods.length > 0) {
        setAllowedMethods(methods);
      }
    }
  }, [policyData]);

  const isBranchOverride = policyData?.isBranchOverride || false;
  const effectiveScope = policyData?.effectiveScope || 'ORGANIZATION_DEFAULT';

  // Strict numeric input sanitizer: accepts only digits (0-9) up to specified max character count
  const handleDigitChange = (setter, maxChars) => (e) => {
    const rawValue = e.target.value;
    const digitsOnly = rawValue.replace(/\D/g, '').slice(0, maxChars);
    setter(digitsOnly);
  };

  const toggleMethod = (methodKey) => {
    setAllowedMethods((prev) =>
      prev.includes(methodKey)
        ? prev.filter((m) => m !== methodKey)
        : [...prev, methodKey],
    );
  };

  const handleSave = async (isBranch = false) => {
    if (allowedMethods.length === 0) {
      toast.error('At least one punch capture method must be enabled.');
      return;
    }

    const lateVal = Number(lateGrace);
    const earlyVal = Number(earlyExitGrace);
    const halfVal = Number(halfDayThreshold);
    const otVal = Number(overtimeThreshold);
    const absentVal = Number(absentCutoff);

    if (lateGrace === '' || isNaN(lateVal) || lateVal < 0 || lateVal > 120) {
      toast.error('Late Grace Period must be between 0 and 120 minutes.');
      return;
    }
    if (earlyExitGrace === '' || isNaN(earlyVal) || earlyVal < 0 || earlyVal > 120) {
      toast.error('Early Exit Grace Period must be between 0 and 120 minutes.');
      return;
    }
    if (halfDayThreshold === '' || isNaN(halfVal) || halfVal < 60 || halfVal > 720) {
      toast.error('Half-Day Threshold must be between 60 and 720 minutes (1h - 12h).');
      return;
    }
    if (absentCutoff === '' || isNaN(absentVal) || absentVal < 30 || absentVal > 480) {
      toast.error('Absent Cutoff must be between 30 and 480 minutes (0.5h - 8h).');
      return;
    }
    if (overtimeThreshold === '' || isNaN(otVal) || otVal < 0 || otVal > 240) {
      toast.error('Overtime Threshold must be between 0 and 240 minutes.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        branchId: isBranch ? branchId : undefined,
        lateGraceMinutes: lateVal,
        earlyExitGraceMinutes: earlyVal,
        halfDayThresholdMinutes: halfVal,
        overtimeThresholdMinutes: otVal,
        overtimeRequiresApproval: Boolean(overtimeApproval),
        absentCutoffMinutes: absentVal,
        allowedCheckinMethods: allowedMethods.join(','),
      };

      if (isBranch && branchId) {
        await saveBranchPolicy(branchId, payload, organizationId);
        toast.success('Branch attendance policy override saved successfully.');
      } else {
        await saveOrganizationPolicy(payload, organizationId);
        toast.success('Organization default attendance policy saved.');
      }

      onRefresh?.();
    } catch (err) {
      toast.error(err?.message || 'Failed to save policy.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveOverride = async () => {
    if (!branchId) return;
    setIsSaving(true);
    try {
      await deleteBranchPolicy(branchId, organizationId);
      toast.success('Branch policy override removed. Inheriting organization default.');
      onRefresh?.();
    } catch (err) {
      toast.error(err?.message || 'Failed to remove branch override.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader size="lg" text="Loading effective attendance policy..." />
      </div>
    );
  }

  // Live parsed values for simulator
  const simLate = Number(lateGrace) || 10;
  const simCutoff = Number(absentCutoff) || 120;
  const simOT = Number(overtimeThreshold) || 15;

  return (
    <div className="space-y-5">
      {/* Policy Scope Header Banner */}
      <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[var(--text-primary)] text-sm">
              Current Policy Resolution:
            </h3>
            {isBranchOverride ? (
              <Badge variant="warning">Branch Override Active</Badge>
            ) : (
              <Badge variant="success">Inheriting Org Default</Badge>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {isBranchOverride
              ? 'This branch uses custom overtime, grace, and cutoff rules.'
              : 'Branch adheres to the organization-wide attendance baseline.'}
          </p>
        </div>

        {canManage && isBranchOverride && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveOverride}
            disabled={isSaving}
            icon={RotateCcw}
            className="text-rose-600 dark:text-rose-400 hover:text-rose-700"
          >
            Revert to Org Default
          </Button>
        )}
      </div>

      {/* Settings Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Punctuality & Grace Periods */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 shadow-xs">
          <div className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
            <Clock size={16} className="text-primary-500" />
            Grace Periods
          </div>

          <div>
            <Input
              label="Late Grace Period (Minutes)"
              type="text"
              inputMode="numeric"
              value={lateGrace}
              onChange={handleDigitChange(setLateGrace, 3)}
              maxLength={3}
              showCharCount={true}
              placeholder="0 - 120"
              helperText="Minutes past scheduled shift start before arrival is marked Late (0 - 120 mins)."
              error={
                lateGrace !== '' && Number(lateGrace) > 120
                  ? 'Late grace period cannot exceed 120 minutes'
                  : undefined
              }
            />
          </div>

          <div>
            <Input
              label="Early Exit Grace Period (Minutes)"
              type="text"
              inputMode="numeric"
              value={earlyExitGrace}
              onChange={handleDigitChange(setEarlyExitGrace, 3)}
              maxLength={3}
              showCharCount={true}
              placeholder="0 - 120"
              helperText="Minutes before scheduled shift end that still counts as on-time (0 - 120 mins)."
              error={
                earlyExitGrace !== '' && Number(earlyExitGrace) > 120
                  ? 'Early exit grace cannot exceed 120 minutes'
                  : undefined
              }
            />
          </div>
        </div>

        {/* Card 2: Half-Day & Absence Cutoff */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 shadow-xs">
          <div className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            Half-Day & Absence Rules
          </div>

          <div>
            <Input
              label="Half-Day Threshold (Minutes Worked)"
              type="text"
              inputMode="numeric"
              value={halfDayThreshold}
              onChange={handleDigitChange(setHalfDayThreshold, 3)}
              maxLength={3}
              showCharCount={true}
              placeholder="60 - 720"
              helperText={`Worked duration under ${halfDayThreshold || 0} mins (${((Number(halfDayThreshold) || 0) / 60).toFixed(1)} hrs) is reclassified as Half Day (60 - 720 mins).`}
              error={
                halfDayThreshold !== '' && (Number(halfDayThreshold) < 60 || Number(halfDayThreshold) > 720)
                  ? 'Threshold must be between 60 and 720 minutes (1h - 12h)'
                  : undefined
              }
            />
          </div>

          <div>
            <Input
              label="Absent Cutoff (Minutes past shift start)"
              type="text"
              inputMode="numeric"
              value={absentCutoff}
              onChange={handleDigitChange(setAbsentCutoff, 3)}
              maxLength={3}
              showCharCount={true}
              placeholder="30 - 480"
              helperText={`Automatically pre-flags employee as Absent if no punch exists ${absentCutoff || 0}m after shift start (30 - 480 mins).`}
              error={
                absentCutoff !== '' && (Number(absentCutoff) < 30 || Number(absentCutoff) > 480)
                  ? 'Absent cutoff must be between 30 and 480 minutes'
                  : undefined
              }
            />
          </div>
        </div>

        {/* Card 3: Overtime Rules */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 shadow-xs">
          <div className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            Overtime Rules
          </div>

          <div>
            <Input
              label="Overtime Threshold (Minutes past shift end)"
              type="text"
              inputMode="numeric"
              value={overtimeThreshold}
              onChange={handleDigitChange(setOvertimeThreshold, 3)}
              maxLength={3}
              showCharCount={true}
              placeholder="0 - 240"
              helperText="Minutes beyond scheduled shift before worked time qualifies as overtime (0 - 240 mins)."
              error={
                overtimeThreshold !== '' && Number(overtimeThreshold) > 240
                  ? 'Overtime threshold cannot exceed 240 minutes (4h)'
                  : undefined
              }
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-xs font-semibold text-[var(--text-primary)]">
                Require Manager Pre-Approval
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                Overtime must be formally signed off by manager before payroll inclusion.
              </div>
            </div>
            <Toggle
              checked={overtimeApproval}
              onChange={setOvertimeApproval}
            />
          </div>
        </div>

        {/* Card 4: Allowed Punch Methods */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 shadow-xs">
          <div className="font-semibold text-[var(--text-primary)] text-sm flex items-center gap-2">
            <Settings size={16} className="text-primary-500" />
            Permitted Punch Methods
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">
                  Geofenced Mobile App (GPS Verified)
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Enforces 100m geofence radius around salon coordinates
                </div>
              </div>
              <Toggle
                checked={allowedMethods.includes('geofenced_app')}
                onChange={() => toggleMethod('geofenced_app')}
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">
                  Front-Desk Kiosk (Staff PIN Pad)
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  PIN-authenticated punches at salon reception terminal
                </div>
              </div>
              <Toggle
                checked={allowedMethods.includes('manual')}
                onChange={() => toggleMethod('manual')}
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">
                  Biometric Terminal Integration
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Hardware biometric device attendance webhook sync
                </div>
              </div>
              <Toggle
                checked={allowedMethods.includes('biometric')}
                onChange={() => toggleMethod('biometric')}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Interactive Preview Simulator */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
          <Sparkles size={14} /> Live Policy Simulator & Example Previews
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-color)]">
            <div className="text-[var(--text-muted)] mb-0.5">Grace Arrival Test:</div>
            <div className="text-[var(--text-primary)]">
              Shift 9:00 AM → Clock-in at <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">09:08 AM</span> (within {simLate}m grace) = <strong className="text-emerald-600 dark:text-emerald-400">PRESENT</strong>
            </div>
          </div>

          <div className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-color)]">
            <div className="text-[var(--text-muted)] mb-0.5">Late Threshold Test:</div>
            <div className="text-[var(--text-primary)]">
              Shift 9:00 AM → Clock-in at <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">09:15 AM</span> (past {simLate}m grace) = <strong className="text-amber-600 dark:text-amber-400">LATE</strong>
            </div>
          </div>

          <div className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-color)]">
            <div className="text-[var(--text-muted)] mb-0.5">Absence Cutoff Test:</div>
            <div className="text-[var(--text-primary)]">
              Shift 9:00 AM with no punch at <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{Math.floor((9 * 60 + simCutoff) / 60)}:{(9 * 60 + simCutoff) % 60 === 0 ? '00' : (9 * 60 + simCutoff) % 60} AM</span> = <strong className="text-rose-600 dark:text-rose-400">ABSENT FLAG</strong>
            </div>
          </div>

          <div className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-color)]">
            <div className="text-[var(--text-muted)] mb-0.5">Overtime Kick-In Test:</div>
            <div className="text-[var(--text-primary)]">
              Shift ends 5:00 PM → Clock-out 5:{String(simOT + 15).padStart(2, '0')} PM = <strong className="text-primary-600 dark:text-primary-400 font-bold">OVERTIME ACCRUED</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Save Action Bar */}
      {canManage && (
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            variant="secondary"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            Save as Org Default
          </Button>

          {branchId && (
            <Button
              variant="primary"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              icon={Save}
            >
              {isSaving ? 'Saving...' : 'Save Branch Override'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceSettingsTab;
