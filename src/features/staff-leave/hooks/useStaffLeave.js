import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { queryKeys } from '../../../config/queryClient';
import {
  fetchLeaveTypes,
  createLeaveType,
  updateLeaveType,
  updateLeaveTypeStatus,
  seedDefaultLeaveTypes,
  fetchStaffBalances,
  fetchMyLeaveBalances,
  fetchBalanceTransactions,
  initializeStaffBalances,
  adjustStaffBalance,
  processMonthlyAccrual,
  processCarryForward,
  applyForLeave,
  fetchLeaveRequests,
  fetchMyLeaveRequests,
  cancelLeaveRequest,
  fetchPendingApprovals,
  reviewLeaveRequest,
  fetchLeaveCalendar,
  fetchBlackoutPeriods,
  createBlackoutPeriod,
  updateBlackoutPeriod,
  deleteBlackoutPeriod,
  fetchLeaveSummaryReport,
} from '../api/staffLeaveApi';
import { toast } from 'sonner';

/**
 * Unified custom hook for Staff Leave Management (Module 09).
 * Manages queries and mutations with reactive cache updates.
 */
export const useStaffLeave = (orgId, branchId, activeTab = 'overview', params = {}) => {
  const queryClient = useQueryClient();

  const invalidateLeaveCache = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.staffLeave.all });
  };

  const invalidateEntities = (entities = []) => {
    entities.forEach((entity) => {
      queryClient.invalidateQueries({ queryKey: ['staffLeave', entity] });
    });
  };

  // 1. Leave Types Query
  const leaveTypesQuery = useQuery({
    queryKey: queryKeys.staffLeave.types(orgId, params.typesParams),
    queryFn: () => fetchLeaveTypes(params.typesParams),
    enabled: activeTab === 'policies' || activeTab === 'overview' || activeTab === 'my-leave' || activeTab === 'requests' || activeTab === 'apply-modal',
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  // 2. Staff Balances Query (Manager/Admin view)
  const balancesQuery = useQuery({
    queryKey: queryKeys.staffLeave.balances(orgId, branchId, params.balancesParams),
    queryFn: () => fetchStaffBalances({ branchId, ...params.balancesParams }),
    enabled: activeTab === 'balances' || activeTab === 'overview',
    placeholderData: keepPreviousData,
  });

  // 3. My Balances Query (Staff self-service)
  const myBalancesQuery = useQuery({
    queryKey: queryKeys.staffLeave.myBalances(orgId, params.myBalancesParams),
    queryFn: () => fetchMyLeaveBalances(params.myBalancesParams),
    enabled: activeTab === 'my-leave' || activeTab === 'overview',
    placeholderData: keepPreviousData,
  });

  // 4. Balance Transactions Query (Audit history)
  const transactionsQuery = useQuery({
    queryKey: queryKeys.staffLeave.transactions(orgId, params.transactionsParams),
    queryFn: () => fetchBalanceTransactions(params.transactionsParams),
    enabled: activeTab === 'adjustments',
    placeholderData: keepPreviousData,
  });

  // 5. Leave Requests Query (Admin/Manager view)
  const requestsQuery = useQuery({
    queryKey: queryKeys.staffLeave.requests(orgId, branchId, params.requestsParams),
    queryFn: () => fetchLeaveRequests({ branchId, ...params.requestsParams }),
    enabled: activeTab === 'requests' || activeTab === 'overview',
    placeholderData: keepPreviousData,
  });

  // 6. My Leave Requests Query (Staff self-service)
  const myRequestsQuery = useQuery({
    queryKey: queryKeys.staffLeave.myRequests(orgId, params.myRequestsParams),
    queryFn: () => fetchMyLeaveRequests(params.myRequestsParams),
    enabled: activeTab === 'my-leave',
    placeholderData: keepPreviousData,
  });

  // 7. Pending Approvals Query (Manager Queue)
  const pendingApprovalsQuery = useQuery({
    queryKey: queryKeys.staffLeave.approvals(orgId, branchId, params.approvalsParams),
    queryFn: () => fetchPendingApprovals({ branchId, ...params.approvalsParams }),
    enabled: activeTab === 'approvals' || activeTab === 'overview',
    placeholderData: keepPreviousData,
  });

  // 8. Leave Calendar Query
  const calendarQuery = useQuery({
    queryKey: queryKeys.staffLeave.calendar(orgId, branchId, params.calendarParams),
    queryFn: () => fetchLeaveCalendar({ branchId, ...params.calendarParams }),
    enabled: activeTab === 'calendar' && Boolean(params.calendarParams?.startDate && params.calendarParams?.endDate),
    placeholderData: keepPreviousData,
  });

  // 9. Blackout Periods Query
  const blackoutQuery = useQuery({
    queryKey: queryKeys.staffLeave.blackout(orgId, branchId, params.blackoutParams),
    queryFn: () => fetchBlackoutPeriods({ branchId, ...params.blackoutParams }),
    enabled: activeTab === 'blackout' || activeTab === 'calendar' || activeTab === 'overview',
    placeholderData: keepPreviousData,
  });

  // 10. Summary Report Query
  const summaryReportQuery = useQuery({
    queryKey: queryKeys.staffLeave.reports(orgId, branchId, params.reportParams),
    queryFn: () => fetchLeaveSummaryReport({ branchId, ...params.reportParams }),
    enabled: activeTab === 'reports',
    placeholderData: keepPreviousData,
  });

  // ==========================================
  // MUTATIONS (Targeted Cache Invalidation)
  // ==========================================

  // Leave Type Mutations
  const createTypeMutation = useMutation({
    mutationFn: createLeaveType,
    onSuccess: () => {
      toast.success('Leave type created successfully');
      invalidateEntities(['types']);
    },
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, payload }) => updateLeaveType(id, payload),
    onSuccess: () => {
      toast.success('Leave type updated successfully');
      invalidateEntities(['types']);
    },
  });

  const updateTypeStatusMutation = useMutation({
    mutationFn: ({ id, isActive, status }) =>
      updateLeaveTypeStatus(id, status !== undefined ? status : isActive),
    onSuccess: () => {
      toast.success('Leave type status updated');
      invalidateEntities(['types']);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update leave type status');
    },
  });

  const seedDefaultsMutation = useMutation({
    mutationFn: seedDefaultLeaveTypes,
    onSuccess: (data) => {
      toast.success(data?.message || 'Standard salon leave types initialized');
      invalidateEntities(['types']);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to initialize default leave types');
    },
  });

  // Balance & Accrual Mutations
  const initializeBalancesMutation = useMutation({
    mutationFn: initializeStaffBalances,
    onSuccess: (data) => {
      toast.success(data?.message || 'Staff leave balances initialized');
      invalidateEntities(['balances', 'myBalances', 'transactions', 'reports']);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to initialize balances');
    },
  });

  const adjustBalanceMutation = useMutation({
    mutationFn: adjustStaffBalance,
    onSuccess: (data) => {
      toast.success(data?.message || 'Balance adjusted successfully');
      invalidateEntities(['balances', 'myBalances', 'transactions', 'reports']);
    },
  });

  const processAccrualMutation = useMutation({
    mutationFn: processMonthlyAccrual,
    onSuccess: (data) => {
      toast.success(data?.message || 'Monthly accrual processed successfully');
      invalidateEntities(['balances', 'myBalances', 'transactions', 'reports']);
    },
  });

  const processCarryForwardMutation = useMutation({
    mutationFn: processCarryForward,
    onSuccess: (data) => {
      toast.success(data?.message || 'Year-end carry forward processed successfully');
      invalidateEntities(['balances', 'myBalances', 'transactions', 'reports']);
    },
  });

  // Request & Application Mutations
  const applyLeaveMutation = useMutation({
    mutationFn: applyForLeave,
    onSuccess: (data) => {
      toast.success(data?.message || 'Leave request submitted successfully');
      invalidateEntities(['requests', 'myRequests', 'approvals', 'balances', 'myBalances', 'calendar', 'reports']);
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: ({ id, reason }) => cancelLeaveRequest(id, reason),
    onSuccess: (data) => {
      toast.success(data?.message || 'Leave request cancelled successfully');
      invalidateEntities(['requests', 'myRequests', 'approvals', 'balances', 'myBalances', 'calendar', 'reports']);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to cancel leave request');
    },
  });

  // Approval Mutations
  const reviewRequestMutation = useMutation({
    mutationFn: ({ id, payload }) => reviewLeaveRequest(id, payload),
    onSuccess: (data) => {
      toast.success(data?.message || 'Leave request reviewed successfully');
      invalidateEntities(['requests', 'myRequests', 'approvals', 'balances', 'myBalances', 'calendar', 'reports']);
    },
  });

  // Blackout Period Mutations
  const createBlackoutMutation = useMutation({
    mutationFn: createBlackoutPeriod,
    onSuccess: () => {
      toast.success('Blackout period created successfully');
      invalidateEntities(['blackout', 'calendar']);
    },
  });

  const updateBlackoutMutation = useMutation({
    mutationFn: ({ id, payload }) => updateBlackoutPeriod(id, payload),
    onSuccess: () => {
      toast.success('Blackout period updated successfully');
      invalidateEntities(['blackout', 'calendar']);
    },
  });

  const deleteBlackoutMutation = useMutation({
    mutationFn: deleteBlackoutPeriod,
    onSuccess: () => {
      toast.success('Blackout period deleted successfully');
      invalidateEntities(['blackout', 'calendar']);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to delete blackout period');
    },
  });

  return {
    // Queries
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

    // Mutation triggers
    createType: createTypeMutation.mutateAsync,
    updateType: updateTypeMutation.mutateAsync,
    updateTypeStatus: updateTypeStatusMutation.mutateAsync,
    seedDefaults: seedDefaultsMutation.mutateAsync,
    initializeBalances: initializeBalancesMutation.mutateAsync,
    adjustBalance: adjustBalanceMutation.mutateAsync,
    processAccrual: processAccrualMutation.mutateAsync,
    processCarryForward: processCarryForwardMutation.mutateAsync,
    applyLeave: applyLeaveMutation.mutateAsync,
    cancelRequest: cancelRequestMutation.mutateAsync,
    reviewRequest: reviewRequestMutation.mutateAsync,
    createBlackout: createBlackoutMutation.mutateAsync,
    updateBlackout: updateBlackoutMutation.mutateAsync,
    deleteBlackout: deleteBlackoutMutation.mutateAsync,

    // Mutation states
    isSubmitting:
      applyLeaveMutation.isPending ||
      cancelRequestMutation.isPending ||
      reviewRequestMutation.isPending ||
      adjustBalanceMutation.isPending ||
      createTypeMutation.isPending ||
      updateTypeMutation.isPending ||
      createBlackoutMutation.isPending ||
      updateBlackoutMutation.isPending ||
      deleteBlackoutMutation.isPending,

    // Invalidation
    invalidateLeaveCache,
  };
};
