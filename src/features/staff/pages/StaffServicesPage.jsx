import React, { useState, useEffect } from 'react';
import Card from '../../../components/shared/Card';
import Badge from '../../../components/shared/Badge';
import EmptyState from '../../../components/shared/EmptyState';
import Loader from '../../../components/shared/Loader';
import { fetchMyProfile } from '../api/staffApi';
import {
  fetchAssignedServices,
  fetchStaffSkills,
  fetchStaffDesignations,
} from '../../staff-designation/api/staffDesignationApi';
import ProficiencyDots from '../../staff-designation/components/common/ProficiencyDots';
import {
  Scissors,
  Award,
  Sparkles,
  Clock,
  ShieldCheck,
  Building2,
  Tag,
  Star,
} from 'lucide-react';

export default function StaffServicesPage() {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState(null);
  const [assignedServices, setAssignedServices] = useState([]);
  const [skills, setSkills] = useState([]);
  const [designations, setDesignations] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const myProfile = await fetchMyProfile();
        setStaff(myProfile);

        if (myProfile?.id) {
          const [srvRes, skillRes, desRes] = await Promise.allSettled([
            fetchAssignedServices(myProfile.id, myProfile.organizationId),
            fetchStaffSkills(myProfile.id, myProfile.organizationId),
            fetchStaffDesignations(myProfile.id, myProfile.organizationId),
          ]);

          if (srvRes.status === 'fulfilled') {
            setAssignedServices(srvRes.value?.assignments || []);
          }
          if (skillRes.status === 'fulfilled') {
            setSkills(skillRes.value?.skills || []);
          }
          if (desRes.status === 'fulfilled') {
            setDesignations(desRes.value?.designations || []);
          }
        }
      } catch (err) {
        console.error('Failed to load my services:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader size="lg" message="Loading your assigned services..." />
      </div>
    );
  }

  const primaryDes = designations.find((d) => d.isPrimary);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-3xl border border-primary-500/20 bg-gradient-to-r from-primary-500/15 via-primary-500/8 to-transparent p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
              My Services & Specialties
            </h1>
            {primaryDes && (
              <Badge variant="primary">
                {primaryDes.customLabel || primaryDes.designationType.replace(/_/g, ' ')}
              </Badge>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Authorized service catalog items and certified skills linked to your appointment booking availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">
            {assignedServices.length} Authorized Service{assignedServices.length !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="neutral">
            {skills.length} Technique{skills.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Assigned Services Section */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
          <Scissors size={18} className="text-primary-600" />
          Bookable Services
        </h2>

        {assignedServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedServices.map((srv) => (
              <Card
                key={srv.id}
                className="p-5 border border-[var(--border-color)] rounded-3xl bg-[var(--bg-card)] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-600 border border-primary-500/20">
                      {srv.categoryName}
                    </span>
                    <span className="font-mono font-bold text-xs text-[var(--text-primary)]">
                      ₹{srv.basePriceAmount}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-[var(--text-primary)] mb-1">
                    {srv.serviceName}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-2">
                    <Clock size={13} />
                    <span>Duration:</span>
                    <strong className="text-[var(--text-primary)]">
                      {srv.effectiveDurationMinutes} mins
                    </strong>
                    {srv.durationOverrideMinutes && (
                      <span className="text-[10px] text-purple-600 font-bold">
                        (Custom override)
                      </span>
                    )}
                  </div>
                </div>

                {srv.branchOverridesCount > 0 && (
                  <div className="pt-3 mt-3 border-t border-[var(--border-color)] text-[11px] text-amber-600 flex items-center gap-1 font-semibold">
                    <Building2 size={12} />
                    <span>Not available at {srv.branchOverridesCount} branch location(s)</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 border border-[var(--border-color)] rounded-3xl bg-[var(--bg-card)]">
            <EmptyState
              icon={Scissors}
              title="No Services Assigned Yet"
              description="Your salon manager has not assigned specific service catalog items to your profile yet."
            />
          </Card>
        )}
      </div>

      {/* Certified Skills Section */}
      <div className="space-y-4 pt-6 border-t border-[var(--border-color)]">
        <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
          <Award size={18} className="text-amber-500" />
          Professional Techniques & Skills
        </h2>

        {skills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {skills.map((sk) => {
              const isVerified = sk.verificationStatus === 'manager_verified';
              return (
                <Card
                  key={sk.id}
                  className="p-4 border border-[var(--border-color)] rounded-2xl bg-[var(--bg-card)] shadow-xs"
                >
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <h4 className="font-extrabold text-sm text-[var(--text-primary)]">
                      {sk.skillName}
                    </h4>
                    {isVerified ? (
                      <ShieldCheck size={16} className="text-emerald-500 shrink-0" title="Manager Verified" />
                    ) : (
                      <span className="text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.2 rounded font-bold">
                        Declared
                      </span>
                    )}
                  </div>
                  <ProficiencyDots level={sk.proficiencyLevel} />
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-[var(--text-muted)] p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]">
            No specific skills or techniques declared on your profile.
          </div>
        )}
      </div>
    </div>
  );
}
