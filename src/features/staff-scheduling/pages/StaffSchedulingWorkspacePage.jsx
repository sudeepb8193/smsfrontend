import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Loader from '../../../components/shared/Loader';
import UnderlineTabs from '../../../components/shared/UnderlineTabs';
import { useAuth } from '../../../hooks/useAuth';
import { usePermission } from '../../../hooks/usePermission';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import { useBranch } from '../../branch/hooks/useBranch';
import { queryKeys } from '../../../config/queryClient';
import { fetchStaffList } from '../../staff/api/staffApi';
import { useStaffScheduling } from '../hooks/useStaffScheduling';
import { toast } from '../../../components/shared/Toast';
import {
  createShiftTemplate,
  updateShiftTemplate,
  retireShiftTemplate,
  reactivateShiftTemplate,
  deleteShiftTemplate,
  saveWeeklySchedule,
  copyWeeklySchedule,
  createAvailabilityPreference,
  updateAvailabilityPreference,
  deleteAvailabilityPreference,
  createScheduleOverride,
  createShiftSwap,
  reviewScheduleOverride,
  cancelScheduleOverride,
  createBlockedTime,
  bulkCreateBlockedTime,
  cancelBlockedTime,
} from '../api/staffSchedulingApi';

// Subcomponents / Tabs
import SchedulingOverviewTab from '../components/SchedulingOverviewTab';
import WeeklyScheduleBuilderTab from '../components/WeeklyScheduleBuilderTab';
import ShiftTemplatesTab from '../components/ShiftTemplatesTab';
import ScheduleOverridesTab from '../components/ScheduleOverridesTab';
import BlockedTimeTab from '../components/BlockedTimeTab';
import AvailabilityPreferencesTab from '../components/AvailabilityPreferencesTab';

// Modals
import ShiftTemplateModal from '../components/modals/ShiftTemplateModal';
import PreferenceModal from '../components/modals/PreferenceModal';
import ScheduleOverrideModal from '../components/modals/ScheduleOverrideModal';
import BlockedTimeModal from '../components/modals/BlockedTimeModal';
import CopyScheduleModal from '../components/modals/CopyScheduleModal';

import {
  CalendarDays,
  CalendarRange,
  Clock,
  Layers,
  ShieldAlert,
  ThumbsUp,
  Building2,
  RefreshCw,
  Plus,
  Calendar,
  Sparkles,
} from 'lucide-react';

const TAB_CONFIG = {
  overview: {
    title: 'Staff Scheduling',
    subtitle: 'Manage staff schedules, shifts and availability across your branches',
    actionLabel: null,
  },
  templates: {
    title: 'Shift Templates',
    subtitle: 'Create and manage reusable shift templates',
    actionLabel: '+ New Template',
  },
  weekly: {
    title: 'Team Schedule',
    subtitle: 'View and manage team schedules',
    actionLabel: null,
  },
  preferences: {
    title: 'Availability Preferences',
    subtitle: 'Set your preferred, avoid or unavailable times',
    actionLabel: '+ Add Preference',
  },
  overrides: {
    title: 'Schedule Overrides',
    subtitle: 'Manage schedule changes and shift swaps',
    actionLabel: '+ New Override',
  },
  blocked: {
    title: 'Block Time',
    subtitle: 'Block specific time periods for staff',
    actionLabel: '+ Block Time',
  },
};

export default function StaffSchedulingWorkspacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const { user } = useAuth();
  const { can } = usePermission();
  const { selectedOrganisation, isSuperAdmin } = useOrganisation();
  const { branches } = useBranch();

  const {
    effectiveOrgId,
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
    invalidateSchedulingCache,
  } = useStaffScheduling(currentTab);

  // Eligible staff list for dropdowns & assignments via TanStack Query
  const {
    data: staffData,
    isLoading: staffLoading,
    refetch: refetchStaffMembers,
  } = useQuery({
    queryKey: queryKeys.staff.list(effectiveOrgId, selectedBranchId, { employmentStatus: 'active', limit: 10 }),
    queryFn: () =>
      fetchStaffList({
        organizationId: effectiveOrgId,
        branchId: selectedBranchId || undefined,
        limit: 10,
        employmentStatus: 'active',
      }),
    enabled: Boolean(effectiveOrgId),
    staleTime: 5 * 60 * 1000,
  });

  const staffList = useMemo(() => {
    const items = staffData?.items || staffData?.data || staffData || [];
    return Array.isArray(items) ? items : [];
  }, [staffData]);

  // Global Workspace Modals triggered from Top-Right Action Button
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [preferenceModalOpen, setPreferenceModalOpen] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isManagerOrOwner =
    isSuperAdmin ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'OWNER' ||
    user?.role === 'BRANCH_MANAGER';

  const canManageScheduling =
    isManagerOrOwner || can('staff_schedule.manage', selectedBranchId);

  // Identify active branch object
  const currentBranch = branches?.find((b) => b.id === selectedBranchId) || branches?.[0];

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleRefresh = () => {
    switch (currentTab) {
      case 'overview':
        loadOverview();
        break;
      case 'templates':
        loadTemplates();
        break;
      case 'weekly':
        loadTeamSchedule();
        loadTemplates();
        break;
      case 'preferences':
        loadPreferences();
        break;
      case 'overrides':
        loadOverrides();
        break;
      case 'blocked':
        loadBlockedTimes();
        break;
      default:
        break;
    }
    refetchStaffMembers();
  };

  // CRUD Handlers with intelligent cache invalidation
  const handleCreateTemplate = async (payload) => {
    try {
      setActionLoading(true);
      await createShiftTemplate(payload, effectiveOrgId);
      toast.success('Shift template created successfully.');
      invalidateSchedulingCache('templates');
      invalidateSchedulingCache('overview');
      setTemplateModalOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to create shift template');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTemplate = async (templateId, payload) => {
    try {
      await updateShiftTemplate(templateId, payload, effectiveOrgId);
      toast.success('Shift template updated successfully.');
      invalidateSchedulingCache('templates');
      invalidateSchedulingCache('overview');
    } catch (err) {
      toast.error(err?.message || 'Failed to update shift template');
      throw err;
    }
  };

  const handleRetireTemplate = async (templateId) => {
    try {
      await retireShiftTemplate(templateId, effectiveOrgId);
      toast.success('Shift template retired.');
      invalidateSchedulingCache('templates');
      invalidateSchedulingCache('overview');
    } catch (err) {
      toast.error(err?.message || 'Failed to retire shift template');
      throw err;
    }
  };

  const handleReactivateTemplate = async (templateId) => {
    try {
      await reactivateShiftTemplate(templateId, effectiveOrgId);
      toast.success('Shift template reactivated.');
      invalidateSchedulingCache('templates');
      invalidateSchedulingCache('overview');
    } catch (err) {
      toast.error(err?.message || 'Failed to reactivate shift template');
      throw err;
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await deleteShiftTemplate(templateId, effectiveOrgId);
      toast.success('Shift template deleted.');
      invalidateSchedulingCache('templates');
      invalidateSchedulingCache('overview');
    } catch (err) {
      toast.error(err?.message || 'Failed to delete shift template');
      throw err;
    }
  };

  const handleSaveSchedule = async (payload) => {
    try {
      await saveWeeklySchedule(payload, effectiveOrgId);
      toast.success('Weekly schedule saved successfully.');
      invalidateSchedulingCache('teamSchedule');
      invalidateSchedulingCache('overview');
    } catch (err) {
      toast.error(err?.message || 'Failed to save weekly schedule');
      throw err;
    }
  };

  const handleCopySchedule = async (payload) => {
    try {
      setActionLoading(true);
      await copyWeeklySchedule(payload, effectiveOrgId);
      toast.success('Weekly schedule copied successfully.');
      invalidateSchedulingCache('teamSchedule');
      invalidateSchedulingCache('overview');
      setCopyModalOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to copy weekly schedule');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateOverride = async (payload) => {
    try {
      setActionLoading(true);
      await createScheduleOverride(payload, effectiveOrgId);
      toast.success('Schedule override saved.');
      invalidateSchedulingCache('overrides');
      invalidateSchedulingCache('teamSchedule');
      setOverrideModalOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to create schedule override');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSwap = async (payload) => {
    try {
      await createShiftSwap(payload, effectiveOrgId);
      toast.success('Shift swap request submitted.');
      invalidateSchedulingCache('overrides');
      invalidateSchedulingCache('teamSchedule');
    } catch (err) {
      toast.error(err?.message || 'Failed to submit shift swap request');
      throw err;
    }
  };

  const handleReviewOverride = async (overrideId, payload) => {
    try {
      await reviewScheduleOverride(overrideId, payload, effectiveOrgId);
      toast.success('Schedule override reviewed.');
      invalidateSchedulingCache('overrides');
      invalidateSchedulingCache('teamSchedule');
    } catch (err) {
      toast.error(err?.message || 'Failed to review schedule override');
      throw err;
    }
  };

  const handleCancelOverride = async (overrideId) => {
    try {
      await cancelScheduleOverride(overrideId, effectiveOrgId);
      toast.success('Schedule override cancelled.');
      invalidateSchedulingCache('overrides');
      invalidateSchedulingCache('teamSchedule');
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel schedule override');
      throw err;
    }
  };

  const handleCreateBlockedTime = async (payload) => {
    try {
      setActionLoading(true);
      await createBlockedTime(payload, effectiveOrgId);
      toast.success('Blocked time created.');
      invalidateSchedulingCache('blockedTimes');
      invalidateSchedulingCache('teamSchedule');
      setBlockModalOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to create blocked time');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkCreateBlockedTime = async (payload) => {
    try {
      setActionLoading(true);
      await bulkCreateBlockedTime(payload, effectiveOrgId);
      toast.success('Bulk blocked time created.');
      invalidateSchedulingCache('blockedTimes');
      invalidateSchedulingCache('teamSchedule');
      setBlockModalOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to create bulk blocked time');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBlockedTime = async (blockId) => {
    try {
      await cancelBlockedTime(blockId, effectiveOrgId);
      toast.success('Blocked time cancelled.');
      invalidateSchedulingCache('blockedTimes');
      invalidateSchedulingCache('teamSchedule');
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel blocked time');
      throw err;
    }
  };

  const handleCreatePreference = async (payload) => {
    try {
      setActionLoading(true);
      await createAvailabilityPreference(payload, effectiveOrgId);
      toast.success('Availability preference saved.');
      invalidateSchedulingCache('preferences');
      setPreferenceModalOpen(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to save availability preference');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePreference = async (preferenceId, payload) => {
    try {
      await updateAvailabilityPreference(preferenceId, payload, effectiveOrgId);
      toast.success('Availability preference updated.');
      invalidateSchedulingCache('preferences');
    } catch (err) {
      toast.error(err?.message || 'Failed to update availability preference');
      throw err;
    }
  };

  const handleDeletePreference = async (preferenceId) => {
    try {
      await deleteAvailabilityPreference(preferenceId, effectiveOrgId);
      toast.success('Availability preference removed.');
      invalidateSchedulingCache('preferences');
    } catch (err) {
      toast.error(err?.message || 'Failed to remove availability preference');
      throw err;
    }
  };

  // Top Action button click handler
  const handleTopActionClick = () => {
    switch (currentTab) {
      case 'templates':
        setTemplateModalOpen(true);
        break;
      case 'preferences':
        setPreferenceModalOpen(true);
        break;
      case 'overrides':
        setOverrideModalOpen(true);
        break;
      case 'blocked':
        setBlockModalOpen(true);
        break;
      default:
        break;
    }
  };

  // Tab definitions matching Image:
  // Overview | Shift Templates | Team Schedule | Availability Preferences | Overrides | Block Time
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
    },
    {
      id: 'templates',
      label: 'Shift Templates',
    },
    {
      id: 'weekly',
      label: 'Team Schedule',
    },
    {
      id: 'preferences',
      label: 'Availability Preferences',
    },
    {
      id: 'overrides',
      label: 'Overrides',
    },
    {
      id: 'blocked',
      label: 'Block Time',
    },
  ];

  const currentTabHeader = TAB_CONFIG[currentTab] || TAB_CONFIG.overview;

  return (
    <div className="space-y-4 pb-8">
      {/* Top Header matching exact UX from Image */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Calendar Icon Badge matching Image */}
          <div className="w-10 h-10 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 border border-primary-500/20 shadow-2xs">
            <Calendar size={20} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                {currentTabHeader.title}
              </h1>
              {currentBranch && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full border border-primary-500/20">
                  <Building2 size={11} />
                  {currentBranch.name}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {currentTabHeader.subtitle}
            </p>
          </div>
        </div>

        {/* Top Right Action Button matching Image */}
        <div className="flex items-center gap-2.5 shrink-0">
          {currentTabHeader.actionLabel && (
            <Button
              type="button"
              variant="primary"
              size="small"
              onClick={handleTopActionClick}
              className="cursor-pointer font-bold shadow-2xs"
            >
              <span>{currentTabHeader.actionLabel}</span>
            </Button>
          )}

          {/* Quick Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            title="Refresh scheduling data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center justify-between">
          <span>{error}</span>
          <Button variant="secondary" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        </div>
      )}

      {/* Clean Tabs Navigation directly under header */}
      <div className="border-b border-[var(--border-color)] -mb-1">
        <UnderlineTabs
          tabs={tabs}
          activeTab={currentTab}
          onChange={handleTabChange}
          showBorder={false}
        />
      </div>

      {/* Active Tab Content Panel */}
      <div>
        {currentTab === 'overview' && (
          <SchedulingOverviewTab
            overview={overview}
            branches={branches}
            loading={loading}
            onNavigateTab={handleTabChange}
            onOpenOverrideModal={() => setOverrideModalOpen(true)}
            onOpenBlockModal={() => setBlockModalOpen(true)}
            onOpenCopyModal={() => setCopyModalOpen(true)}
          />
        )}

        {currentTab === 'templates' && (
          <ShiftTemplatesTab
            templates={templates}
            branches={branches}
            loading={loading}
            onCreate={handleCreateTemplate}
            onUpdate={handleUpdateTemplate}
            onRetire={handleRetireTemplate}
            onReactivate={handleReactivateTemplate}
            onDelete={handleDeleteTemplate}
          />
        )}

        {currentTab === 'weekly' && (
          <WeeklyScheduleBuilderTab
            teamSchedule={teamSchedule}
            templates={templates}
            selectedWeekStartDate={selectedWeekStartDate}
            onChangeWeekStartDate={setSelectedWeekStartDate}
            loading={loading}
            onSaveSchedule={handleSaveSchedule}
            onCopySchedule={handleCopySchedule}
            onCreateOverride={handleCreateOverride}
          />
        )}

        {currentTab === 'preferences' && (
          <AvailabilityPreferencesTab
            preferences={preferences}
            staffList={staffList}
            loading={loading}
            onCreate={handleCreatePreference}
            onUpdate={handleUpdatePreference}
            onDelete={handleDeletePreference}
            canManage={canManageScheduling}
          />
        )}

        {currentTab === 'overrides' && (
          <ScheduleOverridesTab
            overrides={overrides}
            staffList={staffList}
            loading={loading}
            onCreateOverride={handleCreateOverride}
            onCreateSwap={handleCreateSwap}
            onReview={handleReviewOverride}
            onCancel={handleCancelOverride}
            canManage={canManageScheduling}
          />
        )}

        {currentTab === 'blocked' && (
          <BlockedTimeTab
            blockedTimes={blockedTimes}
            staffList={staffList}
            branches={branches}
            selectedBranchId={selectedBranchId}
            loading={loading}
            onCreate={handleCreateBlockedTime}
            onBulkCreate={handleBulkCreateBlockedTime}
            onCancel={handleCancelBlockedTime}
            canManage={canManageScheduling}
          />
        )}
      </div>

      {/* Global Modals triggered from Top-Right Action Button */}
      {templateModalOpen && (
        <ShiftTemplateModal
          isOpen={templateModalOpen}
          onClose={() => setTemplateModalOpen(false)}
          onSubmit={handleCreateTemplate}
          branches={branches}
          loading={actionLoading}
        />
      )}

      {preferenceModalOpen && (
        <PreferenceModal
          isOpen={preferenceModalOpen}
          onClose={() => setPreferenceModalOpen(false)}
          onSubmit={handleCreatePreference}
          staffList={staffList}
          targetStaffId={staffList[0]?.id}
          staffName={staffList[0]?.fullName}
          loading={actionLoading}
        />
      )}

      {overrideModalOpen && (
        <ScheduleOverrideModal
          isOpen={overrideModalOpen}
          onClose={() => setOverrideModalOpen(false)}
          onSubmit={handleCreateOverride}
          staffList={staffList}
          loading={actionLoading}
        />
      )}

      {blockModalOpen && (
        <BlockedTimeModal
          isOpen={blockModalOpen}
          onClose={() => setBlockModalOpen(false)}
          onSubmit={handleCreateBlockedTime}
          staffList={staffList}
          branches={branches}
          currentBranchId={selectedBranchId}
          loading={actionLoading}
        />
      )}

      {copyModalOpen && (
        <CopyScheduleModal
          isOpen={copyModalOpen}
          onClose={() => setCopyModalOpen(false)}
          onSubmit={handleCopySchedule}
          staffList={staffList}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
