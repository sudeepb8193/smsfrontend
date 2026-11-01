import React, { useState, useEffect } from 'react';
import Card from '../../../components/shared/Card';
import Badge from '../../../components/shared/Badge';
import EmptyState from '../../../components/shared/EmptyState';
import Loader from '../../../components/shared/Loader';
import { fetchMyProfile } from '../api/staffApi';
import { Scissors, Award, Sparkles } from 'lucide-react';

export default function StaffServicesPage() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        const data = await fetchMyProfile();
        // Extract real certified qualifications/skill tags from staff profile
        const realSkills = data?.qualifications || data?.staffQualifications || [];
        setServices(realSkills);
      } catch (err) {
        console.error('Failed to load staff services:', err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader size="lg" message="Loading your services..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-3xl border border-primary-500/20 bg-gradient-to-r from-primary-500/15 via-primary-500/8 to-transparent p-6 sm:p-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            My Services & Skills
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Eligible salon service specialties and certified skills linked to your staff profile.
          </p>
        </div>
        <Badge variant="primary">
          {services.length} {services.length === 1 ? 'Specialty' : 'Specialties'}
        </Badge>
      </div>

      {/* Services Grid or Clean Empty State */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <Card
              key={srv.id || srv.title}
              className="p-6 border border-[var(--border-color)] rounded-3xl bg-[var(--bg-card)] shadow-xs hover:border-primary-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary-500/10 text-primary-600 flex items-center justify-center">
                    <Scissors size={18} />
                  </div>
                  <Badge variant="primary" size="xs">
                    {(srv.recordType || 'Skill').replace(/_/g, ' ')}
                  </Badge>
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)] mb-1">
                  {srv.title}
                </h3>
                {srv.issuingInstitution && (
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    Institution: {srv.issuingInstitution}
                  </p>
                )}
                {srv.certificateNumber && (
                  <p className="text-xs font-mono text-[var(--text-secondary)]">
                    Cert #: {srv.certificateNumber}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 border border-[var(--border-color)] rounded-3xl bg-[var(--bg-card)] shadow-xs">
          <EmptyState
            icon={Scissors}
            title="No Services Assigned"
            description="No specific service catalog specialties or skills are currently linked to your staff profile. As certifications are added to your credentials, they will appear here."
          />
        </Card>
      )}
    </div>
  );
}
