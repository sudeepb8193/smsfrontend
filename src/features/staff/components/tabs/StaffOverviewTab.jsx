import React from 'react';
import Card from '../../../../components/shared/Card';
import Button from '../../../../components/shared/Button';
import Badge from '../../../../components/shared/Badge';
import { usePermission } from '../../../../hooks/usePermission';
import {
  User,
  Building2,
  Briefcase,
  AlertTriangle,
  PhoneCall,
  Award,
  FileText,
  Link,
  Unlink,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export function StaffOverviewTab({
  staff,
  onOpenLinkModal,
  onUnlinkUser,
  onTabChange,
  unlinking,
}) {
  const { can } = usePermission();
  const current = staff.currentEmployment || {};
  const contacts = staff.contacts || {};
  const primaryEmergency = staff.emergencyContacts?.find((c) => c.priority === 'primary') || staff.emergencyContacts?.[0];

  return (
    <div className="space-y-6">
      {/* Warning Banners */}
      {staff.hasMissingEmergencyContact && (
        <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Missing Emergency Contact
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                This active employee has no designated emergency contact on record.
              </p>
            </div>
          </div>
          {(can('staff_emergency.create', staff.homeBranchId) || can('staff_emergency.manage', staff.homeBranchId)) && (
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200"
              onClick={() => onTabChange('contact')}
            >
              Add Contact
            </Button>
          )}
        </div>
      )}

      {staff.expiringQualificationsCount > 0 && (
        <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="text-rose-500 shrink-0" size={20} />
            <div>
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
                Qualifications Expiring Soon or Expired
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-400">
                {staff.expiringQualificationsCount} certificate(s) require renewal attention.
              </p>
            </div>
          </div>
          {can('staff_qualification.view', staff.homeBranchId) && (
            <Button
              size="sm"
              variant="outline"
              className="border-rose-300 text-rose-800 hover:bg-rose-100 dark:border-rose-700 dark:text-rose-200"
              onClick={() => onTabChange('skills')}
            >
              View Certificates
            </Button>
          )}
        </div>
      )}

      {/* Grid of Key Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Employment Summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center">
                <Briefcase size={18} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Current Position
              </h3>
            </div>
            <button
              onClick={() => onTabChange('employment')}
              className="text-xs text-primary-500 hover:underline"
            >
              Timeline
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Designation:</span>
              <strong className="text-[var(--text-primary)]">
                {current.designation || 'Staff Member'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Department:</span>
              <span className="text-[var(--text-secondary)]">
                {current.department || 'Operations'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Employment Type:</span>
              <span className="capitalize text-[var(--text-secondary)]">
                {(current.employmentType || 'full_time').replace('_', '-')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Joined Date:</span>
              <span className="text-[var(--text-secondary)]">
                {current.joiningDate
                  ? new Date(current.joiningDate).toLocaleDateString()
                  : new Date(staff.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Branch Assignments */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Branch Scope
              </h3>
            </div>
            <button
              onClick={() => onTabChange('branches')}
              className="text-xs text-primary-500 hover:underline"
            >
              Manage
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-muted)]">Home Branch:</span>
              <Badge variant="primary">{staff.homeBranch?.name || 'Primary'}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Branch Code:</span>
              <span className="font-mono text-[var(--text-secondary)]">
                {staff.homeBranch?.code}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Secondary Branches:</span>
              <span className="text-[var(--text-secondary)]">
                {staff.branchAssignments?.filter((b) => b.assignmentType === 'secondary' && !b.effectiveTo).length || 0} active
              </span>
            </div>
          </div>
        </Card>

        {/* Linked Login Account */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <User size={18} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Login Account
              </h3>
            </div>
          </div>
          {staff.user ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span className="font-medium text-[var(--text-primary)] truncate">
                  {staff.user.displayName || staff.user.email}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] truncate">{staff.user.email}</p>
              <div className="flex items-center justify-between pt-1">
                <Badge variant={staff.user.status === 'active' ? 'success' : 'neutral'}>
                  {staff.user.status}
                </Badge>
                {(can('staff.manage', staff.homeBranchId) || can('staff.link_user', staff.homeBranchId)) && (
                  <Button
                    size="xs"
                    variant="outline"
                    className="text-rose-600 border-rose-300 hover:bg-rose-50"
                    onClick={onUnlinkUser}
                    loading={unlinking}
                  >
                    <Unlink size={12} className="mr-1" />
                    Unlink
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <p className="text-xs text-[var(--text-muted)]">
                This employee has an independent HR record without a linked system login.
              </p>
              {(can('staff.manage', staff.homeBranchId) || can('staff.link_user', staff.homeBranchId)) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={onOpenLinkModal}
                >
                  <Link size={14} className="mr-1.5" />
                  Link Login Account
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Emergency Contact Summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <PhoneCall size={18} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Primary Emergency Contact
              </h3>
            </div>
            <button
              onClick={() => onTabChange('contact')}
              className="text-xs text-primary-500 hover:underline"
            >
              All Contacts
            </button>
          </div>
          {primaryEmergency ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Name:</span>
                <strong className="text-[var(--text-primary)]">
                  {primaryEmergency.contactName}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Relationship:</span>
                <span className="text-[var(--text-secondary)]">
                  {primaryEmergency.relationship || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Phone:</span>
                <a
                  href={`tel:${primaryEmergency.phoneNumber}`}
                  className="text-primary-500 hover:underline"
                >
                  {primaryEmergency.phoneNumber}
                </a>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">No emergency contacts registered.</p>
          )}
        </Card>

        {/* Skills & Certifications Summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Award size={18} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Skills & Qualifications
              </h3>
            </div>
            <button
              onClick={() => onTabChange('skills')}
              className="text-xs text-primary-500 hover:underline"
            >
              View
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Skill Tags:</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {staff.qualifications?.filter((q) => q.recordType === 'skill_tag').length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Formal Certificates:</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {staff.qualifications?.filter((q) => q.recordType === 'formal_qualification').length || 0}
              </span>
            </div>
          </div>
        </Card>

        {/* Documents Summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                <FileText size={18} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                HR Documents
              </h3>
            </div>
            <button
              onClick={() => onTabChange('documents')}
              className="text-xs text-primary-500 hover:underline"
            >
              Manage
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Active Documents:</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {staff.documents?.filter((d) => d.status === 'active').length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">National ID on File:</span>
              <span className="text-[var(--text-secondary)]">
                {contacts.hasNationalId ? 'Yes (Encrypted)' : 'Not Provided'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default StaffOverviewTab;
