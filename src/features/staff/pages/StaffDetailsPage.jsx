import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader/PageHeader';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import UnderlineTabs from '../../../components/shared/UnderlineTabs';
import Loader from '../../../components/shared/Loader';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import { toast } from '../../../components/shared/Toast';
import { useAuth } from '../../../hooks/useAuth';
import { usePermission } from '../../../hooks/usePermission';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import { useBranch } from '../../branch/hooks/useBranch';
import StaffStatusBadge from '../components/StaffStatusBadge';
import StatusChangeModal from '../components/modals/StatusChangeModal';
import LinkUserModal from '../components/modals/LinkUserModal';

// Tab Components
import StaffOverviewTab from '../components/tabs/StaffOverviewTab';
import StaffContactTab from '../components/tabs/StaffContactTab';
import StaffEmploymentTab from '../components/tabs/StaffEmploymentTab';
import StaffSkillsTab from '../components/tabs/StaffSkillsTab';
import StaffDocumentsTab from '../components/tabs/StaffDocumentsTab';
import StaffBranchesTab from '../components/tabs/StaffBranchesTab';

// API services
import {
  fetchStaffById,
  updateStaff,
  updateStaffStatus,
  linkStaffUser,
  unlinkStaffUser,
  deleteStaff,
  upsertStaffContacts,
  revealNationalId,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  createEmploymentHistory,
  createQualification,
  deleteQualification,
  createStaffDocument,
  deleteStaffDocument,
  addSecondaryBranch,
  endSecondaryBranch,
  transferHomeBranch,
} from '../api/staffApi';

import {
  ArrowLeft,
  Building2,
  Calendar,
  Briefcase,
  User,
  Link,
  Unlink,
  Trash2,
  Edit2,
  AlertTriangle,
  Scissors,
} from 'lucide-react';

export function StaffDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const { user } = useAuth();
  const { can } = usePermission();
  const { selectedOrganisation, isSuperAdmin } = useOrganisation();
  const { branches } = useBranch();

  const effectiveOrgId = isSuperAdmin ? selectedOrganisation?.id : user?.organizationId;

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Confirmation States
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [unlinkingUser, setUnlinkingUser] = useState(false);
  const [revealingNationalId, setRevealingNationalId] = useState(false);

  const loadStaff = useCallback(async () => {
    if (!id || !effectiveOrgId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStaffById(id, effectiveOrgId);
      setStaff(data);
    } catch (err) {
      console.error('Failed to load employee details:', err);
      setError(err?.message || 'Failed to load employee profile');
    } finally {
      setLoading(false);
    }
  }, [id, effectiveOrgId]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // Status Change
  const handleStatusChange = async (newStatus, reason) => {
    try {
      setActionLoading(true);
      await updateStaffStatus(id, newStatus, reason, effectiveOrgId);
      toast.success(`Employee status updated to ${String(newStatus).replace(/_/g, ' ')}.`);
      await loadStaff();
      setIsStatusModalOpen(false);
    } catch (err) {
      console.error('Failed to change status:', err);
      toast.error(err?.message || 'Failed to update employee status');
    } finally {
      setActionLoading(false);
    }
  };

  // Link User Account
  const handleLinkUser = async (targetUserId) => {
    try {
      setActionLoading(true);
      await linkStaffUser(id, targetUserId, effectiveOrgId);
      toast.success('User account linked to employee successfully.');
      await loadStaff();
      setIsLinkModalOpen(false);
    } catch (err) {
      console.error('Failed to link user account:', err);
      toast.error(err?.message || 'Failed to link user account');
    } finally {
      setActionLoading(false);
    }
  };

  // Unlink User Account
  const handleUnlinkUser = async () => {
    try {
      setUnlinkingUser(true);
      await unlinkStaffUser(id, effectiveOrgId);
      toast.success('User account unlinked from employee.');
      await loadStaff();
    } catch (err) {
      console.error('Failed to unlink user account:', err);
      toast.error(err?.message || 'Failed to unlink user account');
    } finally {
      setUnlinkingUser(false);
    }
  };

  // Delete / Terminate
  const handleDeleteStaff = async () => {
    try {
      setActionLoading(true);
      await deleteStaff(id, effectiveOrgId);
      toast.success(`Employee "${staff?.fullName || 'Profile'}" terminated successfully.`);
      navigate('/staff');
    } catch (err) {
      console.error('Failed to delete staff:', err);
      toast.error(err?.message || 'Failed to terminate employee');
    } finally {
      setActionLoading(false);
    }
  };

  // Contact Updates
  const handleUpdateContacts = async (contactData) => {
    try {
      setActionLoading(true);
      await upsertStaffContacts(id, contactData, effectiveOrgId);
      toast.success('Contact details updated successfully.');
      await loadStaff();
    } catch (err) {
      console.error('Failed to update contacts:', err);
      toast.error(err?.message || 'Failed to update contact details');
    } finally {
      setActionLoading(false);
    }
  };

  // Reveal National ID
  const handleRevealNationalId = async () => {
    try {
      setRevealingNationalId(true);
      const res = await revealNationalId(id, effectiveOrgId);
      return res;
    } catch (err) {
      console.error('Failed to reveal national ID:', err);
      toast.error(err?.message || 'Failed to reveal National ID');
      return null;
    } finally {
      setRevealingNationalId(false);
    }
  };

  // Emergency Contacts
  const handleCreateEmergencyContact = async (data) => {
    try {
      await createEmergencyContact(id, data, effectiveOrgId);
      toast.success('Emergency contact added.');
      await loadStaff();
    } catch (err) {
      toast.error(err?.message || 'Failed to add emergency contact');
      throw err;
    }
  };

  const handleUpdateEmergencyContact = async (contactId, data) => {
    try {
      await updateEmergencyContact(id, contactId, data, effectiveOrgId);
      toast.success('Emergency contact updated.');
      await loadStaff();
    } catch (err) {
      toast.error(err?.message || 'Failed to update emergency contact');
      throw err;
    }
  };

  const handleDeleteEmergencyContact = async (contactId) => {
    try {
      await deleteEmergencyContact(id, contactId, effectiveOrgId);
      toast.success('Emergency contact removed.');
      await loadStaff();
    } catch (err) {
      toast.error(err?.message || 'Failed to remove emergency contact');
      throw err;
    }
  };

  // Employment History
  const handleRecordEmploymentChange = async (data) => {
    try {
      await createEmploymentHistory(id, data, effectiveOrgId);
      toast.success('Employment change recorded.');
      await loadStaff();
    } catch (err) {
      toast.error(err?.message || 'Failed to record employment change');
      throw err;
    }
  };

  // Skills & Qualifications
  const handleAddQualification = async (data) => {
    try {
      await createQualification(id, data, effectiveOrgId);
      toast.success(
        data?.recordType === 'skill_tag' ? 'Skill tag added.' : 'Qualification added.',
      );
      await loadStaff();
    } catch (err) {
      toast.error(err?.message || 'Failed to save qualification');
      throw err;
    }
  };

  const handleRemoveQualification = async (qualId) => {
    try {
      await deleteQualification(id, qualId, effectiveOrgId);
      toast.success('Record removed successfully.');
      await loadStaff();
    } catch (err) {
      toast.error(err?.message || 'Failed to remove record');
      throw err;
    }
  };

  // Documents
  const handleUploadDocument = async (data) => {
    try {
      await createStaffDocument(id, data, effectiveOrgId);
      toast.success('Document uploaded successfully.');
      await loadStaff();
    } catch (err) {
      toast.error(err?.message || 'Failed to upload document');
      throw err;
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await deleteStaffDocument(id, docId, effectiveOrgId);
      toast.success('Document deleted.');
      await loadStaff();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete document');
      throw err;
    }
  };

  // Branch Assignments
  const handleAddSecondaryBranch = async (data) => {
    try {
      await addSecondaryBranch(id, data, effectiveOrgId);
      toast.success('Secondary branch assigned.');
      await loadStaff();
    } catch (err) {
      toast.error(err?.message || 'Failed to assign secondary branch');
      throw err;
    }
  };

  const handleEndSecondaryBranch = async (assignmentId) => {
    try {
      await endSecondaryBranch(id, assignmentId, effectiveOrgId);
      toast.success('Secondary branch assignment ended.');
      await loadStaff();
    } catch (err) {
      toast.error(err?.message || 'Failed to end branch assignment');
      throw err;
    }
  };

  const handleTransferHomeBranch = async (data) => {
    try {
      await transferHomeBranch(id, data, effectiveOrgId);
      toast.success('Home branch transfer scheduled/completed.');
      await loadStaff();
    } catch (err) {
      toast.error(err?.message || 'Failed to transfer home branch');
      throw err;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'contact', label: 'Contact & Emergency' },
    { id: 'employment', label: 'Employment & Timeline' },
    { id: 'skills', label: 'Skills & Qualifications' },
    { id: 'documents', label: 'Documents & Contracts' },
    { id: 'branches', label: 'Branches' },
  ];

  if (loading) {
    return <Loader type="detail" text="Loading employee profile..." />;
  }

  if (error || !staff) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-600 font-semibold">{error || 'Employee not found'}</p>
        <Button variant="outline" onClick={() => navigate('/staff')}>
          Back to Staff Directory
        </Button>
      </div>
    );
  }

  const current = staff.currentEmployment || {};

  const canManageStatus =
    can('staff.manage', staff?.homeBranchId) ||
    can('staff.manage_status', staff?.homeBranchId) ||
    can('staff.update', staff?.homeBranchId);
  const canLinkAccount =
    can('staff.manage', staff?.homeBranchId) ||
    can('staff.link_user', staff?.homeBranchId);
  const canTerminate =
    can('staff.manage', staff?.homeBranchId) ||
    can('staff.delete', staff?.homeBranchId) ||
    can('staff.terminate', staff?.homeBranchId);

  return (
    <div className="w-full space-y-4 pb-8">
      {/* Hero Header Card */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary-500 shadow-sm shrink-0 bg-[var(--bg-main)] flex items-center justify-center"
              style={{
                width: '80px',
                height: '80px',
                minWidth: '80px',
                maxWidth: '80px',
                minHeight: '80px',
                maxHeight: '80px',
                flexShrink: 0,
              }}
            >
              {staff.profilePhotoUrl ? (
                <img
                  src={staff.profilePhotoUrl}
                  alt={staff.fullName}
                  className="w-full h-full object-cover block"
                  style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : (
                <div className="w-full h-full bg-primary-500/15 text-primary-600 dark:text-primary-400 font-bold text-2xl flex items-center justify-center">
                  {staff.fullName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  {staff.fullName}
                </h1>
                <StaffStatusBadge status={staff.employmentStatus} />
                {staff.hasMissingEmergencyContact && (
                  <Badge variant="warning" size="xs">
                    <AlertTriangle size={12} className="mr-1 inline" />
                    No Emergency Contact
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] mt-1.5">
                <span className="font-mono font-semibold text-[var(--text-secondary)]">
                  {staff.employeeCode}
                </span>
                <span>•</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {current.designation || 'Staff Member'}
                </span>
                <span>•</span>
                <span className="text-[var(--text-secondary)]">
                  {current.department || 'Operations'}
                </span>
                <span>•</span>
                <span className="inline-flex items-center">
                  <Building2 size={12} className="mr-1 text-[var(--text-muted)]" />
                  {staff.homeBranch?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate(`/staff/${staff.id}/assignments`)}
            >
              <Scissors size={14} className="mr-1.5" />
              Services & Designations
            </Button>

            {canManageStatus && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsStatusModalOpen(true)}
              >
                Change Status
              </Button>
            )}

            {canLinkAccount && (!staff.user ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsLinkModalOpen(true)}
              >
                <Link size={14} className="mr-1.5" />
                Link Account
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="text-rose-600 border-rose-300 hover:bg-rose-50"
                onClick={handleUnlinkUser}
                loading={unlinkingUser}
              >
                <Unlink size={14} className="mr-1.5" />
                Unlink Account
              </Button>
            ))}

            {canTerminate && (
              <Button
                size="sm"
                variant="outline"
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
                onClick={() => setIsDeleteConfirmOpen(true)}
                title="Terminate / Delete Employee"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <Card padding="none">
        <div className="px-6 pt-3">
          <UnderlineTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={handleTabChange}
          />
        </div>
      </Card>

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && (
          <StaffOverviewTab
            staff={staff}
            onOpenLinkModal={() => setIsLinkModalOpen(true)}
            onUnlinkUser={handleUnlinkUser}
            onTabChange={handleTabChange}
            unlinking={unlinkingUser}
          />
        )}

        {activeTab === 'contact' && (
          <StaffContactTab
            staff={staff}
            contacts={staff.contacts}
            emergencyContacts={staff.emergencyContacts}
            onUpdateContacts={handleUpdateContacts}
            onRevealNationalId={handleRevealNationalId}
            onCreateEmergencyContact={handleCreateEmergencyContact}
            onUpdateEmergencyContact={handleUpdateEmergencyContact}
            onDeleteEmergencyContact={handleDeleteEmergencyContact}
            savingContacts={actionLoading}
            revealingNationalId={revealingNationalId}
          />
        )}

        {activeTab === 'employment' && (
          <StaffEmploymentTab
            staff={staff}
            history={staff.employmentHistory}
            onRecordChange={handleRecordEmploymentChange}
            loading={actionLoading}
          />
        )}

        {activeTab === 'skills' && (
          <StaffSkillsTab
            skills={staff.qualifications?.filter((q) => q.recordType === 'skill_tag')}
            qualifications={staff.qualifications?.filter(
              (q) => q.recordType === 'formal_qualification',
            )}
            onAddSkill={handleAddQualification}
            onRemoveSkill={handleRemoveQualification}
            onAddQualification={handleAddQualification}
            onRemoveQualification={handleRemoveQualification}
            loading={actionLoading}
          />
        )}

        {activeTab === 'documents' && (
          <StaffDocumentsTab
            documents={staff.documents}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
            loading={actionLoading}
          />
        )}

        {activeTab === 'branches' && (
          <StaffBranchesTab
            staff={staff}
            branchAssignments={{
              homeBranch: staff.homeBranch,
              homeAssignments: staff.branchAssignments?.filter((b) => b.assignmentType === 'home'),
              secondaryAssignments: staff.branchAssignments?.filter(
                (b) => b.assignmentType === 'secondary',
              ),
              futureTransfers: staff.branchAssignments?.filter(
                (b) => b.assignmentType === 'home' && new Date(b.effectiveFrom) > new Date(),
              ),
            }}
            branches={branches}
            onAddSecondaryBranch={handleAddSecondaryBranch}
            onEndSecondaryBranch={handleEndSecondaryBranch}
            onTransferHomeBranch={handleTransferHomeBranch}
            loading={actionLoading}
          />
        )}
      </div>

      {/* Status Modal */}
      {isStatusModalOpen && (
        <StatusChangeModal
          isOpen={true}
          onClose={() => setIsStatusModalOpen(false)}
          staff={staff}
          onConfirm={handleStatusChange}
          loading={actionLoading}
        />
      )}

      {/* Link Account Modal */}
      {isLinkModalOpen && (
        <LinkUserModal
          isOpen={true}
          onClose={() => setIsLinkModalOpen(false)}
          staff={staff}
          onLink={handleLinkUser}
          loading={actionLoading}
        />
      )}

      {/* Delete / Terminate Confirm */}
      {isDeleteConfirmOpen && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleDeleteStaff}
          title={`Terminate Employee – ${staff.fullName}`}
          message={`Are you sure you want to terminate ${staff.fullName} (${staff.employeeCode})? If historical transactions exist, the employee profile will be archived and marked as Terminated without deleting historical data.`}
          confirmText="Confirm Termination"
          cancelText="Cancel"
          variant="danger"
          loading={actionLoading}
        />
      )}
    </div>
  );
}

export default StaffDetailsPage;

