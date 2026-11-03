import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Loader from '../../../components/shared/Loader';
import EmptyState from '../../../components/shared/EmptyState';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import { useAuth } from '../../../hooks/useAuth';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import { fetchMyProfile, fetchStaffList } from '../../staff/api/staffApi';
import {
  fetchStaffWeeklySchedule,
  fetchAvailabilityPreferences,
  fetchScheduleOverrides,
  fetchBlockedTimes,
  createAvailabilityPreference,
  deleteAvailabilityPreference,
  createShiftSwap,
  createBlockedTime,
  cancelBlockedTime,
} from '../api/staffSchedulingApi';

import PreferenceModal from '../components/modals/PreferenceModal';
import ShiftSwapModal from '../components/modals/ShiftSwapModal';
import BlockedTimeModal from '../components/modals/BlockedTimeModal';

import {
  Calendar,
  Clock,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowLeftRight,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  Slash,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Building2,
  Sparkles,
  MapPin,
  CalendarDays,
} from 'lucide-react';

const WEEKDAYS = [
  { index: 1, name: 'Monday' },
  { index: 2, name: 'Tuesday' },
  { index: 3, name: 'Wednesday' },
  { index: 4, name: 'Thursday' },
  { index: 5, name: 'Friday' },
  { index: 6, name: 'Saturday' },
  { index: 0, name: 'Sunday' },
];

export default function StaffSelfSchedulePage() {
  const { user } = useAuth();
  const { selectedOrganisation, isSuperAdmin } = useOrganisation();
  const effectiveOrgId = isSuperAdmin ? selectedOrganisation?.id : user?.organizationId;

  // Week start date calculation
  const getInitialMonday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().substring(0, 10);
  };

  const [currentWeekMonday, setCurrentWeekMonday] = useState(getInitialMonday);
  const [profile, setProfile] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scheduling Data
  const [scheduleData, setScheduleData] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);

  // Modals
  const [preferenceModalOpen, setPreferenceModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [blockedModalOpen, setBlockedModalOpen] = useState(false);
  const [deletePrefCandidate, setDeletePrefCandidate] = useState(null);
  const [cancelBlockCandidate, setCancelBlockCandidate] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load My Profile
  useEffect(() => {
    async function loadProfile() {
      if (!effectiveOrgId) return;
      try {
        setLoading(true);
        const myData = await fetchMyProfile(effectiveOrgId);
        setProfile(myData);

        // Also load peer staff for swap requests
        if (myData?.homeBranchId) {
          const peers = await fetchStaffList({
            organizationId: effectiveOrgId,
            branchId: myData.homeBranchId,
            limit: 50,
          });
          const peerItems = peers?.items || peers || [];
          setStaffList(Array.isArray(peerItems) ? peerItems : []);
        }
      } catch (err) {
        console.error('Failed to load employee profile:', err);
        setError('Could not locate your employee profile. Please contact your manager.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [effectiveOrgId]);

  // Load Schedule, Preferences, Overrides, Blocks
  const loadScheduleDetails = useCallback(async () => {
    if (!profile?.id || !effectiveOrgId) return;
    try {
      setLoading(true);
      setError(null);

      const [schedRes, prefRes, overRes, blockRes] = await Promise.all([
        fetchStaffWeeklySchedule(profile.id, currentWeekMonday, effectiveOrgId).catch(() => null),
        fetchAvailabilityPreferences({ staffId: profile.id }, effectiveOrgId).catch(() => []),
        fetchScheduleOverrides({ staffId: profile.id }, effectiveOrgId).catch(() => []),
        fetchBlockedTimes({ staffId: profile.id }, effectiveOrgId).catch(() => []),
      ]);

      setScheduleData(schedRes);
      setPreferences(Array.isArray(prefRes) ? prefRes : []);
      setOverrides(Array.isArray(overRes) ? overRes : []);
      setBlockedTimes(Array.isArray(blockRes) ? blockRes : []);
    } catch (err) {
      console.error('Failed to load my schedule details:', err);
      setError('Failed to refresh schedule information.');
    } finally {
      setLoading(false);
    }
  }, [profile?.id, effectiveOrgId, currentWeekMonday]);

  useEffect(() => {
    if (profile?.id) {
      loadScheduleDetails();
    }
  }, [profile?.id, loadScheduleDetails]);

  // Week navigation
  const handlePrevWeek = () => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() - 7);
    setCurrentWeekMonday(d.toISOString().substring(0, 10));
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() + 7);
    setCurrentWeekMonday(d.toISOString().substring(0, 10));
  };

  const handleCurrentWeek = () => {
    setCurrentWeekMonday(getInitialMonday());
  };

  // Preference Handlers
  const handleCreatePref = async (payload) => {
    try {
      setActionLoading(true);
      await createAvailabilityPreference(
        {
          ...payload,
          staffId: profile.id,
        },
        effectiveOrgId,
      );
      setPreferenceModalOpen(false);
      await loadScheduleDetails();
    } catch (err) {
      console.error('Failed to submit preference:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePref = async () => {
    if (!deletePrefCandidate) return;
    try {
      setActionLoading(true);
      await deleteAvailabilityPreference(deletePrefCandidate.id, effectiveOrgId);
      setDeletePrefCandidate(null);
      await loadScheduleDetails();
    } catch (err) {
      console.error('Failed to delete preference:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Shift Swap Handler
  const handleCreateSwap = async (payload) => {
    try {
      setActionLoading(true);
      await createShiftSwap(payload, effectiveOrgId);
      setSwapModalOpen(false);
      await loadScheduleDetails();
    } catch (err) {
      console.error('Failed to submit swap request:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Blocked Time Handler
  const handleCreateBlock = async (payload) => {
    try {
      setActionLoading(true);
      await createBlockedTime(
        {
          ...payload,
          staffId: profile.id,
          reasonCategory: 'personal',
        },
        effectiveOrgId,
      );
      setBlockedModalOpen(false);
      await loadScheduleDetails();
    } catch (err) {
      console.error('Failed to create blocked time:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBlock = async () => {
    if (!cancelBlockCandidate) return;
    try {
      setActionLoading(true);
      await cancelBlockedTime(cancelBlockCandidate.id, effectiveOrgId);
      setCancelBlockCandidate(null);
      await loadScheduleDetails();
    } catch (err) {
      console.error('Failed to remove blocked time:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="py-24 flex justify-center">
        <Loader size="lg" message="Loading your schedule..." />
      </div>
    );
  }

  // Calculate day dates for the 7 days of the selected week
  const weekDaysDates = WEEKDAYS.map((wd, index) => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() + index);
    const dateStr = d.toISOString().substring(0, 10);
    return {
      ...wd,
      date: dateStr,
      formattedDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    };
  });

  return (
    <div className="space-y-4 pb-8">
      {/* Top Hero Banner matching StaffSelfProfilePage */}
      <div className="relative overflow-hidden rounded-3xl border border-primary-500/20 bg-gradient-to-r from-primary-500/15 via-primary-500/8 to-transparent p-6 sm:p-8 backdrop-blur-md shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            {profile?.profilePhotoUrl ? (
              <img
                src={profile.profilePhotoUrl}
                alt={profile.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[var(--border-color)] shadow-xs shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white font-extrabold flex items-center justify-center text-xl shadow-xs shrink-0">
                {profile?.fullName ? profile.fullName.slice(0, 2).toUpperCase() : 'ME'}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                  My Schedule & Availability
                </h1>
                <Badge variant="primary" size="small">
                  Staff Portal
                </Badge>
              </div>
              <p className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                <span>{profile?.fullName}</span>
                <span className="text-[var(--text-muted)]">•</span>
                <span className="font-mono text-primary-600 dark:text-primary-400 font-bold">
                  {profile?.employeeCode || '—'}
                </span>
                {profile?.homeBranch?.name && (
                  <>
                    <span className="text-[var(--text-muted)]">•</span>
                    <span className="text-[var(--text-muted)]">{profile.homeBranch.name}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setBlockedModalOpen(true)}
              className="cursor-pointer"
            >
              <ShieldAlert size={14} className="mr-1.5" />
              Block Personal Time
            </Button>

            <Button
              variant="secondary"
              size="small"
              onClick={() => setSwapModalOpen(true)}
              className="cursor-pointer"
            >
              <ArrowLeftRight size={14} className="mr-1.5" />
              Request Shift Swap
            </Button>

            <Button
              variant="primary"
              size="small"
              onClick={() => setPreferenceModalOpen(true)}
              className="cursor-pointer"
            >
              <Plus size={14} className="mr-1.5" />
              Add Preference
            </Button>
          </div>
        </div>
      </div>

      {/* Week Navigator Card */}
      <div className="p-3.5 sm:p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Button variant="secondary" size="small" onClick={handlePrevWeek}>
            <ChevronLeft size={14} />
          </Button>
          <Button variant="secondary" size="small" onClick={handleCurrentWeek}>
            This Week
          </Button>
          <Button variant="secondary" size="small" onClick={handleNextWeek}>
            <ChevronRight size={14} />
          </Button>
        </div>

        <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Calendar size={16} className="text-primary-500" />
          <span>Week starting {currentWeekMonday}</span>
        </div>

        <div className="text-xs text-[var(--text-muted)]">
          Home Branch: <strong className="text-[var(--text-primary)]">{profile?.homeBranch?.name || 'Assigned Branch'}</strong>
        </div>
      </div>

      {/* 7-Day Schedule Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {weekDaysDates.map((day) => {
          const daySchedule = scheduleData?.days?.find((d) => d.dayOfWeek === day.index);
          const isOff = daySchedule ? daySchedule.isDayOff : false;

          // Check if there is an override for this specific date
          const dateOverride = overrides.find(
            (o) => o.overrideDate === day.date && o.approvalStatus === 'approved',
          );

          // Check for blocked time
          const dateBlocks = blockedTimes.filter((b) => b.blockDate === day.date);

          const isEffectiveDayOff = dateOverride
            ? dateOverride.overrideType === 'day_off'
            : isOff;

          return (
            <div
              key={day.index}
              className={`rounded-2xl border p-4 flex flex-col justify-between min-h-[160px] transition-all shadow-xs ${
                isEffectiveDayOff
                  ? 'bg-[var(--bg-input)]/50 border-[var(--border-color)] opacity-80'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] hover:border-primary-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    {day.name.substring(0, 3)}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono">
                    {day.formattedDate}
                  </span>
                </div>

                {/* Status Indicator */}
                {isEffectiveDayOff ? (
                  <div className="py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--bg-input)] text-[var(--text-muted)] border border-[var(--border-color)]">
                      <Coffee size={12} />
                      Day Off
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Clock size={13} />
                      <span>
                        {dateOverride?.startTime || daySchedule?.startTime || '09:00'} –{' '}
                        {dateOverride?.endTime || daySchedule?.endTime || '18:00'}
                      </span>
                    </div>

                    {(daySchedule?.breakStartTime || daySchedule?.shiftTemplate?.breakStartTime) && (
                      <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
                        <Coffee size={11} className="text-amber-500 shrink-0" />
                        <span>
                          Break:{' '}
                          {daySchedule.breakStartTime || daySchedule.shiftTemplate.breakStartTime} –{' '}
                          {daySchedule.breakEndTime || daySchedule.shiftTemplate.breakEndTime}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Override notice */}
                {dateOverride && (
                  <div className="mt-2 p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    Override: {dateOverride.overrideType.replace('_', ' ')}
                  </div>
                )}

                {/* Blocked intervals */}
                {dateBlocks.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {dateBlocks.map((b) => (
                      <div
                        key={b.id}
                        className="p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-600 dark:text-rose-400 flex items-center justify-between"
                      >
                        <span>
                          Block: {b.startTime} - {b.endTime}
                        </span>
                        <button
                          onClick={() => setCancelBlockCandidate(b)}
                          className="hover:text-rose-700 dark:hover:text-rose-200 cursor-pointer"
                          title="Remove Block"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[var(--border-color)] mt-3 text-[10px] text-[var(--text-muted)] text-right font-medium">
                {isEffectiveDayOff ? 'Rest Day' : 'Working Shift'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Preferences & Overrides using Card shared component */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Availability Preferences */}
        <Card
          title="My Availability Preferences"
          subtitle="Communicate preferred hours or unavailable windows to your manager"
          action={
            <Button
              variant="secondary"
              size="small"
              onClick={() => setPreferenceModalOpen(true)}
              className="cursor-pointer"
            >
              <Plus size={13} className="mr-1" />
              Add Preference
            </Button>
          }
        >
          {preferences.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No preferences set. Add preferred times or days to avoid to help your manager plan shifts.
            </div>
          ) : (
            <div className="space-y-2.5">
              {preferences.map((pref) => {
                const dayName =
                  pref.dayOfWeek !== null && pref.dayOfWeek !== undefined
                    ? WEEKDAYS.find((w) => w.index === pref.dayOfWeek)?.name || 'Day'
                    : 'All Days';

                const isAllDay = !pref.startTime && !pref.endTime;
                const timeStr = isAllDay ? 'All Day' : `${pref.startTime} - ${pref.endTime}`;

                return (
                  <div
                    key={pref.id}
                    className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)]">{dayName}</span>
                        <span className="text-[var(--text-muted)]">({timeStr})</span>
                        <Badge
                          variant={
                            pref.preferenceType === 'preferred'
                              ? 'success'
                              : pref.preferenceType === 'avoid'
                              ? 'warning'
                              : 'danger'
                          }
                          size="small"
                        >
                          {pref.preferenceType}
                        </Badge>
                      </div>
                      {pref.note && (
                        <p className="text-[11px] text-[var(--text-secondary)] italic mt-1">
                          "{pref.note}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setDeletePrefCandidate(pref)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 rounded-lg hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
                      title="Delete preference"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Schedule Overrides / Shift Requests */}
        <Card
          title="Upcoming Schedule Adjustments"
          subtitle="Approved and pending shift swaps and date-specific exceptions"
          action={
            <Button
              variant="secondary"
              size="small"
              onClick={() => setSwapModalOpen(true)}
              className="cursor-pointer"
            >
              <ArrowLeftRight size={13} className="mr-1" />
              Request Swap
            </Button>
          }
        >
          {overrides.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No recent or upcoming shift adjustments found.
            </div>
          ) : (
            <div className="space-y-2.5">
              {overrides.slice(0, 5).map((ovr) => (
                <div
                  key={ovr.id}
                  className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-primary)]">
                        {ovr.overrideDate}
                      </span>
                      <span className="text-[var(--text-muted)] uppercase font-mono text-[11px]">
                        {ovr.overrideType.replace('_', ' ')}
                      </span>
                    </div>
                    {ovr.reason && (
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate max-w-xs">
                        {ovr.reason}
                      </p>
                    )}
                  </div>

                  <Badge
                    variant={
                      ovr.approvalStatus === 'approved'
                        ? 'success'
                        : ovr.approvalStatus === 'pending'
                        ? 'warning'
                        : 'danger'
                    }
                    size="small"
                  >
                    {ovr.approvalStatus}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      {preferenceModalOpen && (
        <PreferenceModal
          isOpen={preferenceModalOpen}
          onClose={() => setPreferenceModalOpen(false)}
          onSubmit={handleCreatePref}
          staffId={profile?.id}
          loading={actionLoading}
        />
      )}

      {swapModalOpen && (
        <ShiftSwapModal
          isOpen={swapModalOpen}
          onClose={() => setSwapModalOpen(false)}
          onSubmit={handleCreateSwap}
          staffList={staffList}
          loading={actionLoading}
        />
      )}

      {blockedModalOpen && (
        <BlockedTimeModal
          isOpen={blockedModalOpen}
          onClose={() => setBlockedModalOpen(false)}
          onSubmit={handleCreateBlock}
          staffList={[{ id: profile.id, fullName: profile.fullName || 'Me' }]}
          currentBranchId={profile.homeBranchId}
          loading={actionLoading}
        />
      )}

      {/* Delete Preference Confirmation */}
      {deletePrefCandidate && (
        <ConfirmDialog
          isOpen={!!deletePrefCandidate}
          title="Delete Preference"
          message="Are you sure you want to remove this availability preference?"
          confirmLabel="Delete"
          confirmVariant="danger"
          loading={actionLoading}
          onConfirm={handleDeletePref}
          onClose={() => setDeletePrefCandidate(null)}
        />
      )}

      {/* Cancel Block Confirmation */}
      {cancelBlockCandidate && (
        <ConfirmDialog
          isOpen={!!cancelBlockCandidate}
          title="Remove Blocked Time"
          message="Are you sure you want to remove this personal blocked time interval?"
          confirmLabel="Remove"
          confirmVariant="danger"
          loading={actionLoading}
          onConfirm={handleCancelBlock}
          onClose={() => setCancelBlockCandidate(null)}
        />
      )}
    </div>
  );
}
