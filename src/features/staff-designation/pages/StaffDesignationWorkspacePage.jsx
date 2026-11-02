import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import Loader from '../../../components/shared/Loader';
import UnderlineTabs from '../../../components/shared/UnderlineTabs';
import { useAuth } from '../../../hooks/useAuth';
import { usePermission } from '../../../hooks/usePermission';
import { useOrganisation } from '../../organisation/context/OrganisationContext';
import { fetchStaffById } from '../../staff/api/staffApi';
import { useStaffDesignation } from '../hooks/useStaffDesignation';

// Tab Sections
import StaffDesignationsTab from '../components/StaffDesignationsTab';
import StaffSkillRatingsTab from '../components/StaffSkillRatingsTab';
import StaffServiceAssignmentsTab from '../components/StaffServiceAssignmentsTab';
import StaffBranchAvailabilityTab from '../components/StaffBranchAvailabilityTab';
import StaffCommissionRatesTab from '../components/StaffCommissionRatesTab';

import {
  ArrowLeft,
  Briefcase,
  Award,
  Scissors,
  Building2,
  Percent,
  User,
  Star,
} from 'lucide-react';

export default function StaffDesignationWorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { user } = useAuth();
  const { can } = usePermission();
  const { selectedOrganisation, isSuperAdmin } = useOrganisation();

  const effectiveOrgId = isSuperAdmin ? selectedOrganisation?.id : user?.organizationId;

  // Load employee master details from Module 05
  const [staff, setStaff] = useState(null);
  const [staffLoading, setStaffLoading] = useState(true);

  useEffect(() => {
    async function loadStaffMaster() {
      if (!id || !effectiveOrgId) return;
      try {
        setStaffLoading(true);
        const data = await fetchStaffById(id, effectiveOrgId);
        setStaff(data);
      } catch (err) {
        console.error('Failed to load staff master profile:', err);
      } finally {
        setStaffLoading(false);
      }
    }
    loadStaffMaster();
  }, [id, effectiveOrgId]);

  // Hook for Module 06 data and mutations
  const {
    loading: moduleLoading,
    error: moduleError,
    designationsData,
    skillsData,
    servicesData,
    availableCatalog,
    branchAvailabilityData,
    commissionData,
    addDesignation,
    updateDesignation,
    setPrimary,
    deleteDesignation,
    addSkill,
    updateSkill,
    verifySkill,
    rejectSkill,
    deleteSkill,
    assignBulk,
    updateAssignment,
    unassign,
    setBranchOverride,
    removeBranchOverride,
    setCommissionEligible,
    createCommOverride,
    updateCommOverride,
    deleteCommOverride,
  } = useStaffDesignation(id, effectiveOrgId);

  // Dynamic permission-checked tabs
  const canViewDesignations = can('staff_designation.view', staff?.homeBranchId);
  const canViewSkills = can('staff_skill_rating.view', staff?.homeBranchId);
  const canViewServices = can('staff_service.view', staff?.homeBranchId);
  const canViewBranches = can('staff_service_branch.view', staff?.homeBranchId);
  const canViewCommission = can('staff_commission.view', staff?.homeBranchId);

  const availableTabs = [
    ...(canViewDesignations
      ? [
          {
            id: 'designations',
            label: 'Designations',
            count: designationsData?.designations?.length,
          },
        ]
      : []),
    ...(canViewSkills
      ? [
          {
            id: 'skills',
            label: 'Skills & Techniques',
            count: skillsData?.skills?.length,
          },
        ]
      : []),
    ...(canViewServices
      ? [
          {
            id: 'services',
            label: 'Services Assigned',
            count: servicesData?.assignments?.length,
          },
        ]
      : []),
    ...(canViewBranches
      ? [
          {
            id: 'branches',
            label: 'Branch Availability',
            count: branchAvailabilityData?.matrix?.reduce(
              (acc, m) => acc + (m.exceptionsCount || 0),
              0,
            ),
          },
        ]
      : []),
    ...(canViewCommission
      ? [
          {
            id: 'commission',
            label: 'Commission Rules',
            count: commissionData?.overrides?.length,
          },
        ]
      : []),
  ];

  const defaultTab = availableTabs[0]?.id || 'designations';
  const activeTab = searchParams.get('tab') || defaultTab;

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  if (staffLoading || moduleLoading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader text="Loading employee professional profile & services..." />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-600 font-semibold">Employee not found</p>
        <Button variant="outline" onClick={() => navigate('/staff')}>
          Back to Staff Directory
        </Button>
      </div>
    );
  }

  const primaryDes = designationsData?.primaryDesignation;

  return (
    <div className="w-full space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      {/* Back button & Navigation Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/staff/directory')}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] -ml-2"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Staff Directory
        </Button>
      </div>

      {/* Hero Header Card */}
      <Card className="p-6 border border-[var(--border-color)] rounded-3xl bg-[var(--bg-card)] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0 flex-1">
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
                <div className="w-full h-full bg-primary-500/15 text-primary-600 dark:text-primary-400 font-black text-2xl flex items-center justify-center">
                  {staff.fullName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                  {staff.fullName}
                </h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-color)]">
                  {staff.employeeCode}
                </span>
                <Badge
                  variant={staff.employmentStatus === 'active' ? 'success' : 'neutral'}
                  size="xs"
                >
                  {staff.employmentStatus}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-secondary)]">
                {primaryDes ? (
                  <span className="inline-flex items-center gap-1 font-bold text-primary-600 bg-primary-500/10 px-2.5 py-0.5 rounded-full border border-primary-500/20">
                    <Star size={12} className="fill-primary-500" />
                    {primaryDes.customLabel || primaryDes.designationType.replace(/_/g, ' ')}
                  </span>
                ) : (
                  <span className="italic text-[var(--text-muted)]">
                    No primary designation set
                  </span>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 size={13} className="text-[var(--text-muted)]" />
                  Home: <strong>{staff.homeBranch?.name}</strong>
                </span>
                <span>•</span>
                <span className="text-[var(--text-muted)]">
                  HR Role: {staff.currentEmployment?.designation || 'Staff'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/staff/${staff.id}`)}
            >
              <User size={14} className="mr-1.5" />
              View HR Details
            </Button>
          </div>
        </div>
      </Card>

      {/* 5-Tab Navigation Bar */}
      {availableTabs.length > 0 ? (
        <div>
          <UnderlineTabs
            tabs={availableTabs}
            activeTab={activeTab}
            onChange={handleTabChange}
          />

          <div className="mt-6">
            {activeTab === 'designations' && canViewDesignations && (
              <StaffDesignationsTab
                staffId={staff.id}
                designations={designationsData.designations}
                primaryDesignation={designationsData.primaryDesignation}
                onAddDesignation={addDesignation}
                onUpdateDesignation={updateDesignation}
                onSetPrimary={setPrimary}
                onDeleteDesignation={deleteDesignation}
                loading={moduleLoading}
              />
            )}

            {activeTab === 'skills' && canViewSkills && (
              <StaffSkillRatingsTab
                staffId={staff.id}
                skills={skillsData.skills}
                onAddSkill={addSkill}
                onUpdateSkill={updateSkill}
                onVerifySkill={verifySkill}
                onRejectSkill={rejectSkill}
                onDeleteSkill={deleteSkill}
                staffUserId={staff.userId}
                loading={moduleLoading}
              />
            )}

            {activeTab === 'services' && canViewServices && (
              <StaffServiceAssignmentsTab
                staffId={staff.id}
                assignments={servicesData.assignments}
                availableCatalog={availableCatalog}
                onAssignBulk={assignBulk}
                onUpdateAssignment={updateAssignment}
                onUnassign={unassign}
                onNavigateToBranchAvailability={() => handleTabChange('branches')}
                loading={moduleLoading}
              />
            )}

            {activeTab === 'branches' && canViewBranches && (
              <StaffBranchAvailabilityTab
                staffId={staff.id}
                assignedBranches={branchAvailabilityData.assignedBranches}
                matrix={branchAvailabilityData.matrix}
                onSetOverride={setBranchOverride}
                onRemoveOverride={removeBranchOverride}
                loading={moduleLoading}
              />
            )}

            {activeTab === 'commission' && canViewCommission && (
              <StaffCommissionRatesTab
                staffId={staff.id}
                isCommissionEligible={commissionData.isCommissionEligible}
                overrides={commissionData.overrides}
                resolvedServices={commissionData.resolvedServices}
                onSetEligibility={setCommissionEligible}
                onCreateOverride={createCommOverride}
                onUpdateOverride={updateCommOverride}
                onDeleteOverride={deleteCommOverride}
                loading={moduleLoading}
              />
            )}
          </div>
        </div>
      ) : (
        <Card className="p-12 border border-[var(--border-color)] rounded-3xl bg-[var(--bg-card)] text-center">
          <p className="text-sm font-semibold text-[var(--text-muted)]">
            You do not have permission to view designation, skill, service or commission configuration.
          </p>
        </Card>
      )}
    </div>
  );
}

