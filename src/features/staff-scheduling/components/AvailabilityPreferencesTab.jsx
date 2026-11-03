import React, { useState } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import EmptyState from '../../../components/shared/EmptyState';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import PreferenceModal from './modals/PreferenceModal';
import {
  Star,
  Clock,
  Slash,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  User,
  Users,
} from 'lucide-react';

const DAY_NAMES = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

// Format 12-hour
function formatTime12(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  const mPart = m > 0 ? `:${m < 10 ? '0' : ''}${m}` : '';
  return `${h}${mPart} ${ampm}`;
}

export default function AvailabilityPreferencesTab({
  preferences = [],
  staffList = [],
  loading = false,
  onCreate,
  onUpdate,
  onDelete,
  canManage = false,
  currentStaffId = null,
}) {
  const [selectedStaffId, setSelectedStaffId] = useState(
    () => currentStaffId || staffList[0]?.id || '',
  );
  const [innerTab, setInnerTab] = useState('my'); // 'my' | 'team'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPref, setEditingPref] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // If selectedStaffId is empty and staffList has items, set it
  const activeStaffId = selectedStaffId || staffList[0]?.id;
  const selectedStaff = staffList.find((s) => s.id === activeStaffId) || staffList[0];

  // Preferences for the active view
  const staffPreferences = preferences.filter((pref) => {
    if (innerTab === 'team') return true;
    return pref.staffId === activeStaffId;
  });

  const handleOpenCreate = () => {
    setEditingPref(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (pref) => {
    setEditingPref(pref);
    setModalOpen(true);
  };

  const handleSubmitModal = async (payload) => {
    try {
      setActionLoading(true);
      if (editingPref) {
        await onUpdate(editingPref.id, payload);
      } else {
        await onCreate({
          ...payload,
          staffId: activeStaffId || payload.staffId,
        });
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save preference:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      setActionLoading(true);
      await onDelete(deleteCandidate.id);
      setDeleteCandidate(null);
    } catch (err) {
      console.error('Failed to delete preference:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to format days + time
  const formatTimeSlot = (pref) => {
    let dayStr = 'General (All Days)';
    if (pref.dayOfWeek !== null && pref.dayOfWeek !== undefined) {
      dayStr = DAY_NAMES[pref.dayOfWeek] || 'Day';
    }

    if (pref.startTime && pref.endTime) {
      return `${dayStr} · ${formatTime12(pref.startTime)} – ${formatTime12(pref.endTime)}`;
    }
    return `${dayStr} · Full Day`;
  };

  return (
    <div className="space-y-4">
      {/* 2-Column Master-Detail Layout matching Image Panel 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Staff Members List (approx 4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs p-3">
          <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider px-2 py-1.5 mb-1">
            Team Members
          </div>

          <div className="space-y-1">
            {staffList.map((staff) => {
              const isSelected = staff.id === activeStaffId;
              const initials = staff.fullName
                ? staff.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                : 'ST';

              return (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => setSelectedStaffId(staff.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-500/30 font-bold shadow-2xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] border border-transparent'
                  }`}
                >
                  {staff.profilePhotoUrl ? (
                    <img
                      src={staff.profilePhotoUrl}
                      alt={staff.fullName}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-[var(--border-color)]"
                    />
                  ) : (
                    <div
                      className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : 'bg-primary-500/15 text-primary-600 dark:text-primary-400'
                      }`}
                    >
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {staff.fullName}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate">
                      {staff.primaryDesignation || 'Stylist'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Preferences Detail Panel matching Image Panel 4 (approx 8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs p-5 flex flex-col justify-between">
          <div>
            {/* Header with Inner Tab Switch & Selected Staff Label */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border-color)] gap-3 mb-5">
              <div className="flex items-center gap-1 bg-[var(--bg-input)] rounded-xl p-1 border border-[var(--border-color)] text-xs">
                <button
                  type="button"
                  onClick={() => setInnerTab('my')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    innerTab === 'my'
                      ? 'bg-primary-500 text-white shadow-2xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  My Preferences
                </button>
                <button
                  type="button"
                  onClick={() => setInnerTab('team')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    innerTab === 'team'
                      ? 'bg-primary-500 text-white shadow-2xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Team View
                </button>
              </div>

              {selectedStaff && (
                <div className="text-xs text-[var(--text-muted)]">
                  Preferences for <span className="font-bold text-[var(--text-primary)]">{selectedStaff.fullName}</span>
                </div>
              )}
            </div>

            {/* List of Preferences */}
            {staffPreferences.length > 0 ? (
              <div className="space-y-4">
                {staffPreferences.map((pref) => {
                  const type = pref.preferenceType || 'preferred';
                  const isPreferred = type === 'preferred';
                  const isAvoid = type === 'avoid';
                  const isUnavailable = type === 'unavailable';

                  return (
                    <div
                      key={pref.id}
                      className="p-4 rounded-2xl bg-[var(--bg-input)]/40 border border-[var(--border-color)] flex items-start justify-between gap-4 transition-all hover:border-[var(--border-color-hover,var(--border-color))]"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Circular Icon matching Image Panel 4 */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isPreferred
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : isAvoid
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isPreferred && <Star size={17} className="fill-emerald-500 text-emerald-500" />}
                          {isAvoid && <Clock size={17} />}
                          {isUnavailable && <Slash size={17} />}
                        </div>

                        <div>
                          {/* Title */}
                          <div className="text-xs font-bold text-[var(--text-primary)] capitalize">
                            {type}
                          </div>

                          {/* Time window */}
                          <div className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
                            {formatTimeSlot(pref)}
                          </div>

                          {/* Note in quotes */}
                          {pref.note && (
                            <div className="text-xs text-[var(--text-muted)] italic mt-1">
                              &ldquo;{pref.note}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Edit & Delete Buttons on Right */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="secondary"
                          size="small"
                          onClick={() => handleOpenEdit(pref)}
                          className="cursor-pointer text-xs"
                        >
                          Edit
                        </Button>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(pref)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 rounded-lg hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No Availability Preferences Set"
                description={`No preferences recorded for ${selectedStaff?.fullName || 'this employee'}. Add preferred working hours or times to avoid.`}
                actionLabel="Add Preference"
                onAction={handleOpenCreate}
              />
            )}
          </div>
        </div>
      </div>

      {/* Preference Edit Modal */}
      {modalOpen && (
        <PreferenceModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmitModal}
          initialData={editingPref}
          targetStaffId={activeStaffId}
          staffName={selectedStaff?.fullName}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation */}
      {deleteCandidate && (
        <ConfirmDialog
          isOpen={!!deleteCandidate}
          title="Remove Preference"
          message="Are you sure you want to delete this availability preference? This advisory record will be removed from future scheduling suggestions."
          confirmLabel="Remove"
          confirmVariant="danger"
          loading={actionLoading}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteCandidate(null)}
        />
      )}
    </div>
  );
}
