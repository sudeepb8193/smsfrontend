import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Edit,
  MoreVertical,
  Layers,
  Calendar,
  Building2,
  Mail,
  Phone,
  User,
  ShieldCheck,
  Ban,
  Trash2,
  Globe,
  Store,
} from 'lucide-react';

export const OrganisationGrid = ({
  organisations = [],
  loading = false,
  onStatusChange,
  onDeleteClick,
}) => {
  const navigate = useNavigate();
  const [openActionId, setOpenActionId] = useState(null);

  const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const CLEAN_BASE = RAW_API_BASE.replace(/\/+$/, '');
  const API_BASE = CLEAN_BASE.endsWith('/sms') ? CLEAN_BASE : `${CLEAN_BASE}/sms`;

  const getLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Inactive
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)] capitalize">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-5 space-y-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-input)]" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-[var(--bg-input)] rounded w-3/4" />
                <div className="h-3 bg-[var(--bg-input)] rounded w-1/2" />
              </div>
            </div>
            <div className="h-10 bg-[var(--bg-input)] rounded-xl" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 bg-[var(--bg-input)] rounded w-1/3" />
              <div className="h-6 bg-[var(--bg-input)] rounded-full w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!organisations || organisations.length === 0) {
    return (
      <div className="p-12 text-center text-[var(--text-muted)]">
        <Building2 className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
          No Organisations Found
        </h3>
        <p className="text-xs text-[var(--text-muted)]">
          Try adjusting your search or filter parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-[var(--bg-app)]">
      {organisations.map((org) => {
        const owner = org.users?.[0];

        return (
          <div
            key={org.id}
            className="group relative bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-5 shadow-sm hover:shadow-md hover:border-[var(--border-hover)] transition-all flex flex-col justify-between"
          >
            {/* Top Bar: Logo, Name, Code & Actions */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  {org.logoUrl ? (
                    <img
                      src={getLogoUrl(org.logoUrl)}
                      alt={org.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-[var(--border-color)] bg-[var(--bg-input)] shrink-0 shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20 items-center justify-center font-bold text-lg shrink-0 shadow-sm ${
                      org.logoUrl ? 'hidden' : 'flex'
                    }`}
                  >
                    {org.name?.charAt(0)?.toUpperCase() || 'O'}
                  </div>

                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-sm line-clamp-1 group-hover:text-primary-500 transition-colors">
                      {org.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 bg-[var(--bg-input)] text-[var(--text-secondary)] rounded border border-[var(--border-color)]">
                        {org.code || 'N/A'}
                      </span>
                      {org.operatingMode === 'CENTRAL_MARKETPLACE' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          <Store className="w-3 h-3" />
                          Marketplace
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          <Globe className="w-3 h-3" />
                          Website
                        </span>
                      )}
                      <span className="text-[11px] text-[var(--text-muted)] capitalize">
                        • {org.businessType?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Options Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenActionId(openActionId === org.id ? null : org.id)}
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openActionId === org.id && (
                    <div
                      onMouseLeave={() => setOpenActionId(null)}
                      className="absolute right-0 mt-1 w-48 bg-[var(--bg-card)] rounded-xl shadow-xl border border-[var(--border-color)] z-20 py-1 text-xs font-medium animate-in fade-in zoom-in-95 duration-100"
                    >
                      <button
                        onClick={() => {
                          setOpenActionId(null);
                          navigate(`/super-admin/organisations/${org.id}`);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-primary-500" />
                        View Details
                      </button>

                      <button
                        onClick={() => {
                          setOpenActionId(null);
                          navigate(`/super-admin/organisations/${org.id}/edit`);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4 text-amber-500" />
                        Edit Organisation
                      </button>

                      <div className="my-1 border-t border-[var(--border-color)]" />

                      {org.status !== 'active' && (
                        <button
                          onClick={() => {
                            setOpenActionId(null);
                            onStatusChange && onStatusChange(org, 'active');
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Activate Organisation
                        </button>
                      )}

                      {org.status !== 'suspended' && (
                        <button
                          onClick={() => {
                            setOpenActionId(null);
                            onStatusChange && onStatusChange(org, 'suspended');
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Ban className="w-4 h-4" />
                          Suspend Organisation
                        </button>
                      )}

                      <div className="my-1 border-t border-[var(--border-color)]" />

                      <button
                        onClick={() => {
                          setOpenActionId(null);
                          onDeleteClick && onDeleteClick(org);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Organisation
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Info & Details */}
              <div className="space-y-2 py-3 border-y border-[var(--border-color)] my-3 text-xs">
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-medium">
                  <User className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                  <span className="truncate">{owner?.displayName || 'Owner N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                  <span className="truncate">{org.email || owner?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <Phone className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                  <span className="truncate">{org.phone || owner?.phoneNumber || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Entitlements & Badges */}
            <div className="pt-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-primary-500 bg-primary-500/10 px-2.5 py-1 rounded-lg border border-primary-500/20">
                  <Layers className="w-3.5 h-3.5" />
                  {org._count?.branches || 0} Branches
                </span>
                <span className="font-semibold text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                  {org.subscription?.planName || 'Basic Plan'}
                </span>
              </div>

              <div>{getStatusBadge(org.status)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrganisationGrid;
