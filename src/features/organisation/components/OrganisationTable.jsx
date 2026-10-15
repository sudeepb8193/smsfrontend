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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)] capitalize">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
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
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 space-y-4 shadow-sm">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-14 bg-[var(--bg-input)] rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!organisations.length) {
    return (
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-[var(--bg-input)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text-muted)]">
          <Building2 className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
          No Organisations Found
        </h3>
        <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
          No organisations match your search criteria or filter parameters. Try adjusting your search query.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-[var(--bg-card)]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--bg-input)] border-b border-[var(--border-color)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
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
        <tbody className="divide-y divide-[var(--border-color)] text-sm">
          {organisations.map((org) => {
            const owner = org.users?.[0];

            return (
              <tr
                key={org.id}
                className="hover:bg-white/5 transition-colors group"
              >
                {/* Name & Logo */}
                <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                  <div className="flex items-center gap-3">
                    {org.logoUrl ? (
                      <img
                        src={getLogoUrl(org.logoUrl)}
                        alt={org.name}
                        className="w-10 h-10 rounded-xl object-cover border border-[var(--border-color)] bg-[var(--bg-input)] shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20 items-center justify-center font-bold text-base shrink-0 ${
                        org.logoUrl ? 'hidden' : 'flex'
                      }`}
                    >
                      {org.name?.charAt(0)?.toUpperCase() || 'O'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--text-primary)] group-hover:text-primary-500 transition-colors whitespace-normal leading-snug">
                        {org.name}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] capitalize mt-0.5">
                        {org.businessType?.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </td>

                  {/* Code */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold px-2 py-1 bg-[var(--bg-input)] text-[var(--text-secondary)] rounded-md border border-[var(--border-color)]">
                      {org.code || 'N/A'}
                    </span>
                  </td>

                  {/* Owner */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-[var(--text-primary)]">
                      {owner?.displayName || 'N/A'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {owner?.phoneNumber || 'No phone'}
                    </div>
                  </td>

                  {/* Email & Phone */}
                  <td className="py-3.5 px-4">
                    <div className="text-[var(--text-primary)] font-medium text-xs">
                      {org.email || owner?.email || 'N/A'}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {org.phone || 'N/A'}
                    </div>
                  </td>

                  {/* Branches */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-semibold text-xs text-primary-500 bg-primary-500/10 px-2.5 py-1 rounded-lg border border-primary-500/20">
                      <Layers className="w-3.5 h-3.5" />
                      {org._count?.branches || 0}
                    </span>
                  </td>

                  {/* Subscription */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block font-semibold text-xs px-2.5 py-1 rounded-md bg-[var(--bg-input)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                      {org.subscription?.planName || 'Basic Plan'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(org.status)}
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 px-4 text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
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
                          className="p-1.5 text-[var(--text-muted)] hover:text-primary-500 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => navigate(`/super-admin/organisations/${org.id}/edit`)}
                          title="Edit Organisation"
                          className="p-1.5 text-[var(--text-muted)] hover:text-amber-500 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setOpenActionId(openActionId === org.id ? null : org.id)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      {openActionId === org.id && (
                        <div
                          onMouseLeave={() => setOpenActionId(null)}
                          className="absolute right-0 mt-1 w-48 bg-[var(--bg-card)] rounded-xl shadow-2xl border border-[var(--border-color)] z-20 py-1 text-xs font-medium animate-in fade-in zoom-in-95 duration-100"
                        >
                          <button
                            onClick={() => {
                              setOpenActionId(null);
                              navigate(`/super-admin/organisations/${org.id}`);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-primary-500" />
                            View Organisation
                          </button>

                          <button
                            onClick={() => {
                              setOpenActionId(null);
                              navigate(`/super-admin/organisations/${org.id}/edit`);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4 text-amber-500" />
                            Edit Details
                          </button>

                          <div className="my-1 border-t border-[var(--border-color)]" />

                          {org.status === 'active' ? (
                            <button
                              onClick={() => {
                                setOpenActionId(null);
                                onStatusChange(org, 'inactive');
                              }}
                              className="w-full flex items-center gap-2 px-3.5 py-2 text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
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
                              className="w-full flex items-center gap-2 px-3.5 py-2 text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
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
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          >
                            <ShieldAlert className="w-4 h-4" />
                            Suspend
                          </button>

                          <div className="my-1 border-t border-[var(--border-color)]" />

                          <button
                            onClick={() => {
                              setOpenActionId(null);
                              onDeleteClick(org);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
