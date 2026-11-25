import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { queryKeys, invalidateModuleCache } from '../../../config/queryClient';
import {
  fetchAttendanceOverview,
  fetchDailyAttendance,
  fetchCurrentlyCheckedIn,
  fetchMyAttendance,
  fetchEffectivePolicy,
  fetchPendingCorrections,
  fetchMyCorrections,
  fetchPeriodReview,
  fetchMonthlySummary,
  checkInStaff,
  checkOutStaff,
  submitManualAttendance,
  saveOrganizationPolicy,
  saveBranchPolicy,
  deleteBranchPolicy,
  submitCorrectionRequest,
  approveCorrection,
  rejectCorrection,
  approvePeriod,
  approveAllClean,
  reopenPeriod,
  recalculateMonthlySummary,
} from '../api/staffAttendanceApi';

export const useStaffAttendance = (orgId, branchId, activeTab = 'overview', params = {}) => {
  const queryClient = useQueryClient();

  // 1. Overview Metrics Query
  const overviewQuery = useQuery({
    queryKey: queryKeys.staffAttendance.tab('overview', orgId, branchId, params),
    queryFn: () => fetchAttendanceOverview({ branchId, ...params }, orgId),
    enabled: activeTab === 'overview',
    placeholderData: keepPreviousData,
  });

  // 2. Daily Attendance Query
  const dailyQuery = useQuery({
    queryKey: queryKeys.staffAttendance.tab('daily', orgId, branchId, params),
    queryFn: () => fetchDailyAttendance({ branchId, ...params }, orgId),
    enabled: activeTab === 'daily',
    placeholderData: keepPreviousData,
  });

  // 3. Currently Checked In Query
  const currentlyCheckedInQuery = useQuery({
    queryKey: queryKeys.staffAttendance.tab('currently-in', orgId, branchId),
    queryFn: () => fetchCurrentlyCheckedIn(branchId, orgId),
    enabled: activeTab === 'overview' || activeTab === 'kiosk' || activeTab === 'daily',
    refetchInterval: 30000, // 30s live poll for kiosk / overview
  });

  // 4. My Attendance Query (Self-Service)
  const myAttendanceQuery = useQuery({
    queryKey: queryKeys.staffAttendance.tab('my-attendance', orgId, branchId, params),
    queryFn: () => fetchMyAttendance(params, orgId),
    enabled: activeTab === 'my-attendance',
  });

  // 5. Effective Policy Query
  const policyQuery = useQuery({
    queryKey: queryKeys.staffAttendance.tab('policy', orgId, branchId),
    queryFn: () => fetchEffectivePolicy(branchId, orgId),
    enabled: activeTab === 'settings' || activeTab === 'daily',
  });

  // 6. Pending Corrections Query
  const correctionsQuery = useQuery({
    queryKey: queryKeys.staffAttendance.tab('corrections', orgId, branchId, params),
    queryFn: () => fetchPendingCorrections({ branchId, ...params }, orgId),
    enabled: activeTab === 'corrections',
  });

  // 7. My Corrections Query (Self-Service)
  const myCorrectionsQuery = useQuery({
    queryKey: queryKeys.staffAttendance.tab('my-corrections', orgId, branchId, params),
    queryFn: () => fetchMyCorrections(params, orgId),
    enabled: activeTab === 'my-attendance',
  });

  // 8. Period Review Query
  const periodReviewQuery = useQuery({
    queryKey: queryKeys.staffAttendance.tab('approvals', orgId, branchId, params),
    queryFn: () =>
      fetchPeriodReview(branchId, params.periodStart, params.periodEnd, orgId),
    enabled: activeTab === 'approvals' && Boolean(branchId && params.periodStart && params.periodEnd),
    placeholderData: keepPreviousData,
  });

  // 9. Monthly Summary Query
  const monthlySummaryQuery = useQuery({
    queryKey: queryKeys.staffAttendance.tab('reports', orgId, branchId, params),
    queryFn: () =>
      fetchMonthlySummary(branchId, params.year, params.month, orgId),
    enabled: activeTab === 'reports' && Boolean(branchId && params.year && params.month),
    placeholderData: keepPreviousData,
  });

  const invalidateAttendance = () => {
    invalidateModuleCache('staffAttendance');
  };

  return {
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
  };
};

export const useCurrentlyIn = (branchId, orgId) => {
  return useQuery({
    queryKey: queryKeys.staffAttendance.tab('currently-in', orgId, branchId),
    queryFn: () => fetchCurrentlyCheckedIn(branchId, orgId),
    enabled: Boolean(branchId),
    refetchInterval: 15000,
  });
};

export default useStaffAttendance;
