import React from 'react';
import { Building2, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';

export const OrganizationHeader = ({
  profile,
  onActivate,
  onAddNew,
  actionButtonLabel = 'Create New',
  showActionButton = true,
  saving = false,
  title = 'Organization Setup',
  subtitle = 'Manage business profile, contact details, locations, tax configurations, and operational schedules.',
}) => {
  const isActivated = profile?.status === 'active';

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm mb-3 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
            {profile?.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={profile.displayName || profile.organizationName}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Building2 className="text-primary-500" size={22} />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                {profile?.displayName || profile?.organizationName || title}
              </h1>
              {profile?.status && (
                <Badge variant={isActivated ? 'success' : 'warning'}>
                  {isActivated ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12} /> Active Tenant
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <AlertCircle size={12} /> {profile.status.toUpperCase()}
                    </span>
                  )}
                </Badge>
              )}
            </div>

            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Action Button & Activation */}
        <div className="flex items-center gap-3 self-end md:self-center">
          {!isActivated && onActivate && (
            <Button
              variant="outline"
              size="medium"
              onClick={onActivate}
              loading={saving}
              className="border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
            >
              Activate Business
            </Button>
          )}

          {showActionButton && onAddNew && (
            <Button
              variant="primary"
              size="medium"
              icon={Plus}
              onClick={onAddNew}
            >
              {actionButtonLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationHeader;
