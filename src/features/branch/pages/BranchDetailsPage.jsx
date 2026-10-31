import React from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Edit,
  Globe2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Play,
  Pause,
  Trash2,
  User,
  Users,
  ShieldCheck,
  Building,
} from 'lucide-react';
import BranchStatusBadge from '../components/BranchStatusBadge';
import BranchTypeBadge from '../components/BranchTypeBadge';
import BranchDeleteModal from '../components/BranchDeleteModal';
import CopySettingsModal from '../components/CopySettingsModal';
import UnauthorizedAccess from '../../../components/shared/UnauthorizedAccess';
import { useBranchDetails } from '../hooks/useBranch';

export const BranchDetailsPage = () => {
  const {
    branch,
    loading,
    error,
    statusUpdating,
    isCurrentActive,
    canViewBranch,
    canEditBranch,
    canDeleteBranch,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isCopyModalOpen,
    setIsCopyModalOpen,
    handleStatusChange,
    handleSetActiveContext,
    handleBackToBranches,
    handleNavigateToEdit,
    handleDeleteSuccess,
    handleCopySuccess,
  } = useBranchDetails();

  if (!canViewBranch) {
    return (
      <UnauthorizedAccess
        title="Access Restricted"
        message="You do not have permission to view salon branch details in this organization."
        requiredPermission="branches.view"
        resourceName="Branch Details"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-[var(--text-muted)]">
        <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary-500" />
        <p className="text-xs font-semibold">Loading branch profile...</p>
      </div>
    );
  }

  if (error || !branch) {
    const isPermissionError = error && (
      String(error).toLowerCase().includes('permission') ||
      String(error).toLowerCase().includes('forbidden') ||
      String(error).toLowerCase().includes('403')
    );

    if (isPermissionError) {
      return (
        <UnauthorizedAccess
          title="Access Restricted"
          message={error}
          requiredPermission="branches.view"
          resourceName="Branch Details"
        />
      );
    }
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 text-center">
        <Building2 className="mx-auto mb-3 h-10 w-10 text-rose-500" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Branch Not Found</h2>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          {error || 'This branch could not be retrieved in your current organization.'}
        </p>
        <button
          type="button"
          onClick={handleBackToBranches}
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Branches
        </button>
      </div>
    );
  }

  const primaryManager = branch.branchManagerAssignments?.find(
    (a) => a.assignmentType === 'primary',
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBackToBranches}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Branches</span>
        </button>

        <div className="flex items-center gap-2">
          {!isCurrentActive && branch.status === 'active' && (
            <button
              type="button"
              onClick={handleSetActiveContext}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary-500/10 hover:bg-primary-500 text-primary-600 dark:text-primary-400 hover:text-white border border-primary-500/20 transition-all"
            >
              Set as Active Context
            </button>
          )}

          {canEditBranch && (
            <>
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border-color)] transition-colors inline-flex items-center gap-1.5"
              >
                <Copy size={14} />
                <span>Copy Settings</span>
              </button>

              <button
                type="button"
                onClick={handleNavigateToEdit}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-primary-500 hover:bg-primary-600 text-white transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <Edit size={14} />
                <span>Edit Profile</span>
              </button>
            </>
          )}

          {canDeleteBranch && (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2 text-xs font-semibold rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 transition-colors"
              title="Delete or Close Branch"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-sm">
        <div className="relative h-48 md:h-64 w-full bg-gradient-to-br from-primary-950 via-purple-950 to-slate-900 overflow-hidden">
          {branch.coverImageUrl ? (
            <img
              src={branch.coverImageUrl}
              alt={branch.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-primary-400/40">
              <Building size={64} strokeWidth={1.5} />
              <span className="text-xs font-bold tracking-widest uppercase mt-2 text-primary-400/60">
                {branch.branchType} Salon Facility
              </span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <BranchStatusBadge status={branch.status} size="md" />
            <BranchTypeBadge type={branch.branchType} size="md" />
          </div>

          {isCurrentActive && (
            <div className="absolute top-4 right-4 bg-primary-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>Current Session Context</span>
            </div>
          )}
        </div>

        {/* Hero Meta Info */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-primary-500/10 text-primary-500 border border-primary-500/20">
                  {branch.code}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  Created {new Date(branch.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                {branch.name}
              </h1>
              {branch.branchAddress?.city && (
                <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary-500" />
                  <span>
                    {branch.branchAddress.addressLine1 ? `${branch.branchAddress.addressLine1}, ` : ''}
                    {branch.branchAddress.city}
                    {branch.branchAddress.state ? `, ${branch.branchAddress.state}` : ''}
                  </span>
                </p>
              )}
            </div>

            {/* Quick Actions (Status toggling) */}
            {canEditBranch && (
              <div className="flex items-center gap-2 bg-[var(--bg-input)] p-1.5 rounded-2xl border border-[var(--border-color)]">
                {branch.status === 'active' ? (
                  <button
                    type="button"
                    disabled={statusUpdating}
                    onClick={() => handleStatusChange('temporarily_closed')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <Pause size={14} />
                    <span>Temporarily Close</span>
                  </button>
                ) : branch.status === 'temporarily_closed' || branch.status === 'draft' ? (
                  <button
                    type="button"
                    disabled={statusUpdating}
                    onClick={() => handleStatusChange('active')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <Play size={14} />
                    <span>Activate Branch</span>
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Details Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Primary Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Section: Contact & Location */}
          <div className="p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <MapPin className="text-primary-500" size={18} />
              <span>Location & Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] block mb-1">Street Address</span>
                <p className="font-semibold text-[var(--text-primary)]">
                  {branch.branchAddress?.addressLine1 || 'Not configured'}
                </p>
                {branch.branchAddress?.addressLine2 && (
                  <p className="text-[var(--text-secondary)] mt-0.5">{branch.branchAddress.addressLine2}</p>
                )}
                {branch.branchAddress?.landmark && (
                  <p className="text-[var(--text-muted)] mt-1 italic">
                    Landmark: {branch.branchAddress.landmark}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] block mb-1">City & Postal Code</span>
                <p className="font-semibold text-[var(--text-primary)]">
                  {branch.branchAddress?.city || 'City pending'}
                  {branch.branchAddress?.postalCode ? ` - ${branch.branchAddress.postalCode}` : ''}
                </p>
                <p className="text-[var(--text-secondary)] mt-0.5">
                  {branch.branchAddress?.state || ''} ({branch.branchAddress?.countryCode || 'IN'})
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] block mb-1">Front Desk Phone</span>
                <p className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Phone size={13} className="text-emerald-500" />
                  <span>
                    {branch.branchContact?.phoneCountryCode || '+91'} {branch.branchContact?.phoneNumber || 'Not provided'}
                  </span>
                </p>
                {branch.branchContact?.whatsappNumber && (
                  <p className="text-[var(--text-muted)] mt-1">
                    WhatsApp: {branch.branchContact.whatsappNumber}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] block mb-1">Public Branch Email</span>
                <p className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5 truncate">
                  <Mail size={13} className="text-primary-500 shrink-0" />
                  <span className="truncate">{branch.branchContact?.email || 'Not configured'}</span>
                </p>
              </div>
            </div>

            {branch.branchAddress?.mapsUrl && (
              <div className="pt-2">
                <a
                  href={branch.branchAddress.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:underline"
                >
                  <Globe2 size={14} />
                  <span>View location on Google Maps</span>
                </a>
              </div>
            )}
          </div>

          {/* Section: Business Operating Hours */}
          <div className="p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="text-primary-500" size={18} />
              <span>Weekly Business Hours</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                (dayName, idx) => {
                  const dayNum = (idx + 1) % 7;
                  const schedule = branch.businessHours?.find((h) => h.dayOfWeek === dayNum);
                  const isOpen = schedule?.isOpen ?? false;

                  return (
                    <div
                      key={dayName}
                      className={`p-3 rounded-2xl border flex items-center justify-between ${
                        isOpen
                          ? 'border-[var(--border-color)] bg-[var(--bg-input)]/40'
                          : 'border-transparent bg-white/5 opacity-60'
                      }`}
                    >
                      <span className="font-semibold text-[var(--text-primary)]">{dayName}</span>
                      {isOpen ? (
                        <span className="font-mono text-[var(--text-secondary)]">
                          {schedule.openTime || '09:00'} - {schedule.closeTime || '19:00'}
                        </span>
                      ) : (
                        <span className="text-rose-400 font-medium">Closed</span>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Manager, Staff, Scope Card */}
        <div className="space-y-6">
          {/* Branch Manager Card */}
          <div className="p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <User className="text-purple-500" size={18} />
              <span>Primary Branch Manager</span>
            </h3>

            {primaryManager?.user ? (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 font-bold flex items-center justify-center shrink-0">
                  {primaryManager.user.displayName?.[0] || 'M'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {primaryManager.user.displayName}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">
                    {primaryManager.user.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[var(--bg-input)]/50 border border-dashed border-[var(--border-color)] text-center">
                <p className="text-xs text-[var(--text-muted)]">No primary manager assigned</p>
              </div>
            )}
          </div>

          {/* Operational Metrics */}
          <div className="p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Users className="text-emerald-500" size={18} />
              <span>Staff Deployment</span>
            </h3>

            <div className="flex items-baseline justify-between p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              <span className="text-xs text-[var(--text-secondary)]">Assigned Staff Members</span>
              <span className="text-lg font-bold text-[var(--text-primary)] font-mono">
                {branch._count?.staff ?? 0}
              </span>
            </div>

            <div className="flex items-baseline justify-between p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)]">
              <span className="text-xs text-[var(--text-secondary)]">Launch Milestone</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {branch.launchedAt
                  ? new Date(branch.launchedAt).toLocaleDateString()
                  : 'Pending Launch'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isDeleteModalOpen && (
        <BranchDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          branch={branch}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {isCopyModalOpen && (
        <CopySettingsModal
          isOpen={isCopyModalOpen}
          onClose={() => setIsCopyModalOpen(false)}
          targetBranch={branch}
          onSuccess={handleCopySuccess}
        />
      )}
    </div>
  );
};

export default BranchDetailsPage;
