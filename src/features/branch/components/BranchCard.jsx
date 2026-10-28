import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Users,
  MoreVertical,
  Edit,
  Eye,
  Copy,
  Trash2,
  CheckCircle2,
  Building,
} from 'lucide-react';
import BranchStatusBadge from './BranchStatusBadge';
import BranchTypeBadge from './BranchTypeBadge';
import { useBranch } from '../context/BranchContext';
import { usePermission } from '../../../hooks/usePermission';

export const BranchCard = ({
  branch,
  onOpenDeleteModal,
  onOpenCopyModal,
  canManage = true,
}) => {
  const navigate = useNavigate();
  const { currentBranch, setCurrentBranch } = useBranch();
  const { canEdit, canDelete, isOwner } = usePermission();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const canEditItem = isOwner || canEdit('branches', branch.id);
  const canDeleteItem = isOwner || canDelete('branches', branch.id);

  const isCurrentActive = currentBranch?.id === branch.id;

  const address = branch.branchAddress;
  const locationText = address?.city
    ? `${address.city}${address.state ? `, ${address.state}` : ''}`
    : 'Address pending setup';

  const staffCount = branch._count?.staff ?? 0;

  const launchDateText = branch.launchedAt
    ? new Date(branch.launchedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not launched yet';

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const menuItems = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: () => {
        setMenuOpen(false);
        navigate(`/branches/${branch.id}`);
      },
    },
    ...(canEditItem
      ? [
          {
            label: 'Edit Profile',
            icon: Edit,
            onClick: () => {
              setMenuOpen(false);
              navigate(`/branches/${branch.id}/edit`);
            },
          },
          {
            label: 'Copy Settings From...',
            icon: Copy,
            onClick: () => {
              setMenuOpen(false);
              onOpenCopyModal?.(branch);
            },
          },
        ]
      : []),
    ...(canDeleteItem
      ? [
          {
            label: 'Delete or Close Branch',
            icon: Trash2,
            danger: true,
            onClick: () => {
              setMenuOpen(false);
              onOpenDeleteModal?.(branch);
            },
          },
        ]
      : []),
  ];

  return (
    <div
      id={`branch-card-${branch.id}`}
      className={`group relative rounded-2xl border transition-all duration-200 flex flex-col bg-[var(--bg-card)] ${
        isCurrentActive
          ? 'border-primary-500/50 shadow-lg shadow-primary-500/10 ring-1 ring-primary-500/30'
          : 'border-[var(--border-color)] hover:border-primary-500/30 hover:shadow-md'
      }`}
    >
      {/* Cover Image or Stylish Header */}
      <div className="relative h-40 w-full">
        {/* Background Artwork */}
        <div className="absolute inset-0 rounded-t-2xl overflow-hidden bg-gradient-to-br from-primary-900/40 via-purple-900/30 to-slate-900/50">
          {branch.coverImageUrl ? (
            <img
              src={branch.coverImageUrl}
              alt={branch.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-primary-400/50">
              <Building size={48} strokeWidth={1.5} />
              <span className="text-xs font-semibold text-primary-400/70 mt-1 uppercase tracking-wider">
                {branch.branchType || 'Salon Branch'}
              </span>
            </div>
          )}
        </div>

        {/* Top Header Overlay: Badges on left, 3-dots action menu on right */}
        <div className="absolute top-3 inset-x-3 flex items-start justify-between gap-2 z-10">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0 pr-1">
            <BranchStatusBadge status={branch.status} />
            <BranchTypeBadge type={branch.branchType} />
          </div>

          {/* Action Menu button (3-dots) */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 flex items-center justify-center transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
              aria-label={`Branch actions for ${branch.name}`}
              aria-expanded={menuOpen}
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
              >
                {menuItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onClick();
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                        item.danger
                          ? 'text-rose-500 hover:bg-rose-500/10'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                      }`}
                    >
                      {Icon && (
                        <Icon
                          size={14}
                          className={item.danger ? 'text-rose-500' : 'text-primary-500'}
                        />
                      )}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Active Badge if currently selected in switcher */}
        {isCurrentActive && (
          <div className="absolute bottom-3 right-3 bg-primary-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 z-10">
            <CheckCircle2 size={13} />
            <span>Active Context</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Code and Name */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="inline-block px-2 py-0.5 text-[11px] font-mono font-bold tracking-wider rounded bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 mb-1">
                {branch.code}
              </span>
              <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-primary-500 transition-colors line-clamp-1">
                {branch.name}
              </h3>
            </div>
          </div>

          {/* Location info */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-4">
            <MapPin size={14} className="text-primary-500 shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>

          {/* Meta metrics chips */}
          <div className="flex items-center justify-between gap-2 mb-4 pt-3 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Users size={14} className="text-purple-500" />
              <span>
                <strong className="text-[var(--text-primary)]">{staffCount}</strong> Staff Members
              </span>
            </div>
            <span className="text-[11px] font-medium text-[var(--text-muted)] capitalize px-2 py-0.5 rounded-md bg-[var(--bg-input)]">
              {branch.branchType || 'Standard'}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
          <div className="text-[11px] text-[var(--text-muted)] truncate">
            {launchDateText}
          </div>

          <div className="flex items-center gap-1.5">
            {!isCurrentActive && branch.status === 'active' && (
              <button
                type="button"
                onClick={() => setCurrentBranch(branch)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--bg-input)] hover:bg-primary-500 hover:text-white text-[var(--text-secondary)] border border-[var(--border-color)] transition-colors"
                title="Switch active branch context"
              >
                Switch To
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(`/branches/${branch.id}`)}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary-500/10 hover:bg-primary-500 text-primary-600 dark:text-primary-400 hover:text-white border border-primary-500/20 transition-all"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchCard;
