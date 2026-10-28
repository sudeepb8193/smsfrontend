import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { fetchBranchDetails, updateBranch } from '../api/branchApi';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../../../hooks/useAuth';
import BranchStatusBadge from '../components/BranchStatusBadge';
import BranchTypeBadge from '../components/BranchTypeBadge';
import BranchDeleteModal from '../components/BranchDeleteModal';
import CopySettingsModal from '../components/CopySettingsModal';
import { usePermission } from '../../../hooks/usePermission';
import { toast } from 'sonner';

export const BranchDetailsPage = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canEdit, canDelete } = usePermission();
  const { currentBranch, setCurrentBranch, refreshBranches } = useBranch();

  const userRole = String(
    user?.roleSlug || user?.role || user?.roleName || '',
  ).toLowerCase().replace(/_/g, '-');
  const isOwner = userRole === 'owner' || userRole === 'super-admin';
  const canEditBranch = isOwner || canEdit('branches', branchId);
  const canDeleteBranch = isOwner || canDelete('branches', branchId);

  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  const isCurrentActive = currentBranch?.id === branch?.id;

  const loadBranch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchBranchDetails(branchId);
      setBranch(res?.data || res);
    } catch (err) {
      console.error('Failed to load branch details:', err);
      setError(err?.message || 'Branch not found or inaccessible');
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    loadBranch();
  }, [loadBranch]);

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdating(true);
      await updateBranch(branch.id, { status: newStatus });
      toast.success(`Branch status updated to ${newStatus.replace('_', ' ')}.`);
      await loadBranch();
      await refreshBranches();
    } catch (err) {
      toast.error(err?.message || 'Failed to update branch status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-[var(--text-muted)]">
        <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary-500" />
        <p className="text-xs font-semibold">Loading branch profile...</p>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 text-center">
        <Building2 className="mx-auto mb-3 h-10 w-10 text-rose-500" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Branch Not Found</h2>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          {error || 'This branch could not be retrieved in your current organization.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/branches')}
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
          onClick={() => navigate('/branches')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Branches</span>
        </button>

        <div className="flex items-center gap-2">
          {!isCurrentActive && branch.status === 'active' && (
            <button
              type="button"
              onClick={() => {
                setCurrentBranch(branch);
                toast.success(`Active context switched to "${branch.name}".`);
              }}
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
                onClick={() => navigate(`/branches/${branch.id}/edit`)}
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
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider rounded-md bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                  {branch.code}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
                {branch.name}
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1.5">
                <MapPin size={14} className="text-primary-500" />
                <span>
                  {branch.branchAddress?.city
                    ? `${branch.branchAddress.addressLine1}, ${branch.branchAddress.city}`
                    : 'Physical operational address pending setup'}
                </span>
              </p>
            </div>

            {/* Quick Status State Transition actions */}
            {isOwner && (
              <div className="flex items-center gap-2 shrink-0">
                {branch.status === 'draft' && (
                  <button
                    type="button"
                    disabled={statusUpdating}
                    onClick={() => handleStatusChange('active')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Play size={14} />
                    <span>Activate Branch</span>
                  </button>
                )}

                {branch.status === 'active' && (
                  <button
                    type="button"
                    disabled={statusUpdating}
                    onClick={() => handleStatusChange('temporarily_closed')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-orange-500/10 hover:bg-orange-500 text-orange-600 dark:text-orange-400 hover:text-white border border-orange-500/20 transition-all disabled:opacity-50"
                  >
                    <Pause size={14} />
                    <span>Pause (Temp Close)</span>
                  </button>
                )}

                {(branch.status === 'temporarily_closed' ||
                  branch.status === 'permanently_closed') && (
                  <button
                    type="button"
                    disabled={statusUpdating}
                    onClick={() => handleStatusChange('active')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Play size={14} />
                    <span>Reopen Branch</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Overview Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Attributes */}
        <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-color)] pb-2 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-primary-500" />
            Branch Attributes
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[var(--text-secondary)] block mb-0.5">Branch Type</span>
              <span className="font-bold text-[var(--text-primary)] capitalize">
                {branch.branchType}
              </span>
            </div>

            <div>
              <span className="text-[var(--text-secondary)] block mb-0.5">Branch Code</span>
              <span className="font-mono font-bold text-primary-500">
                {branch.code}
              </span>
            </div>

            <div>
              <span className="text-[var(--text-secondary)] block mb-0.5">Lifecycle Status</span>
              <BranchStatusBadge status={branch.status} />
            </div>

            <div>
              <span className="text-[var(--text-secondary)] block mb-0.5">Launch Date</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {branch.launchedAt
                  ? new Date(branch.launchedAt).toLocaleDateString(undefined, {
                      dateStyle: 'medium',
                    })
                  : 'Not launched yet'}
              </span>
            </div>

            <div>
              <span className="text-[var(--text-secondary)] block mb-0.5">Created By</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {branch.createdBy?.displayName || branch.createdBy?.email || 'System Administrator'}
              </span>
            </div>
          </div>
        </div>

        {/* Address, Contact & Hours Real Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Address & Location */}
          <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-color)] pb-2 flex items-center gap-1.5">
              <MapPin size={14} className="text-primary-500" />
              Address & Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[var(--text-secondary)] block mb-0.5">Street Address</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {branch.branchAddress?.addressLine1 || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block mb-0.5">Landmark</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {branch.branchAddress?.landmark || 'None'}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block mb-0.5">City & State</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {branch.branchAddress?.city
                    ? `${branch.branchAddress.city}${branch.branchAddress.state ? `, ${branch.branchAddress.state}` : ''}`
                    : 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] block mb-0.5">Postal Code</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {branch.branchAddress?.postalCode || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Operating Schedule Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Contact Details */}
            <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-color)] pb-2 flex items-center gap-1.5">
                <Phone size={14} className="text-primary-500" />
                Contact & Communication
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[var(--text-secondary)] block mb-0.5">Phone Number</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {branch.branchContact?.phoneNumber
                      ? `${branch.branchContact.phoneCountryCode || ''} ${branch.branchContact.phoneNumber}`
                      : 'Not configured'}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)] block mb-0.5">WhatsApp</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {branch.branchContact?.whatsappNumber || 'Same as primary phone'}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)] block mb-0.5">Email</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {branch.branchContact?.email || 'Not configured'}
                  </span>
                </div>
              </div>
            </div>

            {/* Operating Schedule */}
            <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-color)] pb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-primary-500" />
                Operating Schedule
              </h3>
              <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                {branch.businessHours?.length > 0 ? (
                  branch.businessHours.map((bh) => {
                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    const dayName = days[bh.dayOfWeek] || `Day ${bh.dayOfWeek}`;
                    return (
                      <div key={bh.dayOfWeek} className="flex items-center justify-between py-1 border-b border-[var(--border-color)]/50 last:border-0">
                        <span className="text-[var(--text-secondary)]">{dayName}</span>
                        <span className={`font-semibold ${bh.isOpen ? 'text-[var(--text-primary)]' : 'text-rose-500'}`}>
                          {bh.isOpen ? `${bh.openTime || '09:00'} – ${bh.closeTime || '20:00'}` : 'Closed'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[11px] text-[var(--text-muted)]">Standard schedule (09:00 – 20:00).</p>
                )}
              </div>
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
          onSuccess={() => {
            refreshBranches();
            navigate('/branches');
          }}
        />
      )}

      {isCopyModalOpen && (
        <CopySettingsModal
          isOpen={isCopyModalOpen}
          onClose={() => setIsCopyModalOpen(false)}
          targetBranch={branch}
          onSuccess={loadBranch}
        />
      )}
    </div>
  );
};

export default BranchDetailsPage;
