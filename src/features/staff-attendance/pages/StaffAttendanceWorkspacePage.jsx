import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../../components/shared/Button';
import UnderlineTabs from '../../../components/shared/UnderlineTabs';
import Loader from '../../../components/shared/Loader';
import { useAuth } from '../../../hooks/useAuth';
import { usePermission } from '../../../hooks/usePermission';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import { useBranch } from '../../branch/hooks/useBranch';
import { fetchStaffList } from '../../staff/api/staffApi';
import { useStaffAttendance } from '../hooks/useStaffAttendance';

// Tabs
import AttendanceOverviewTab from '../components/AttendanceOverviewTab';
import DailyAttendanceTab from '../components/DailyAttendanceTab';
import MyAttendanceTab from '../components/MyAttendanceTab';
import AttendanceKioskTab from '../components/AttendanceKioskTab';
import PendingCorrectionsTab from '../components/PendingCorrectionsTab';
import PayPeriodApprovalTab from '../components/PayPeriodApprovalTab';
import MonthlyReportsTab from '../components/MonthlyReportsTab';
import AttendanceSettingsTab from '../components/AttendanceSettingsTab';

// Modals
import ManualEntryModal from '../components/modals/ManualEntryModal';
import CorrectionRequestModal from '../components/modals/CorrectionRequestModal';
import ReviewCorrectionModal from '../components/modals/ReviewCorrectionModal';
import PeriodApprovalModal from '../components/modals/PeriodApprovalModal';
import ReopenPeriodModal from '../components/modals/ReopenPeriodModal';

import {
  Clock,
  CalendarDays,
  UserCheck,
  QrCode,
  FileText,
  ShieldCheck,
  FileSpreadsheet,
  Settings,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { toast } from '../../../components/shared/Toast';
import { exportMonthlySummaryCsv, recalculateMonthlySummary, approveAllClean } from '../api/staffAttendanceApi';

export const StaffAttendanceWorkspacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const permission = usePermission();
  const {
    can,
    canView,
    canCreate,
    canUpdate,
    canManage,
    canApprove,
    canExport,
    canPrint,
    isSuperAdmin,
    isOwner,
  } = permission;
  const canReject =
    permission.canReject ||
    ((moduleCode) => can(`${moduleCode}.reject`) || can(`${moduleCode}.approve`));
  const { selectedOrganisation } = useOrganisation();
  const { branches = [], currentBranch } = useBranch();

  const orgId = selectedOrganisation?.id || user?.organizationId || '';

  // Synchronize with global branch selection from the top bar (Navbar BranchSwitcher)
  const activeBranchId =
    currentBranch?.id ||
    branches.find((b) => b.id === user?.homeBranchId)?.id ||
    branches[0]?.id ||
    (orgId ? localStorage.getItem(`sms_active_branch_id_${orgId}`) : null) ||
    '';

  const [selectedBranchId, setSelectedBranchId] = useState(activeBranchId);

  // Sync with global branch selection whenever currentBranch changes in the top bar
  useEffect(() => {
    if (currentBranch?.id && currentBranch.id !== selectedBranchId) {
      setSelectedBranchId(currentBranch.id);
    } else if (activeBranchId && !selectedBranchId) {
      setSelectedBranchId(activeBranchId);
    }
  }, [currentBranch?.id, activeBranchId, selectedBranchId]);

  // Determine user's primary operational role
  const userRoles = (user?.roles || []).map((r) =>
    String(r).toUpperCase().replace(/[\s-]+/g, '_'),
  );
  const isBranchManager = userRoles.includes('BRANCH_MANAGER');
  const isAccountant = userRoles.includes('ACCOUNTANT') && !isOwner && !isSuperAdmin;
  const isFrontDesk = userRoles.includes('FRONT_DESK') && !isBranchManager && !isOwner && !isSuperAdmin;
  const isServiceStaff =
    (userRoles.includes('SERVICE_STAFF') || userRoles.includes('STAFF')) &&
    !isBranchManager &&
    !isOwner &&
    !isSuperAdmin &&
    !isAccountant &&
    !isFrontDesk;

  // 1. Build Dynamic Tabs based on Effective RBAC Permissions & Role Experience
  const availableTabs = useMemo(() => {
    const tabs = [];

    // Service Staff default focused experience
    if (isServiceStaff) {
      tabs.push({
        id: 'my-attendance',
        label: 'My Attendance',
        icon: UserCheck,
      });
      return tabs;
    }

    // Front Desk default experience
    if (isFrontDesk) {
      tabs.push({ id: 'daily', label: 'Daily Attendance', icon: CalendarDays });
      tabs.push({ id: 'kiosk', label: 'Attendance Kiosk', icon: QrCode });
      return tabs;
    }

    // Accountant experience
    if (isAccountant) {
      tabs.push({ id: 'overview', label: 'Overview', icon: Clock });
      tabs.push({ id: 'approvals', label: 'Pay Period Review', icon: ShieldCheck });
      tabs.push({ id: 'reports', label: 'Monthly Reports', icon: FileSpreadsheet });
      return tabs;
    }

    // Super Admin / Owner / Branch Manager dynamic tabs
    tabs.push({ id: 'overview', label: 'Overview', icon: Clock });

    if (canView('staff_attendance') || canView('staff-attendance')) {
      tabs.push({ id: 'daily', label: 'Daily Attendance', icon: CalendarDays });
    }

    // Staff self-service punch tab (Only for staff employees, never for organization Owners or Super Admins)
    if (!isOwner && !isSuperAdmin) {
      tabs.push({ id: 'my-attendance', label: 'My Attendance', icon: UserCheck });
    }

    tabs.push({ id: 'kiosk', label: 'Attendance Kiosk', icon: QrCode });

    if (canApprove('staff_attendance') || isBranchManager || isOwner || isSuperAdmin) {
      tabs.push({ id: 'corrections', label: 'Pending Corrections', icon: FileText });
      tabs.push({ id: 'approvals', label: 'Pay Period Review', icon: ShieldCheck });
    }

    tabs.push({ id: 'reports', label: 'Monthly Reports', icon: FileSpreadsheet });

    if (canManage('staff_attendance') || isOwner || isSuperAdmin) {
      tabs.push({ id: 'settings', label: 'Attendance Policy', icon: Settings });
    }

    return tabs;
  }, [
    isServiceStaff,
    isFrontDesk,
    isAccountant,
    isBranchManager,
    isOwner,
    isSuperAdmin,
    canView,
    canApprove,
    canManage,
  ]);

  // Read active tab from URL search params, fallback to first available
  const tabParam = searchParams.get('tab');
  const activeTab = useMemo(() => {
    if (tabParam && availableTabs.some((t) => t.id === tabParam)) {
      return tabParam;
    }
    return availableTabs[0]?.id || 'overview';
  }, [tabParam, availableTabs]);

  const handleTabChange = (newTabId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', newTabId);
    setSearchParams(nextParams, { replace: true });
  };

  // Filter States
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dailyPage, setDailyPage] = useState(1);
  const [correctionsPage, setCorrectionsPage] = useState(1);

  // Pay period approval range (default current bi-weekly or 1st of month to today)
  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [periodEnd, setPeriodEnd] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Monthly report selection
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);

  // Modals state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [correctionModalData, setCorrectionModalData] = useState(null);
  const [reviewModalData, setReviewModalData] = useState(null);
  const [approvalModalData, setApprovalModalData] = useState(null);
  const [reopenModalData, setReopenModalData] = useState(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Staff List for Manual Entry
  const [staffList, setStaffList] = useState([]);
  useEffect(() => {
    if (orgId && (isOwner || isSuperAdmin || isBranchManager || isFrontDesk)) {
      fetchStaffList({ limit: 100 }, orgId)
        .then((res) => setStaffList(res?.data || []))
        .catch(() => {});
    }
  }, [orgId, isOwner, isSuperAdmin, isBranchManager, isFrontDesk]);

  // Hook data query parameters
  const queryParams = useMemo(() => {
    if (activeTab === 'daily') {
      return {
        date: selectedDate,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        page: dailyPage,
        limit: 10,
      };
    }
    if (activeTab === 'corrections') {
      return {
        search: searchQuery || undefined,
        page: correctionsPage,
        limit: 10,
      };
    }
    if (activeTab === 'approvals') {
      return {
        periodStart,
        periodEnd,
      };
    }
    if (activeTab === 'reports') {
      return {
        year: reportYear,
        month: reportMonth,
      };
    }
    return {};
  }, [
    activeTab,
    selectedDate,
    statusFilter,
    searchQuery,
    dailyPage,
    correctionsPage,
    periodStart,
    periodEnd,
    reportYear,
    reportMonth,
  ]);

  const {
    overviewQuery,
    dailyQuery,
    currentlyCheckedInQuery,
    myAttendanceQuery,
    policyQuery,
    correctionsQuery,
    myCorrectionsQuery,
    periodReviewQuery,
    monthlySummaryQuery,
    invalidateAttendance,
  } = useStaffAttendance(orgId, selectedBranchId, activeTab, queryParams);

  // Action handlers
  const handleRecalculate = async () => {
    if (!selectedBranchId) return;
    setIsRecalculating(true);
    try {
      await recalculateMonthlySummary(
        selectedBranchId,
        reportYear,
        reportMonth,
        orgId,
      );
      toast.success('Monthly attendance summary recalculated from daily punches.');
      invalidateAttendance();
    } catch (err) {
      toast.error(err?.message || 'Recalculation failed.');
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleExportCsv = async () => {
    if (!selectedBranchId) return;
    try {
      const csv = await exportMonthlySummaryCsv(
        selectedBranchId,
        reportYear,
        reportMonth,
        orgId,
      );
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-summary-${reportYear}-${String(reportMonth).padStart(2, '0')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Attendance report exported to CSV.');
    } catch (err) {
      toast.error(err?.message || 'Failed to export report.');
    }
  };

  const handleBulkApproveClean = async () => {
    if (!selectedBranchId) return;
    try {
      const res = await approveAllClean(
        selectedBranchId,
        periodStart,
        periodEnd,
        orgId,
      );
      toast.success(res?.message || 'Clean records approved.');
      invalidateAttendance();
    } catch (err) {
      toast.error(err?.message || 'Bulk approval failed.');
    }
  };

  const activeBranchName =
    currentBranch?.name ||
    branches.find((b) => b.id === selectedBranchId)?.name ||
    'Branch';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="text-primary-500" size={26} />
            Staff Attendance
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Track employee punches against scheduled shifts, audit corrections, and manage payroll approvals.
          </p>
        </div>
      </div>

      {/* Dynamic RBAC Navigation Tabs */}
      <UnderlineTabs
        tabs={availableTabs}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && (
          <AttendanceOverviewTab
            overviewData={overviewQuery.data}
            currentlyInData={currentlyCheckedInQuery.data}
            isLoading={overviewQuery.isLoading}
            onNavigateTab={handleTabChange}
            onOpenManualEntry={() => setIsManualModalOpen(true)}
            canCreate={canCreate('staff_attendance')}
            canApprove={canApprove('staff_attendance')}
          />
        )}

        {activeTab === 'daily' && (
          <DailyAttendanceTab
            data={dailyQuery.data}
            isLoading={dailyQuery.isLoading}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            page={dailyPage}
            onPageChange={setDailyPage}
            onOpenManualEntry={() => setIsManualModalOpen(true)}
            onRequestCorrection={(row) =>
              setCorrectionModalData({
                attendanceId: row.attendanceId,
                prefilledDate: selectedDate,
                staffId: row.staffId,
              })
            }
            canCreate={canCreate('staff_attendance')}
            canUpdate={canUpdate('staff_attendance')}
          />
        )}

        {activeTab === 'my-attendance' && (
          <MyAttendanceTab
            data={myAttendanceQuery.data}
            myCorrectionsData={myCorrectionsQuery.data}
            isLoading={myAttendanceQuery.isLoading}
            error={myAttendanceQuery.error}
            onRefresh={invalidateAttendance}
            onRequestCorrection={(data) => setCorrectionModalData(data)}
            branchId={selectedBranchId}
            organizationId={orgId}
          />
        )}

        {activeTab === 'kiosk' && (
          <AttendanceKioskTab
            branchId={selectedBranchId}
            branchName={activeBranchName}
            currentlyInData={currentlyCheckedInQuery.data}
            onPunchSuccess={invalidateAttendance}
          />
        )}

        {activeTab === 'corrections' && (
          <PendingCorrectionsTab
            data={correctionsQuery.data}
            isLoading={correctionsQuery.isLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            page={correctionsPage}
            onPageChange={setCorrectionsPage}
            onReviewCorrection={(corr) => setReviewModalData(corr)}
            canApprove={canApprove('staff_attendance')}
          />
        )}

        {activeTab === 'approvals' && (
          <PayPeriodApprovalTab
            data={periodReviewQuery.data}
            isLoading={periodReviewQuery.isLoading}
            periodStart={periodStart}
            periodEnd={periodEnd}
            onPeriodStartChange={setPeriodStart}
            onPeriodEndChange={setPeriodEnd}
            onApproveStaff={(staff) => setApprovalModalData(staff)}
            onBulkApproveClean={handleBulkApproveClean}
            onReopenStaff={(staff) => setReopenModalData(staff)}
            canApprove={canApprove('staff_attendance')}
            canReject={canReject('staff_attendance')}
          />
        )}

        {activeTab === 'reports' && (
          <MonthlyReportsTab
            data={monthlySummaryQuery.data}
            isLoading={monthlySummaryQuery.isLoading}
            selectedYear={reportYear}
            selectedMonth={reportMonth}
            onYearChange={setReportYear}
            onMonthChange={setReportMonth}
            onRecalculate={handleRecalculate}
            onExportCsv={handleExportCsv}
            isRecalculating={isRecalculating}
            canManage={canManage('staff_attendance')}
            canExport={canExport('staff_attendance')}
            canPrint={canPrint('staff_attendance')}
          />
        )}

        {activeTab === 'settings' && (
          <AttendanceSettingsTab
            policyData={policyQuery.data}
            isLoading={policyQuery.isLoading}
            branchId={selectedBranchId}
            organizationId={orgId}
            onRefresh={invalidateAttendance}
            canManage={canManage('staff_attendance')}
          />
        )}
      </div>

      {/* Modals */}
      {isManualModalOpen && (
        <ManualEntryModal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
          onSuccess={invalidateAttendance}
          staffList={staffList}
          branchId={selectedBranchId}
          organizationId={orgId}
        />
      )}

      {correctionModalData && (
        <CorrectionRequestModal
          isOpen={Boolean(correctionModalData)}
          onClose={() => setCorrectionModalData(null)}
          onSuccess={invalidateAttendance}
          prefilledDate={correctionModalData.prefilledDate}
          prefilledAttendanceId={correctionModalData.attendanceId}
          staffId={correctionModalData.staffId}
          organizationId={orgId}
        />
      )}

      {reviewModalData && (
        <ReviewCorrectionModal
          isOpen={Boolean(reviewModalData)}
          onClose={() => setReviewModalData(null)}
          onSuccess={invalidateAttendance}
          correction={reviewModalData}
          organizationId={orgId}
        />
      )}

      {approvalModalData && (
        <PeriodApprovalModal
          isOpen={Boolean(approvalModalData)}
          onClose={() => setApprovalModalData(null)}
          onSuccess={invalidateAttendance}
          staff={approvalModalData}
          periodStart={periodStart}
          periodEnd={periodEnd}
          branchId={selectedBranchId}
          organizationId={orgId}
        />
      )}

      {reopenModalData && (
        <ReopenPeriodModal
          isOpen={Boolean(reopenModalData)}
          onClose={() => setReopenModalData(null)}
          onSuccess={invalidateAttendance}
          staff={reopenModalData}
          organizationId={orgId}
        />
      )}
    </div>
  );
};

export default StaffAttendanceWorkspacePage;
