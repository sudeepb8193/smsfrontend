import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import { useBranch } from '../../branch/hooks/useBranch';
import {
  fetchSchedulingOverview,
  fetchShiftTemplates,
  fetchBranchTeamSchedule,
  fetchAvailabilityPreferences,
  fetchScheduleOverrides,
  fetchBlockedTimes,
} from '../api/staffSchedulingApi';

export function useStaffScheduling() {
  const { user } = useAuth();
  const { selectedOrganisation, isSuperAdmin } = useOrganisation();
  const { branches, currentBranch } = useBranch();

  const effectiveOrgId = isSuperAdmin ? selectedOrganisation?.id : user?.organizationId;
  const activeBranchId = currentBranch?.id || branches?.[0]?.id || '';

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
    if (currentBranch?.id) {
      setSelectedBranchId(currentBranch.id);
    } else if (activeBranchId && !selectedBranchId) {
      setSelectedBranchId(activeBranchId);
    }
  }, [currentBranch?.id, activeBranchId, selectedBranchId]);

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tab Data States
  const [overview, setOverview] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [teamSchedule, setTeamSchedule] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);

  // Load Overview
  const loadOverview = useCallback(async () => {
    if (!effectiveOrgId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSchedulingOverview(
        { branchId: selectedBranchId || undefined },
        effectiveOrgId,
      );
      setOverview(data);
    } catch (err) {
      console.error('Failed to load scheduling overview:', err);
      setError(err?.message || 'Failed to load scheduling overview');
    } finally {
      setLoading(false);
    }
  }, [effectiveOrgId, selectedBranchId]);

  // Load Shift Templates
  const loadTemplates = useCallback(async () => {
    if (!effectiveOrgId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchShiftTemplates(
        { branchId: selectedBranchId || undefined, status: 'all' },
        effectiveOrgId,
      );
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load shift templates:', err);
      setError(err?.message || 'Failed to load shift templates');
    } finally {
      setLoading(false);
    }
  }, [effectiveOrgId, selectedBranchId]);

  // Load Weekly Team Schedule
  const loadTeamSchedule = useCallback(async () => {
    if (!effectiveOrgId || !selectedBranchId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBranchTeamSchedule(
        selectedBranchId,
        selectedWeekStartDate,
        effectiveOrgId,
      );
      setTeamSchedule(data);
    } catch (err) {
      console.error('Failed to load team schedule grid:', err);
      setError(err?.message || 'Failed to load team schedule');
    } finally {
      setLoading(false);
    }
  }, [effectiveOrgId, selectedBranchId, selectedWeekStartDate]);

  // Load Availability Preferences
  const loadPreferences = useCallback(async () => {
    if (!effectiveOrgId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAvailabilityPreferences(
        { branchId: selectedBranchId || undefined },
        effectiveOrgId,
      );
      setPreferences(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load availability preferences:', err);
      setError(err?.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, [effectiveOrgId, selectedBranchId]);

  // Load Overrides
  const loadOverrides = useCallback(async () => {
    if (!effectiveOrgId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchScheduleOverrides(
        { branchId: selectedBranchId || undefined },
        effectiveOrgId,
      );
      setOverrides(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load schedule overrides:', err);
      setError(err?.message || 'Failed to load overrides');
    } finally {
      setLoading(false);
    }
  }, [effectiveOrgId, selectedBranchId]);

  // Load Blocked Time
  const loadBlockedTimes = useCallback(async () => {
    if (!effectiveOrgId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBlockedTimes(
        { branchId: selectedBranchId || undefined },
        effectiveOrgId,
      );
      setBlockedTimes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load blocked times:', err);
      setError(err?.message || 'Failed to load blocked times');
    } finally {
      setLoading(false);
    }
  }, [effectiveOrgId, selectedBranchId]);

  return {
    effectiveOrgId,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    selectedWeekStartDate,
    setSelectedWeekStartDate,
    loading,
    error,
    overview,
    templates,
    teamSchedule,
    preferences,
    overrides,
    blockedTimes,
    loadOverview,
    loadTemplates,
    loadTeamSchedule,
    loadPreferences,
    loadOverrides,
    loadBlockedTimes,
  };
}

