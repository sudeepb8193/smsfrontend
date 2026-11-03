import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Loader from '../../../components/shared/Loader';
import UnderlineTabs from '../../../components/shared/UnderlineTabs';
import { useAuth } from '../../../hooks/useAuth';
import { usePermission } from '../../../hooks/usePermission';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import { useBranch } from '../../branch/hooks/useBranch';
import { fetchStaffList } from '../../staff/api/staffApi';
import { useStaffScheduling } from '../hooks/useStaffScheduling';
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
  } = useStaffScheduling();

  // Eligible staff list for dropdowns & assignments
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);

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

  // Load Staff for the selected branch / org
  const loadStaffMembers = useCallback(async () => {
    if (!effectiveOrgId) return;
    try {
      setStaffLoading(true);
      const res = await fetchStaffList({
        organizationId: effectiveOrgId,
        branchId: selectedBranchId || undefined,
        limit: 100,
        employmentStatus: 'active',
      });
      const items = res?.items || res || [];
      setStaffList(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load branch staff list:', err);
    } finally {
      setStaffLoading(false);
    }
  }, [effectiveOrgId, selectedBranchId]);

  useEffect(() => {
    loadStaffMembers();
  }, [loadStaffMembers]);

  // Load active tab data on change
  useEffect(() => {
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
        loadOverview();
        break;
    }
  }, [
    currentTab,
    loadOverview,
    loadTeamSchedule,
    loadTemplates,
    loadOverrides,
    loadBlockedTimes,
    loadPreferences,
  ]);

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
    loadStaffMembers();
  };

  // CRUD Handlers
  const handleCreateTemplate = async (payload) => {
    try {
      setActionLoading(true);
      await createShiftTemplate(payload, effectiveOrgId);
      await loadTemplates();
      setTemplateModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTemplate = async (templateId, payload) => {
    await updateShiftTemplate(templateId, payload, effectiveOrgId);
    await loadTemplates();
  };

  const handleRetireTemplate = async (templateId) => {
    await retireShiftTemplate(templateId, effectiveOrgId);
    await loadTemplates();
  };

  const handleReactivateTemplate = async (templateId) => {
    await reactivateShiftTemplate(templateId, effectiveOrgId);
    await loadTemplates();
  };

  const handleDeleteTemplate = async (templateId) => {
    await deleteShiftTemplate(templateId, effectiveOrgId);
    await loadTemplates();
  };

  const handleSaveSchedule = async (payload) => {
    await saveWeeklySchedule(payload, effectiveOrgId);
    await loadTeamSchedule();
  };

  const handleCopySchedule = async (payload) => {
    try {
      setActionLoading(true);
      await copyWeeklySchedule(payload, effectiveOrgId);
      await loadTeamSchedule();
      setCopyModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateOverride = async (payload) => {
    try {
      setActionLoading(true);
      await createScheduleOverride(payload, effectiveOrgId);
      await loadOverrides();
      if (currentTab === 'weekly') await loadTeamSchedule();
      setOverrideModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSwap = async (payload) => {
    await createShiftSwap(payload, effectiveOrgId);
    await loadOverrides();
    if (currentTab === 'weekly') await loadTeamSchedule();
  };

  const handleReviewOverride = async (overrideId, payload) => {
    await reviewScheduleOverride(overrideId, payload, effectiveOrgId);
    await loadOverrides();
    if (currentTab === 'weekly') await loadTeamSchedule();
  };

  const handleCancelOverride = async (overrideId) => {
    await cancelScheduleOverride(overrideId, effectiveOrgId);
    await loadOverrides();
    if (currentTab === 'weekly') await loadTeamSchedule();
  };

  const handleCreateBlockedTime = async (payload) => {
    try {
      setActionLoading(true);
      await createBlockedTime(payload, effectiveOrgId);
      await loadBlockedTimes();
      if (currentTab === 'weekly') await loadTeamSchedule();
      setBlockModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkCreateBlockedTime = async (payload) => {
    try {
      setActionLoading(true);
      await bulkCreateBlockedTime(payload, effectiveOrgId);
      await loadBlockedTimes();
      if (currentTab === 'weekly') await loadTeamSchedule();
      setBlockModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBlockedTime = async (blockId) => {
    await cancelBlockedTime(blockId, effectiveOrgId);
    await loadBlockedTimes();
    if (currentTab === 'weekly') await loadTeamSchedule();
  };

  const handleCreatePreference = async (payload) => {
    try {
      setActionLoading(true);
      await createAvailabilityPreference(payload, effectiveOrgId);
      await loadPreferences();
      setPreferenceModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePreference = async (preferenceId, payload) => {
    await updateAvailabilityPreference(preferenceId, payload, effectiveOrgId);
    await loadPreferences();
  };

  const handleDeletePreference = async (preferenceId) => {
    await deleteAvailabilityPreference(preferenceId, effectiveOrgId);
    await loadPreferences();
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
