import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../../components/shared/Button';
import UnderlineTabs from '../../../components/shared/UnderlineTabs';
import Skeleton from '../../../components/shared/Skeleton';
import { Badge } from '../../../components/shared/Badge';
import { useAuth } from '../../../hooks/useAuth';
import { usePermission } from '../../../hooks/usePermission';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import { useBranch } from '../../branch/hooks/useBranch';
import { fetchStaffList } from '../../staff/api/staffApi';
import { useStaffLeave } from '../hooks/useStaffLeave';
import { exportLeaveCsv } from '../api/staffLeaveApi';
import { useDebounce } from '../../../hooks/useDebounce';

// Tabs
import LeaveOverviewTab from '../components/LeaveOverviewTab';
import MyLeaveTab from '../components/MyLeaveTab';
import LeaveRequestsTab from '../components/LeaveRequestsTab';
import LeaveBalancesTab from '../components/LeaveBalancesTab';
import ApprovalQueueTab from '../components/ApprovalQueueTab';
import LeaveCalendarTab from '../components/LeaveCalendarTab';
import LeaveTypesPolicyTab from '../components/LeaveTypesPolicyTab';
import BlackoutPeriodsTab from '../components/BlackoutPeriodsTab';
import BalanceAdjustmentsTab from '../components/BalanceAdjustmentsTab';
import LeaveReportsTab from '../components/LeaveReportsTab';

// Modals
import ApplyLeaveModal from '../components/modals/ApplyLeaveModal';
import ReviewLeaveModal from '../components/modals/ReviewLeaveModal';
import AdjustBalanceModal from '../components/modals/AdjustBalanceModal';
import LeaveTypeModal from '../components/modals/LeaveTypeModal';
import BlackoutPeriodModal from '../components/modals/BlackoutPeriodModal';
import AccrualActionModal from '../components/modals/AccrualActionModal';

import {
  CalendarDays,
  Clock,
  UserCheck,
  ShieldCheck,
  CalendarOff,
  FileText,
  FileSpreadsheet,
  Scale,
  Calendar,
  LayoutDashboard,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { toast } from '../../../components/shared/Toast';

/**
 * Production-Level Staff Leave Management Workspace Page (Module 09).
 * Unifies all 5 core leave tasks in a seamless, role-adapted workspace.
 */
export default function StaffLeaveWorkspacePage() {
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
    isSuperAdmin,
    isOwner,
  } = permission;

  const { selectedOrganisation } = useOrganisation();
  const { branches = [], currentBranch } = useBranch();

  const orgId = selectedOrganisation?.id || user?.organizationId || '';

  // Synchronize active branch from top bar
  const activeBranchId =
    currentBranch?.id ||
    branches.find((b) => b.id === user?.homeBranchId)?.id ||
    branches[0]?.id ||
    '';

  const [selectedBranchId, setSelectedBranchId] = useState(activeBranchId);

  useEffect(() => {
    if (currentBranch?.id && currentBranch.id !== selectedBranchId) {
      setSelectedBranchId(currentBranch.id);
    } else if (activeBranchId && !selectedBranchId) {
      setSelectedBranchId(activeBranchId);
    }
  }, [currentBranch?.id, activeBranchId, selectedBranchId]);

  // Determine user operational role
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

  // Role permissions
  const canApproveLeaves =
    can('staff_leave.approve') ||
    isSuperAdmin ||
    isOwner ||
    isBranchManager;

  const canManageLeaves =
    can('staff_leave.manage') ||
    isSuperAdmin ||
    isOwner ||
    isBranchManager;

  const canExportReports =
    can('staff_leave.export') ||
    isSuperAdmin ||
    isOwner ||
    isBranchManager ||
    isAccountant;

  // Build Dynamic Navigation Tabs
  const availableTabs = useMemo(() => {
    if (isServiceStaff) {
      return [
        { id: 'my-leave', label: 'My Leave & Quotas', icon: UserCheck },
        { id: 'calendar', label: 'Team Calendar', icon: Calendar },
      ];
    }

    const tabs = [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'requests', label: 'Leave Requests', icon: CalendarDays },
      { id: 'approvals', label: 'Approval Queue', icon: Clock },
      { id: 'balances', label: 'Leave Balances', icon: ShieldCheck },
      { id: 'calendar', label: 'Calendar & Roster', icon: Calendar },
      { id: 'my-leave', label: 'My Leave', icon: UserCheck },
    ];

    if (canManageLeaves) {
      tabs.push({ id: 'policies', label: 'Leave Policies', icon: FileText });
      tabs.push({ id: 'blackout', label: 'Blackout Periods', icon: CalendarOff });
      tabs.push({ id: 'adjustments', label: 'Audit Trail', icon: Scale });
    }

    if (canExportReports || canManageLeaves) {
      tabs.push({ id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet });
    }

    return tabs;
  }, [isServiceStaff, canManageLeaves, canExportReports]);

  // Tab State Management with URL searchParams synchronization
  const initialTab = searchParams.get('tab') || (isServiceStaff ? 'my-leave' : 'overview');
  const [activeTab, setActiveTab] = useState(
    availableTabs.some((t) => t.id === initialTab) ? initialTab : availableTabs[0]?.id || 'overview',
  );

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tabId);
      return next;
    });
  };

  // Filters & Server Pagination / Sort State
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsSearch, setRequestsSearch] = useState('');
  const debouncedRequestsSearch = useDebounce(requestsSearch, 350);
  const [requestsStatus, setRequestsStatus] = useState('');
  const [requestsLeaveType, setRequestsLeaveType] = useState('');
  const [requestsSortBy, setRequestsSortBy] = useState('appliedAt');
  const [requestsSortOrder, setRequestsSortOrder] = useState('desc');

  const [balancesPage, setBalancesPage] = useState(1);
  const [balancesSearch, setBalancesSearch] = useState('');
  const debouncedBalancesSearch = useDebounce(balancesSearch, 350);
  const [balancesLeaveType, setBalancesLeaveType] = useState('');
  const [balancesYear, setBalancesYear] = useState(new Date().getFullYear());
  const [balancesSortBy, setBalancesSortBy] = useState('staffName');
  const [balancesSortOrder, setBalancesSortOrder] = useState('asc');

  const [approvalsPage, setApprovalsPage] = useState(1);
  const [approvalsSearch, setApprovalsSearch] = useState('');
  const debouncedApprovalsSearch = useDebounce(approvalsSearch, 350);
  const [approvalsSortBy, setApprovalsSortBy] = useState('appliedAt');
  const [approvalsSortOrder, setApprovalsSortOrder] = useState('asc');

  const [reportsYear, setReportsYear] = useState(new Date().getFullYear());

  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('');

  // Reset pagination to page 1 whenever filters, search, sort, or branch changes
  useEffect(() => {
    setRequestsPage(1);
  }, [
    debouncedRequestsSearch,
    requestsStatus,
    requestsLeaveType,
    requestsSortBy,
    requestsSortOrder,
    selectedBranchId,
  ]);

  useEffect(() => {
    setBalancesPage(1);
  }, [
    debouncedBalancesSearch,
    balancesLeaveType,
    balancesYear,
    balancesSortBy,
    balancesSortOrder,
    selectedBranchId,
  ]);

  useEffect(() => {
    setApprovalsPage(1);
  }, [
    debouncedApprovalsSearch,
    approvalsSortBy,
    approvalsSortOrder,
    selectedBranchId,
  ]);

  // Fetch staff list for employee selectors in modals
  const [staffList, setStaffList] = useState([]);
  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await fetchStaffList({ limit: 100, branchId: selectedBranchId || undefined });
        setStaffList(res?.data || res || []);
      } catch (e) {
        // Silent fallback
      }
    }
    loadStaff();
  }, [selectedBranchId]);

  // Calendar date range calculations for calendar query
  const calendarParams = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().slice(0, 10);
    return {
      startDate: start,
      endDate: end,
      branchId: selectedBranchId || undefined,
    };
  }, [selectedBranchId]);

  // Unified Hook for Staff Leave data & mutations
  const {
    leaveTypesQuery,
    balancesQuery,
    myBalancesQuery,
    transactionsQuery,
    requestsQuery,
    myRequestsQuery,
    pendingApprovalsQuery,
    calendarQuery,
    blackoutQuery,
    summaryReportQuery,

    createType,
    updateType,
    updateTypeStatus,
    seedDefaults,
    initializeBalances,
    adjustBalance,
    processAccrual,
    processCarryForward,
    applyLeave,
    cancelRequest,
    reviewRequest,
    createBlackout,
    updateBlackout,
    deleteBlackout,

    isSubmitting,
    invalidateLeaveCache,
  } = useStaffLeave(orgId, selectedBranchId, activeTab, {
    typesParams: {},
    balancesParams: {
      page: balancesPage,
      limit: 10,
      search: debouncedBalancesSearch || undefined,
      branchId: selectedBranchId || undefined,
      leaveTypeId: balancesLeaveType || undefined,
      year: balancesYear,
      sortBy: balancesSortBy,
      sortOrder: balancesSortOrder,
    },
    myBalancesParams: { year: balancesYear },
    myRequestsParams: { page: 1, limit: 50 },
    requestsParams: {
      page: requestsPage,
      limit: 10,
      search: debouncedRequestsSearch || undefined,
      status: requestsStatus || undefined,
      branchId: selectedBranchId || undefined,
      leaveTypeId: requestsLeaveType || undefined,
      sortBy: requestsSortBy,
      sortOrder: requestsSortOrder,
    },
    approvalsParams: {
      page: approvalsPage,
      limit: 10,
      search: debouncedApprovalsSearch || undefined,
      branchId: selectedBranchId || undefined,
      sortBy: approvalsSortBy,
      sortOrder: approvalsSortOrder,
    },
    calendarParams,
    blackoutParams: {
      branchId: selectedBranchId || undefined,
      page: 1,
      limit: 50,
    },
    transactionsParams: {
      page: transactionsPage,
      limit: 10,
      transactionType: transactionTypeFilter || undefined,
    },
    reportParams: {
      year: reportsYear,
      branchId: selectedBranchId || undefined,
    },
  });

  // Modal State Controls
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequestForReview, setSelectedRequestForReview] = useState(null);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustDefaultStaff, setAdjustDefaultStaff] = useState('');
  const [adjustDefaultType, setAdjustDefaultType] = useState('');
  const [leaveTypeModalOpen, setLeaveTypeModalOpen] = useState(false);
  const [selectedLeaveTypeForEdit, setSelectedLeaveTypeForEdit] = useState(null);
  const [blackoutModalOpen, setBlackoutModalOpen] = useState(false);
  const [selectedBlackoutForEdit, setSelectedBlackoutForEdit] = useState(null);
  const [accrualModalOpen, setAccrualModalOpen] = useState(false);

  // Review modal trigger
  const handleOpenReview = (request) => {
    setSelectedRequestForReview(request);
    setReviewModalOpen(true);
  };

  // Adjust modal trigger
  const handleOpenAdjust = (prefill = {}) => {
    setAdjustDefaultStaff(prefill.staffId || '');
    setAdjustDefaultType(prefill.leaveTypeId || '');
    setAdjustModalOpen(true);
  };

  // Leave Type Edit trigger
  const handleOpenEditLeaveType = (leaveType) => {
    setSelectedLeaveTypeForEdit(leaveType);
    setLeaveTypeModalOpen(true);
  };

  // Blackout Edit trigger
  const handleOpenEditBlackout = (blackout) => {
    setSelectedBlackoutForEdit(blackout);
    setBlackoutModalOpen(true);
  };

  // CSV Report Export Handler
  const handleExportCsv = async (params) => {
    try {
      const csvData = await exportLeaveCsv(params);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leave_report_${params.year || new Date().getFullYear()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Leave report exported successfully');
    } catch (err) {
      toast.error('Failed to export leave report');
    }
  };

  // Batch initialize balances for all staff in branch
  const handleBatchInitialize = async () => {
    try {
      await initializeBalances({
        year: balancesYear,
        branchId: selectedBranchId || undefined,
      });
    } catch (err) {
      // Handled in mutation
    }
  };

  const leaveTypesList = useMemo(() => {
    const raw = leaveTypesQuery.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [leaveTypesQuery.data]);

  const blackoutList = useMemo(() => {
    const raw = blackoutQuery.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [blackoutQuery.data]);

  const myBalancesList = useMemo(() => {
    const raw = myBalancesQuery.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.balances)) return raw.balances;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [myBalancesQuery.data]);

  const myRequestsList = useMemo(() => {
    const raw = myRequestsQuery.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [myRequestsQuery.data]);

  const allRequestsList = useMemo(() => {
    const raw = requestsQuery.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [requestsQuery.data]);

  const allBalancesList = useMemo(() => {
    const raw = balancesQuery.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [balancesQuery.data]);

  const pendingApprovalsList = useMemo(() => {
    const raw = pendingApprovalsQuery.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [pendingApprovalsQuery.data]);

  const calendarEventsList = useMemo(() => {
    const raw = calendarQuery.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.events)) return raw.events;
    if (Array.isArray(raw?.leaves)) return raw.leaves;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [calendarQuery.data]);

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              Staff Leave Management
            </h1>
            {currentBranch?.name && (
              <Badge variant="primary" size="small" className="font-semibold">
                {currentBranch.name}
              </Badge>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {isServiceStaff
              ? 'View personal leave balances, submit vacation or sick leaves, and monitor approvals.'
              : 'End-to-end administration of staff leave policies, accruals, blackout constraints, and approvals.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => setApplyModalOpen(true)}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isServiceStaff ? 'Apply for Leave' : 'New Leave Request'}</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[var(--border-color)]">
        <UnderlineTabs
          tabs={availableTabs}
          activeTab={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && (
          <LeaveOverviewTab
            balancesData={balancesQuery.data}
            requestsData={requestsQuery.data}
            approvalsData={pendingApprovalsQuery.data}
            blackoutData={blackoutQuery.data}
            isLoading={
              approvalsQueryIsLoading(pendingApprovalsQuery) ||
              requestsQuery.isLoading
            }
            onOpenApplyModal={() => setApplyModalOpen(true)}
            onNavigateTab={handleTabChange}
            canApprove={canApproveLeaves}
            canManage={canManageLeaves}
          />
        )}

        {activeTab === 'my-leave' && (
          <MyLeaveTab
            balances={myBalancesList}
            requests={myRequestsList}
            isLoadingBalances={myBalancesQuery.isLoading}
            isLoadingRequests={myRequestsQuery.isLoading}
            onOpenApplyModal={() => setApplyModalOpen(true)}
            onCancelRequest={cancelRequest}
            isCancelling={isSubmitting}
          />
        )}

        {activeTab === 'requests' && (
          <LeaveRequestsTab
            requests={allRequestsList}
            totalCount={requestsQuery.data?.total || allRequestsList.length}
            totalPages={requestsQuery.data?.meta?.totalPages || Math.ceil((requestsQuery.data?.total || allRequestsList.length) / 10)}
            page={requestsPage}
            limit={10}
            onPageChange={setRequestsPage}
            isLoading={requestsQuery.isLoading}
            searchTerm={requestsSearch}
            onSearchChange={setRequestsSearch}
            statusFilter={requestsStatus}
            onStatusChange={setRequestsStatus}
            leaveTypeFilter={requestsLeaveType}
            onLeaveTypeChange={setRequestsLeaveType}
            sortBy={requestsSortBy}
            sortOrder={requestsSortOrder}
            onSortChange={(field, order) => {
              setRequestsSortBy(field);
              setRequestsSortOrder(order);
            }}
            branches={branches}
            leaveTypes={leaveTypesList}
            onOpenApplyModal={() => setApplyModalOpen(true)}
            onReviewRequest={handleOpenReview}
            onCancelRequest={cancelRequest}
            isCancelling={isSubmitting}
            canApprove={canApproveLeaves}
            canManage={canManageLeaves}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalQueueTab
            pendingRequests={pendingApprovalsList}
            totalCount={pendingApprovalsQuery.data?.total || pendingApprovalsList.length}
            totalPages={pendingApprovalsQuery.data?.meta?.totalPages || Math.ceil((pendingApprovalsQuery.data?.total || pendingApprovalsList.length) / 10)}
            page={approvalsPage}
            limit={10}
            onPageChange={setApprovalsPage}
            searchTerm={approvalsSearch}
            onSearchChange={setApprovalsSearch}
            sortBy={approvalsSortBy}
            sortOrder={approvalsSortOrder}
            onSortChange={(field, order) => {
              setApprovalsSortBy(field);
              setApprovalsSortOrder(order);
            }}
            isLoading={pendingApprovalsQuery.isLoading}
            onReviewRequest={handleOpenReview}
          />
        )}

        {activeTab === 'balances' && (
          <LeaveBalancesTab
            balances={allBalancesList}
            totalCount={balancesQuery.data?.total || allBalancesList.length}
            totalPages={balancesQuery.data?.meta?.totalPages || Math.ceil((balancesQuery.data?.total || allBalancesList.length) / 10)}
            page={balancesPage}
            limit={10}
            onPageChange={setBalancesPage}
            isLoading={balancesQuery.isLoading}
            searchTerm={balancesSearch}
            onSearchChange={setBalancesSearch}
            leaveTypeFilter={balancesLeaveType}
            onLeaveTypeChange={setBalancesLeaveType}
            sortBy={balancesSortBy}
            sortOrder={balancesSortOrder}
            onSortChange={(field, order) => {
              setBalancesSortBy(field);
              setBalancesSortOrder(order);
            }}
            year={balancesYear}
            onYearChange={setBalancesYear}
            branches={branches}
            leaveTypes={leaveTypesList}
            onOpenAdjustModal={handleOpenAdjust}
            onOpenAccrualModal={() => setAccrualModalOpen(true)}
            onInitializeBalances={handleBatchInitialize}
            isInitializing={isSubmitting}
            canManage={canManageLeaves}
          />
        )}

        {activeTab === 'calendar' && (
          <LeaveCalendarTab
            calendarEvents={calendarEventsList}
            blackoutPeriods={blackoutList}
            isLoading={calendarQuery.isLoading}
            branches={branches}
          />
        )}

        {activeTab === 'policies' && (
          <LeaveTypesPolicyTab
            leaveTypes={leaveTypesList}
            isLoading={leaveTypesQuery.isLoading}
            onOpenCreateModal={() => {
              setSelectedLeaveTypeForEdit(null);
              setLeaveTypeModalOpen(true);
            }}
            onOpenEditModal={handleOpenEditLeaveType}
            onToggleStatus={updateTypeStatus}
            onSeedDefaults={seedDefaults}
            isSeeding={isSubmitting}
            canManage={canManageLeaves}
          />
        )}

        {activeTab === 'blackout' && (
          <BlackoutPeriodsTab
            blackoutPeriods={blackoutList}
            isLoading={blackoutQuery.isLoading}
            branches={branches}
            leaveTypes={leaveTypesList}
            onOpenCreateModal={() => {
              setSelectedBlackoutForEdit(null);
              setBlackoutModalOpen(true);
            }}
            onOpenEditModal={handleOpenEditBlackout}
            onDeleteBlackout={deleteBlackout}
            isDeleting={isSubmitting}
            canManage={canManageLeaves}
          />
        )}

        {activeTab === 'adjustments' && (
          <BalanceAdjustmentsTab
            transactions={transactionsQuery.data?.data || []}
            totalCount={transactionsQuery.data?.total || 0}
            totalPages={transactionsQuery.data?.meta?.totalPages || Math.ceil((transactionsQuery.data?.total || 0) / 10)}
            page={transactionsPage}
            limit={10}
            onPageChange={setTransactionsPage}
            isLoading={transactionsQuery.isLoading}
            transactionTypeFilter={transactionTypeFilter}
            onTransactionTypeChange={setTransactionTypeFilter}
          />
        )}

        {activeTab === 'reports' && (
          <LeaveReportsTab
            reportData={summaryReportQuery.data}
            isLoading={summaryReportQuery.isLoading}
            year={reportsYear}
            onYearChange={setReportsYear}
            branches={branches}
            onExportCsv={handleExportCsv}
            isExporting={isSubmitting}
          />
        )}
      </div>

      {/* Modals */}
      <ApplyLeaveModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSubmit={applyLeave}
        isSubmitting={isSubmitting}
        leaveTypes={leaveTypesList}
        staffList={staffList}
        balances={myBalancesList}
        isManager={canManageLeaves && !isServiceStaff}
        currentStaffId={user?.staffId || ''}
      />

      <ReviewLeaveModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedRequestForReview(null);
        }}
        request={selectedRequestForReview}
        onReview={reviewRequest}
        isSubmitting={isSubmitting}
      />

      <AdjustBalanceModal
        isOpen={adjustModalOpen}
        onClose={() => {
          setAdjustModalOpen(false);
          setAdjustDefaultStaff('');
          setAdjustDefaultType('');
        }}
        onSubmit={adjustBalance}
        isSubmitting={isSubmitting}
        staffList={staffList}
        leaveTypes={leaveTypesList}
        defaultStaffId={adjustDefaultStaff}
        defaultLeaveTypeId={adjustDefaultType}
      />

      <LeaveTypeModal
        isOpen={leaveTypeModalOpen}
        onClose={() => {
          setLeaveTypeModalOpen(false);
          setSelectedLeaveTypeForEdit(null);
        }}
        onSubmit={selectedLeaveTypeForEdit ? updateType : createType}
        isSubmitting={isSubmitting}
        leaveType={selectedLeaveTypeForEdit}
      />

      <BlackoutPeriodModal
        isOpen={blackoutModalOpen}
        onClose={() => {
          setBlackoutModalOpen(false);
          setSelectedBlackoutForEdit(null);
        }}
        onSubmit={selectedBlackoutForEdit ? updateBlackout : createBlackout}
        isSubmitting={isSubmitting}
        blackoutPeriod={selectedBlackoutForEdit}
        branches={branches}
        leaveTypes={leaveTypesList}
      />

      <AccrualActionModal
        isOpen={accrualModalOpen}
        onClose={() => setAccrualModalOpen(false)}
        onProcessAccrual={processAccrual}
        onProcessCarryForward={processCarryForward}
        isSubmitting={isSubmitting}
        branches={branches}
      />
    </div>
  );
}

function approvalsQueryIsLoading(query) {
  return query?.isLoading ?? false;
}
