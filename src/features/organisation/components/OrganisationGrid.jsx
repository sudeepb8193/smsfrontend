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
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Inactive
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 capitalize">
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
            className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!organisations || organisations.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 dark:text-slate-400">
        <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          No Organisations Found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Try adjusting your search or filter parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {organisations.map((org) => {
        const owner = org.users?.[0];

        return (
          <div
            key={org.id}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            {/* Top Bar: Logo, Name, Code & Actions */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  {org.logoUrl ? (
                    <img
                      src={getLogoUrl(org.logoUrl)}
                      alt={org.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 bg-white shrink-0 shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextElementSibling;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50 items-center justify-center font-bold text-lg shrink-0 shadow-sm ${
                      org.logoUrl ? 'hidden' : 'flex'
                    }`}
                  >
                    {org.name?.charAt(0)?.toUpperCase() || 'O'}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {org.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                        {org.code || 'N/A'}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
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
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openActionId === org.id && (
                    <div
                      onMouseLeave={() => setOpenActionId(null)}
                      className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 py-1 text-xs font-medium animate-in fade-in zoom-in-95 duration-100"
                    >
                      <button
                        onClick={() => {
                          setOpenActionId(null);
                          navigate(`/super-admin/organisations/${org.id}`);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-primary-500" />
                        View Details
                      </button>

                      <button
                        onClick={() => {
                          setOpenActionId(null);
                          navigate(`/super-admin/organisations/${org.id}/edit`);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4 text-amber-500" />
                        Edit Organisation
                      </button>

                      <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                      {org.status !== 'active' && (
                        <button
                          onClick={() => {
                            setOpenActionId(null);
                            onStatusChange && onStatusChange(org, 'active');
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
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
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Ban className="w-4 h-4" />
                          Suspend Organisation
                        </button>
                      )}

                      <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                      <button
                        onClick={() => {
                          setOpenActionId(null);
                          onDeleteClick && onDeleteClick(org);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Organisation
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Info & Details */}
              <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800/80 my-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{owner?.displayName || 'Owner N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{org.email || owner?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{org.phone || owner?.phoneNumber || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Entitlements & Badges */}
            <div className="pt-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-lg border border-primary-200 dark:border-primary-800">
                  <Layers className="w-3.5 h-3.5" />
                  {org._count?.branches || 0} Branches
                </span>
                <span className="font-semibold text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
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
