import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import { useBranch } from '../../branch/hooks/useBranch';
import { queryClient, queryKeys } from '../../../config/queryClient';
import {
  fetchSchedulingOverview,
  fetchShiftTemplates,
  fetchBranchTeamSchedule,
  fetchAvailabilityPreferences,
  fetchScheduleOverrides,
  fetchBlockedTimes,
} from '../api/staffSchedulingApi';

/**
 * Tab-level lazy fetching and caching for Staff Scheduling Workspace.
 * Automatically gates network calls by active tab and caches results via TanStack Query.
 */
export function useStaffScheduling(currentTab = 'overview') {
  const { user } = useAuth();
  const { selectedOrganisation, isSuperAdmin } = useOrganisation();
  const { branches, currentBranch, loading: branchLoading } = useBranch();

  const effectiveOrgId = isSuperAdmin ? selectedOrganisation?.id : user?.organizationId;
  const activeBranchId =
    currentBranch?.id ||
    branches?.[0]?.id ||
    (effectiveOrgId ? localStorage.getItem(`sms_active_branch_id_${effectiveOrgId}`) : null) ||
    localStorage.getItem('sms_active_branch_id') ||
    '';

  // Get current week's Monday as default weekStartDate (YYYY-MM-DD)
  const getInitialMonday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().substring(0, 10);
  };

  const [selectedBranchId, setSelectedBranchId] = useState(activeBranchId);
  const [selectedWeekStartDate, setSelectedWeekStartDate] = useState(getInitialMonday);

  // Sync with global branch selection from the top bar whenever currentBranch changes
  useEffect(() => {
    if (currentBranch?.id && currentBranch.id !== selectedBranchId) {
      setSelectedBranchId(currentBranch.id);
    } else if (activeBranchId && !selectedBranchId) {
      setSelectedBranchId(activeBranchId);
    }
  }, [currentBranch?.id, activeBranchId, selectedBranchId]);

  // Tab 1: Overview
  const overviewQuery = useQuery({
    queryKey: queryKeys.staffScheduling.tab('overview', effectiveOrgId, selectedBranchId),
    queryFn: () =>
      fetchSchedulingOverview(
        { branchId: selectedBranchId || undefined },
        effectiveOrgId,
      ),
    enabled: Boolean(effectiveOrgId && currentTab === 'overview'),
    staleTime: 60 * 1000,
  });

  // Tab 2: Shift Templates
  const templatesQuery = useQuery({
    queryKey: queryKeys.staffScheduling.tab('templates', effectiveOrgId, selectedBranchId),
    queryFn: () =>
      fetchShiftTemplates(
        { branchId: selectedBranchId || undefined, status: 'all' },
        effectiveOrgId,
      ),
    enabled: Boolean(effectiveOrgId && (currentTab === 'templates' || currentTab === 'weekly')),
    staleTime: 60 * 1000,
  });

  // Tab 3: Weekly Team Schedule
  const teamScheduleQuery = useQuery({
    queryKey: queryKeys.staffScheduling.tab('teamSchedule', effectiveOrgId, selectedBranchId, {
      weekStartDate: selectedWeekStartDate,
    }),
    queryFn: () =>
      fetchBranchTeamSchedule(
        selectedBranchId,
        selectedWeekStartDate,
        effectiveOrgId,
      ),
    enabled: Boolean(effectiveOrgId && selectedBranchId && currentTab === 'weekly'),
    staleTime: 60 * 1000,
  });

  // Tab 4: Availability Preferences
  const preferencesQuery = useQuery({
    queryKey: queryKeys.staffScheduling.tab('preferences', effectiveOrgId, selectedBranchId),
    queryFn: () =>
      fetchAvailabilityPreferences(
        { branchId: selectedBranchId || undefined },
        effectiveOrgId,
      ),
    enabled: Boolean(effectiveOrgId && currentTab === 'preferences'),
    staleTime: 60 * 1000,
  });

  // Tab 5: Schedule Overrides
  const overridesQuery = useQuery({
    queryKey: queryKeys.staffScheduling.tab('overrides', effectiveOrgId, selectedBranchId),
    queryFn: () =>
      fetchScheduleOverrides(
        { branchId: selectedBranchId || undefined },
        effectiveOrgId,
      ),
    enabled: Boolean(effectiveOrgId && currentTab === 'overrides'),
    staleTime: 60 * 1000,
  });

  // Tab 6: Blocked Times
  const blockedTimesQuery = useQuery({
    queryKey: queryKeys.staffScheduling.tab('blockedTimes', effectiveOrgId, selectedBranchId),
    queryFn: () =>
      fetchBlockedTimes(
        { branchId: selectedBranchId || undefined },
        effectiveOrgId,
      ),
    enabled: Boolean(effectiveOrgId && currentTab === 'blocked'),
    staleTime: 60 * 1000,
  });

  // Tab-specific loading state
  const loading = useMemo(() => {
    switch (currentTab) {
      case 'overview':
        return overviewQuery.isLoading;
      case 'templates':
        return templatesQuery.isLoading;
      case 'weekly':
        return teamScheduleQuery.isLoading || templatesQuery.isLoading;
      case 'preferences':
        return preferencesQuery.isLoading;
      case 'overrides':
        return overridesQuery.isLoading;
      case 'blocked':
        return blockedTimesQuery.isLoading;
      default:
        return false;
    }
  }, [
    currentTab,
    overviewQuery.isLoading,
    templatesQuery.isLoading,
    teamScheduleQuery.isLoading,
    preferencesQuery.isLoading,
    overridesQuery.isLoading,
    blockedTimesQuery.isLoading,
  ]);

  const error =
    overviewQuery.error ||
    templatesQuery.error ||
    teamScheduleQuery.error ||
    preferencesQuery.error ||
    overridesQuery.error ||
    blockedTimesQuery.error ||
    null;

  const loadOverview = useCallback(() => overviewQuery.refetch(), [overviewQuery]);
  const loadTemplates = useCallback(() => templatesQuery.refetch(), [templatesQuery]);
  const loadTeamSchedule = useCallback(() => teamScheduleQuery.refetch(), [teamScheduleQuery]);
  const loadPreferences = useCallback(() => preferencesQuery.refetch(), [preferencesQuery]);
  const loadOverrides = useCallback(() => overridesQuery.refetch(), [overridesQuery]);
  const loadBlockedTimes = useCallback(() => blockedTimesQuery.refetch(), [blockedTimesQuery]);

  const invalidateSchedulingCache = useCallback((tabName) => {
    if (tabName) {
      queryClient.invalidateQueries({
        queryKey: ['staffScheduling', tabName],
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: queryKeys.staffScheduling.all,
      });
    }
  }, []);

  return {
    effectiveOrgId,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    selectedWeekStartDate,
    setSelectedWeekStartDate,
    loading,
    error,
    overview: overviewQuery.data || null,
    templates: Array.isArray(templatesQuery.data) ? templatesQuery.data : [],
    teamSchedule: teamScheduleQuery.data || null,
    preferences: Array.isArray(preferencesQuery.data) ? preferencesQuery.data : [],
    overrides: Array.isArray(overridesQuery.data) ? overridesQuery.data : [],
    blockedTimes: Array.isArray(blockedTimesQuery.data) ? blockedTimesQuery.data : [],
    loadOverview,
    loadTemplates,
    loadTeamSchedule,
    loadPreferences,
    loadOverrides,
    loadBlockedTimes,
    invalidateSchedulingCache,
  };
}
