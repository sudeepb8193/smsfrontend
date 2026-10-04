import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Eye,
  Edit,
  Power,
  Trash2,
  MoreVertical,
  Calendar,
  Layers,
  ShieldAlert,
} from 'lucide-react';

const getLogoUrl = (logoUrl) => {
  if (!logoUrl || logoUrl.includes('key=undefined') || logoUrl.endsWith('undefined')) return '';
  if (
    logoUrl.startsWith('http://') ||
    logoUrl.startsWith('https://') ||
    logoUrl.startsWith('data:') ||
    logoUrl.startsWith('blob:')
  ) {
    return logoUrl;
  }
  const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const CLEAN_BASE = RAW_API_BASE.replace(/\/+$/, '');
  const API_BASE = CLEAN_BASE.endsWith('/sms') ? CLEAN_BASE : `${CLEAN_BASE}/sms`;
  return `${API_BASE}/storage/file?key=${encodeURIComponent(logoUrl)}`;
};

export const OrganisationTable = ({
  organisations = [],
  loading = false,
  onStatusChange,
  onDeleteClick,
}) => {
  const navigate = useNavigate();
  const [openActionId, setOpenActionId] = useState(null);

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    switch (s) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case 'onboarding':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Onboarding
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Inactive
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 capitalize">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!organisations.length) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Building2 className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
          No Organisations Found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          No organisations match your search criteria or filter parameters. Try adjusting your search query.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <th className="py-3.5 px-4 min-w-[240px]">Organisation</th>
            <th className="py-3.5 px-4 min-w-[100px]">Code</th>
            <th className="py-3.5 px-4 min-w-[150px]">Owner</th>
            <th className="py-3.5 px-4 min-w-[200px]">Email & Phone</th>
            <th className="py-3.5 px-4 min-w-[100px] text-center">Branches</th>
            <th className="py-3.5 px-4 min-w-[130px]">Subscription</th>
            <th className="py-3.5 px-4 min-w-[120px]">Status</th>
            <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">Created Date</th>
            <th className="py-3.5 px-4 min-w-[110px] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
          {organisations.map((org) => {
            const owner = org.users?.[0];

            return (
              <tr
                key={org.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Name & Logo */}
                <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                  <div className="flex items-center gap-3">
                    {org.logoUrl ? (
                      <img
                        src={getLogoUrl(org.logoUrl)}
                        alt={org.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50 items-center justify-center font-bold text-base shrink-0 ${
                        org.logoUrl ? 'hidden' : 'flex'
                      }`}
                    >
                      {org.name?.charAt(0)?.toUpperCase() || 'O'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors whitespace-normal leading-snug">
                        {org.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                        {org.businessType?.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </td>

                  {/* Code */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700">
                      {org.code || 'N/A'}
                    </span>
                  </td>

                  {/* Owner */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {owner?.displayName || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {owner?.phoneNumber || 'No phone'}
                    </div>
                  </td>

                  {/* Email & Phone */}
                  <td className="py-3.5 px-4">
                    <div className="text-slate-700 dark:text-slate-300 font-medium text-xs">
                      {org.email || owner?.email || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {org.phone || 'N/A'}
                    </div>
                  </td>

                  {/* Branches */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-semibold text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-lg border border-primary-200 dark:border-primary-800">
                      <Layers className="w-3.5 h-3.5" />
                      {org._count?.branches || 0}
                    </span>
                  </td>

                  {/* Subscription */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block font-semibold text-xs px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                      {org.subscription?.planName || 'Basic Plan'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(org.status)}
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(org.createdAt)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="relative inline-block text-left">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/super-admin/organisations/${org.id}`)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => navigate(`/super-admin/organisations/${org.id}/edit`)}
                          title="Edit Organisation"
                          className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setOpenActionId(openActionId === org.id ? null : org.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Dropdown Menu */}
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
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-primary-500" />
                            View Organisation
                          </button>

                          <button
                            onClick={() => {
                              setOpenActionId(null);
                              navigate(`/super-admin/organisations/${org.id}/edit`);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-amber-500" />
                            Edit Details
                          </button>

                          <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                          {org.status === 'active' ? (
                            <button
                              onClick={() => {
                                setOpenActionId(null);
                                onStatusChange(org, 'inactive');
                              }}
                              className="w-full flex items-center gap-2 px-3.5 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                            >
                              <Power className="w-4 h-4" />
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setOpenActionId(null);
                                onStatusChange(org, 'active');
                              }}
                              className="w-full flex items-center gap-2 px-3.5 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                            >
                              <Power className="w-4 h-4" />
                              Activate
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setOpenActionId(null);
                              onStatusChange(org, 'suspended');
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4" />
                            Suspend
                          </button>

                          <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                          <button
                            onClick={() => {
                              setOpenActionId(null);
                              onDeleteClick(org);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Organisation
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

export default OrganisationTable;
