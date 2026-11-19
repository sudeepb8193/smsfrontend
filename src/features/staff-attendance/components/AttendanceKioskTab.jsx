import React, { useState } from 'react';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Loader from '../../../components/shared/Loader';
import Input from '../../../components/shared/Input';
import { toast } from 'sonner';
import { punchKiosk } from '../api/staffAttendanceApi';
import {
  QrCode,
  KeyRound,
  Delete,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const AttendanceKioskTab = ({
  branchId,
  branchName,
  currentlyInData,
  onPunchSuccess,
}) => {
  const [employeeCode, setEmployeeCode] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastPunchResult, setLastPunchResult] = useState(null);

  const currentlyIn = currentlyInData?.data || [];

  const handleKeyClick = (val) => {
    if (val === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
    } else if (val === 'clear') {
      setPin('');
    } else if (pin.length < 8) {
      setPin((prev) => (prev + val).slice(0, 8));
    }
  };

  const handlePinInputChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 8);
    setPin(digitsOnly);
  };

  const handlePunch = async (e) => {
    e?.preventDefault();
    if (!employeeCode.trim()) {
      toast.error('Please enter your Employee Code.');
      return;
    }
    if (!pin || pin.length < 4) {
      toast.error('Please enter a valid 4 to 8-digit PIN.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await punchKiosk({
        branchId,
        employeeCode: employeeCode.trim(),
        pin,
      });

      setLastPunchResult(res);
      toast.success(res?.message || 'Punch processed successfully.');
      setPin('');
      setEmployeeCode('');
      onPunchSuccess?.();

      // Clear success feedback banner after 6 seconds
      setTimeout(() => {
        setLastPunchResult(null);
      }, 6000);
    } catch (err) {
      toast.error(err?.message || 'Incorrect PIN or punch failed.');
      setPin('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Kiosk Pin Pad & Entry */}
      <div className="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider">
              <QrCode size={16} /> Front-Desk Attendance Kiosk
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mt-0.5">
              {branchName || 'Branch Terminal'}
            </h2>
          </div>
          <Badge variant="success">Online</Badge>
        </div>

        {/* Success Feedback Card */}
        {lastPunchResult && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-100 flex items-center gap-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-[var(--text-primary)] text-base">
                {lastPunchResult.staffName} ({lastPunchResult.employeeCode})
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300">
                {lastPunchResult.message}
              </div>
            </div>
            <Badge variant="success">
              {lastPunchResult.action === 'check_in' ? 'CLOCK IN' : 'CLOCK OUT'}
            </Badge>
          </div>
        )}

        <form onSubmit={handlePunch} className="space-y-4">
          {/* Employee Code Input using Shared Input */}
          <Input
            label="Step 1: Enter Employee Code"
            type="text"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value.toUpperCase().slice(0, 20))}
            placeholder="e.g. EMP-001"
            maxLength={20}
            showCharCount={true}
            icon={User}
            required
            autoFocus
          />

          {/* PIN Input with digit-only validation & max 8 char count */}
          <Input
            label="Step 2: Enter Staff PIN (4 to 8 Digits)"
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={handlePinInputChange}
            placeholder="Enter digits or use keypad below"
            maxLength={8}
            showCharCount={true}
            icon={KeyRound}
            required
          />

          {/* PIN Visual Dots (shows active length up to 8) */}
          <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-2xl">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  pin.length > idx
                    ? 'bg-primary-500 scale-110 shadow-xs'
                    : 'bg-[var(--border-color)]'
                }`}
              />
            ))}
          </div>

          {/* Large On-Screen Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyClick(String(num))}
                className="h-14 rounded-2xl bg-[var(--bg-app)] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-xl font-bold text-[var(--text-primary)] font-mono border border-[var(--border-color)] transition-all flex items-center justify-center cursor-pointer shadow-xs"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleKeyClick('clear')}
              className="h-14 rounded-2xl bg-[var(--bg-app)] hover:bg-rose-500/10 active:scale-95 text-xs font-bold text-rose-600 dark:text-rose-400 border border-[var(--border-color)] transition-all flex items-center justify-center cursor-pointer shadow-xs"
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={() => handleKeyClick('0')}
              className="h-14 rounded-2xl bg-[var(--bg-app)] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-xl font-bold text-[var(--text-primary)] font-mono border border-[var(--border-color)] transition-all flex items-center justify-center cursor-pointer shadow-xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleKeyClick('backspace')}
              className="h-14 rounded-2xl bg-[var(--bg-app)] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 text-[var(--text-secondary)] border border-[var(--border-color)] transition-all flex items-center justify-center cursor-pointer shadow-xs"
            >
              <Delete size={20} />
            </button>
          </div>

          <div className="pt-2 max-w-sm mx-auto">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={isSubmitting || !employeeCode || !pin}
              className="w-full justify-center text-base py-3.5 shadow-md"
              icon={CheckCircle2}
            >
              {isSubmitting ? 'Verifying PIN...' : 'Confirm Clock In / Clock Out'}
            </Button>
          </div>
        </form>
      </div>

      {/* Right Column: Live Roster of Currently In Staff */}
      <div className="lg:col-span-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-bold text-[var(--text-primary)] text-base">
              Currently Clocked In ({currentlyIn.length})
            </h3>
          </div>
          <span className="text-xs text-[var(--text-muted)]">Terminal Live View</span>
        </div>

        {currentlyIn.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)]">
            No employees currently clocked in at this terminal.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {currentlyIn.map((item) => (
              <div
                key={item.attendanceId}
                className="p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-xs overflow-hidden border border-purple-500/20">
                    {item.profilePhotoUrl ? (
                      <img
                        src={item.profilePhotoUrl}
                        alt={item.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      item.fullName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)] text-xs">
                      {item.fullName}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      ID: {item.employeeCode}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    {item.currentDurationFormatted}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    Since{' '}
                    {new Date(item.checkInAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceKioskTab;
