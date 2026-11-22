import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useBranch } from '../../branch/hooks/useBranch';
import { useCurrentlyIn } from '../hooks/useStaffAttendance';
import AttendanceKioskTab from '../components/AttendanceKioskTab';
import CustomSelector from '../../../components/shared/CustomSelector';
import Button from '../../../components/shared/Button';
import { ArrowLeft, Clock, Store, Shield } from 'lucide-react';

export const AttendanceKioskPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { branches = [] } = useBranch();

  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Set default branch
  useEffect(() => {
    if (!selectedBranchId && branches.length > 0) {
      const defaultBranch =
        branches.find((b) => b.id === user?.homeBranchId) || branches[0];
      setSelectedBranchId(defaultBranch?.id || '');
    }
  }, [branches, selectedBranchId, user?.homeBranchId]);

  // Live digital clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  const {
    data: currentlyInData,
    refetch: refetchCurrentlyIn,
  } = useCurrentlyIn(selectedBranchId, {
    enabled: !!selectedBranchId,
  });

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col p-4 sm:p-6 lg:p-8">
      {/* Kiosk Station Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between pb-6 mb-6 border-b border-[var(--border-color)] gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/attendance')}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </Button>

          <div className="h-6 w-px bg-[var(--border-color)] hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                <Shield className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Front-Desk Attendance Terminal
              </h1>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Secure Self-Service Check-In & Check-Out Kiosk
            </p>
          </div>
        </div>

        {/* Live Clock & Branch Selector */}
        <div className="flex items-center gap-4">
          {branches.length > 1 && (
            <div className="w-48 sm:w-56">
              <CustomSelector
                label=""
                value={selectedBranchId}
                onChange={setSelectedBranchId}
                options={branches.map((b) => ({ value: b.id, label: b.name }))}
                placeholder="Select Branch..."
              />
            </div>
          )}

          <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] px-3.5 py-2 rounded-xl text-right shadow-xs">
            <Clock className="w-4 h-4 text-teal-500 dark:text-teal-400 animate-pulse" />
            <div>
              <div className="text-sm font-semibold font-mono text-teal-600 dark:text-teal-300">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Kiosk Punch Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-md">
          <AttendanceKioskTab
            branchId={selectedBranchId}
            branchName={selectedBranch?.name || 'Current Branch'}
            currentlyInData={currentlyInData}
            onPunchSuccess={refetchCurrentlyIn}
          />
        </div>
      </main>

      {/* Kiosk Footer */}
      <footer className="pt-6 mt-6 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Store className="w-3.5 h-3.5 text-primary-500" />
          <span>Active Location: <strong className="text-[var(--text-primary)]">{selectedBranch?.name || 'Default Branch'}</strong></span>
        </div>
        <div>
          Protected by Biometric PIN Verification & IP Audit Protection
        </div>
      </footer>
    </div>
  );
};

export default AttendanceKioskPage;
