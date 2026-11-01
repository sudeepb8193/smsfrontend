import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Phone,
  Mail,
  User,
  MoreVertical,
  Eye,
  Edit,
  Link,
  Trash2,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import StaffStatusBadge from './StaffStatusBadge';
import { usePermission } from '../../../hooks/usePermission';

export function StaffCard({
  staff,
  onOpenStatusModal,
  onOpenLinkModal,
  onOpenDeleteModal,
}) {
  const navigate = useNavigate();
  const { can } = usePermission();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const currentEmployment = staff.currentEmployment || {};
  const contacts = staff.contacts || {};
  const designation = staff.currentDesignation || currentEmployment.designation || 'Staff Member';
  const department = staff.currentDepartment || currentEmployment.department;

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

  const canViewProfile = can('staff.view', staff.homeBranchId);
  const canManageStatus =
    can('staff.manage', staff.homeBranchId) ||
    can('staff.manage_status', staff.homeBranchId) ||
    can('staff.update', staff.homeBranchId);
  const canLinkAccount =
    can('staff.manage', staff.homeBranchId) ||
    can('staff.link_user', staff.homeBranchId);
  const canTerminate =
    can('staff.manage', staff.homeBranchId) ||
    can('staff.delete', staff.homeBranchId) ||
    can('staff.terminate', staff.homeBranchId);

  const menuItems = [
    ...(canViewProfile
      ? [
          {
            label: 'View Profile',
            icon: Eye,
            onClick: () => {
              setMenuOpen(false);
              navigate(`/staff/${staff.id}`);
            },
          },
        ]
      : []),
    ...(canManageStatus
      ? [
          {
            label: 'Change Status',
            icon: Edit,
            onClick: () => {
              setMenuOpen(false);
              onOpenStatusModal?.(staff);
            },
          },
        ]
      : []),
    ...(!staff.user && canLinkAccount
      ? [
          {
            label: 'Link Login Account',
            icon: Link,
            onClick: () => {
              setMenuOpen(false);
              onOpenLinkModal?.(staff);
            },
          },
        ]
      : []),
    ...(canTerminate
      ? [
          {
            label: 'Terminate Employee',
            icon: Trash2,
            danger: true,
            onClick: () => {
              setMenuOpen(false);
              onOpenDeleteModal?.(staff);
            },
          },
        ]
      : []),
  ];

  const initials = staff.fullName
    ? staff.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  return (
    <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] hover:border-primary-500/40 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between p-5 relative group h-full">
      {/* Top Header Row: Status Badge, Code, and Actions 3-dots Menu */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <StaffStatusBadge status={staff.employmentStatus} />
            {staff.employeeCode && (
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-primary-600 dark:text-primary-400 truncate">
                {staff.employeeCode}
              </span>
            )}
          </div>

          {/* 3-dots Dropdown Menu */}
          {menuItems.length > 0 && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((prev) => !prev);
                }}
                className="w-8 h-8 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                aria-label={`Actions for ${staff.fullName}`}
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
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
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                          item.danger
                            ? 'text-danger-500 hover:bg-danger-500/10'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                        }`}
                      >
                        {Icon && (
                          <Icon
                            size={14}
                            className={item.danger ? 'text-danger-500' : 'text-primary-500'}
                          />
                        )}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Avatar & Prominent Employee Name */}
        <div
          className="flex items-center space-x-3.5 mb-4 cursor-pointer"
          onClick={() => navigate(`/staff/${staff.id}`)}
        >
          {staff.profilePhotoUrl ? (
            <img
              src={staff.profilePhotoUrl}
              alt={staff.fullName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[var(--border-color)] group-hover:border-primary-500 transition-colors shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white font-extrabold flex items-center justify-center text-base border-2 border-primary-500/25 shrink-0 shadow-xs">
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] group-hover:text-primary-500 transition-colors line-clamp-1 tracking-tight">
              {staff.fullName || 'Employee Name'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-semibold truncate mt-0.5">
              <span className="text-primary-600 dark:text-primary-400 font-bold">{designation}</span>
              {department && (
                <span className="text-[var(--text-muted)] font-normal"> • {department}</span>
              )}
            </p>
          </div>
        </div>

        {/* Meta Details: Home Branch, Contact & Compliance */}
        <div className="space-y-2.5 py-3 border-y border-[var(--border-color)] text-xs">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] truncate">
            <Building2 size={13} className="text-primary-500 shrink-0" />
            <span className="truncate font-semibold">
              {staff.homeBranch?.name || 'Home Branch Unassigned'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[var(--text-muted)] truncate">
            <Phone size={13} className="text-primary-500 shrink-0" />
            <span className="truncate font-mono">
              {contacts.personalPhone || 'No phone recorded'}
            </span>
          </div>

          {/* Emergency Contact Status Row (Maintains Balanced Height) */}
          <div className="pt-0.5">
            {staff.hasMissingEmergencyContact ? (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
                <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                <span>Missing emergency contact</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                <span>Emergency contact verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Account Link Badge & View Profile Action */}
      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0 shrink-0">
          {staff.user ? (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 shadow-2xs"
              title={`Account linked to ${staff.user.email || 'user'}`}
            >
              <UserCheck size={12} className="shrink-0" />
              <span>Linked Account</span>
            </span>
          ) : canLinkAccount ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenLinkModal?.(staff);
              }}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
              title="Click to link user login account"
            >
              <Link size={12} className="shrink-0" />
              <span>Link Account</span>
            </button>
          ) : (
            <span className="inline-flex items-center text-[11px] font-medium text-[var(--text-muted)] bg-[var(--bg-input)] border border-[var(--border-color)] px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0">
              No Login Account
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate(`/staff/${staff.id}`)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-primary-500/10 hover:bg-primary-500 text-primary-600 dark:text-primary-400 hover:text-white border border-primary-500/25 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
        >
          <span>View Profile</span>
          <Eye size={13} className="shrink-0" />
        </button>
      </div>
    </div>
  );
}

export default StaffCard;
