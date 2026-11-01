import React, { useState, useMemo } from 'react';
import Toggle from '../../../components/shared/Toggle';
import Badge from '../../../components/shared/Badge';
import Tooltip from '../../../components/shared/Tooltip';
import {
  UserCheck,
  Phone,
  AlertCircle,
  Briefcase,
  Award,
  FileText,
  Building2,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export const MODULE_05_STAFF_GROUPS = [
  {
    id: 'profile_identity',
    title: '1. Employee Profile & Identity',
    description: 'Master employee records, unique code, employee status, and linked user authentication.',
    icon: UserCheck,
    color: 'primary',
    keys: [
      'staff.view',
      'staff.create',
      'staff.update',
      'staff.delete',
      'staff.manage',
      'staff.manage_status',
      'staff.terminate',
      'staff.link_user',
      'staff.approve',
      'staff.reject',
      'staff.export',
      'staff.print',
    ],
  },
  {
    id: 'personal_contacts',
    title: '2. Personal & Contact Details',
    description: 'Personal communication channels, residential address, and confidential National ID / SSN unmasking.',
    icon: Phone,
    color: 'blue',
    keys: [
      'staff_contact.view',
      'staff_contact.create',
      'staff_contact.update',
      'staff_contact.delete',
      'staff_contact.manage',
      'staff_contact.reveal_sensitive',
    ],
  },
  {
    id: 'emergency_contacts',
    title: '3. Emergency Contact',
    description: 'Next-of-kin emergency contact names, primary phone numbers, and relationships.',
    icon: AlertCircle,
    color: 'rose',
    keys: [
      'staff_emergency.view',
      'staff_emergency.create',
      'staff_emergency.update',
      'staff_emergency.delete',
      'staff_emergency.manage',
    ],
  },
  {
    id: 'employment_history',
    title: '4. Employment & Department History',
    description: 'Career designations, promotions, department assignments, and historical role lifecycle.',
    icon: Briefcase,
    color: 'amber',
    keys: [
      'staff_employment.view',
      'staff_employment.create',
      'staff_employment.update',
      'staff_employment.delete',
      'staff_employment.manage',
    ],
  },
  {
    id: 'skills_qualifications',
    title: '5. Skills & Qualifications',
    description: 'Cosmetology licenses, professional certifications, and permitted service capabilities.',
    icon: Award,
    color: 'emerald',
    keys: [
      'staff_qualification.view',
      'staff_qualification.create',
      'staff_qualification.update',
      'staff_qualification.delete',
      'staff_qualification.manage',
    ],
  },
  {
    id: 'document_management',
    title: '6. Document Management',
    description: 'Secure HR document storage, employee contracts, proof of identity, and file downloads.',
    icon: FileText,
    color: 'purple',
    keys: [
      'staff_document.view',
      'staff_document.create',
      'staff_document.upload',
      'staff_document.download',
      'staff_document.update',
      'staff_document.delete',
      'staff_document.manage',
      'staff_document.manage_versions',
    ],
  },
  {
    id: 'branch_assignment',
    title: '7. Branch Assignment',
    description: 'Home branch assignment, secondary rover branches, and inter-branch employee transfers.',
    icon: Building2,
    color: 'cyan',
    keys: [
      'staff_branch.view',
      'staff_branch.create',
      'staff_branch.assign',
      'staff_branch.update',
      'staff_branch.delete',
      'staff_branch.remove',
      'staff_branch.manage',
      'staff_branch.transfer',
    ],
  },
];

const ACTION_COLORS = {
  view: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  create: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  update: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  delete: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  manage: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  approve: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  reject: 'bg-red-500/10 text-red-400 border-red-500/20',
  export: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  print: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export const StaffPermissionGroups = ({
  module,
  selectedPermissions = {},
  onTogglePermission,
  onGrantGroup,
  onRevokeGroup,
}) => {
  // Collapsed / Expanded state for each group (all open by default)
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const expandAll = () => setCollapsedGroups({});
  const collapseAll = () => {
    const all = {};
    MODULE_05_STAFF_GROUPS.forEach((g) => {
      all[g.id] = true;
    });
    setCollapsedGroups(all);
  };

  // Map of permissions by key for fast lookup
  const permissionsMap = useMemo(() => {
    const map = new Map();
    if (module?.permissions) {
      module.permissions.forEach((p) => {
        map.set(p.permissionKey, p);
      });
    }
    return map;
  }, [module]);

  // Check if primary view is checked
  const isMasterViewChecked = Boolean(selectedPermissions['staff.view']);

  // Collect any extra permissions (e.g. staff.export or legacy staff.edit)
  const knownKeys = useMemo(() => {
    const set = new Set();
    MODULE_05_STAFF_GROUPS.forEach((g) => {
      g.keys.forEach((k) => set.add(k));
    });
    return set;
  }, []);

  const extraPermissions = useMemo(() => {
    if (!module?.permissions) return [];
    return module.permissions.filter((p) => !knownKeys.has(p.permissionKey));
  }, [module, knownKeys]);

  return (
    <div className="space-y-4 p-3.5 sm:p-4">
      {/* Group Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-[var(--border-color)] text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--text-primary)] uppercase tracking-wider text-[11px]">
            7 Module 05 Permission Groups
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            (Granular Role-Based Staff Privileges)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-[11px] text-primary-500 hover:underline font-semibold cursor-pointer"
          >
            Expand All
          </button>
          <span className="text-[var(--text-muted)]">•</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* 7 Expandable Permission Groups */}
      <div className="space-y-3.5">
        {MODULE_05_STAFF_GROUPS.map((group) => {
          const isCollapsed = Boolean(collapsedGroups[group.id]);
          const GroupIcon = group.icon;

          // Resolve permission objects present in this group
          const groupPermissions = group.keys
            .map((key) => permissionsMap.get(key))
            .filter(Boolean);

          const totalInGroup = groupPermissions.length;
          const grantedInGroup = groupPermissions.filter(
            (p) => selectedPermissions[p.permissionKey]
          ).length;
          const isAllGranted = totalInGroup > 0 && grantedInGroup === totalInGroup;
          const isNoneGranted = grantedInGroup === 0;

          return (
            <div
              key={group.id}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)]/40 overflow-hidden transition-all"
            >
              {/* Group Accordion Header */}
              <div
                onClick={() => toggleGroupCollapse(group.id)}
                className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer hover:bg-white/5 transition-colors select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
                    <GroupIcon size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate">
                        {group.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                          isAllGranted
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : grantedInGroup > 0
                            ? 'bg-primary-500/15 text-primary-400 border-primary-500/30'
                            : 'bg-white/5 text-[var(--text-muted)] border-[var(--border-color)]'
                        }`}
                      >
                        {grantedInGroup} / {totalInGroup} Granted
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] truncate max-w-xl hidden sm:block">
                      {group.description}
                    </p>
                  </div>
                </div>

                {/* Group Action Buttons & Collapse Chevron */}
                <div
                  className="flex items-center gap-2 shrink-0 self-end sm:self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onGrantGroup(module.moduleCode, group.keys)}
                    disabled={isAllGranted}
                    className="px-2 py-1 text-[11px] font-semibold rounded-md text-primary-500 hover:bg-primary-500/15 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-[var(--text-muted)] text-[10px]">•</span>
                  <button
                    type="button"
                    onClick={() => onRevokeGroup(module.moduleCode, group.keys)}
                    disabled={isNoneGranted}
                    className="px-2 py-1 text-[11px] font-semibold rounded-md text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/15 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                  <div
                    onClick={() => toggleGroupCollapse(group.id)}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* Group Permissions Cards Grid */}
              {!isCollapsed && (
                <div className="p-3 sm:p-3.5 pt-1 border-t border-[var(--border-color)] bg-[var(--bg-card)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                    {groupPermissions.map((perm) => {
                      const isChecked = Boolean(selectedPermissions[perm.permissionKey]);
                      const isImpliedView =
                        perm.permissionKey === 'staff.view' && !isChecked && false;

                      const actionKey = perm.action === 'edit' ? 'update' : perm.action;
                      const actionBadgeClass =
                        ACTION_COLORS[actionKey] || 'bg-white/5 text-[var(--text-muted)]';

                      return (
                        <div
                          key={perm.permissionKey}
                          onClick={(e) => {
                            if (
                              e.target.closest('[role="switch"]') ||
                              e.target.closest('input') ||
                              e.target.closest('button')
                            ) {
                              return;
                            }
                            onTogglePermission(module.moduleCode, perm.action, perm);
                          }}
                          className={`p-2.5 sm:p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all cursor-pointer select-none ${
                            isChecked
                              ? 'bg-primary-500/10 border-primary-500/60 shadow-xs'
                              : 'bg-[var(--bg-input)] border-[var(--border-color)] hover:bg-white/5'
                          }`}
                        >
                          {/* Top: Label and Switch */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="font-semibold text-xs text-[var(--text-primary)] block leading-snug">
                                {perm.label}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)] font-mono block mt-0.5">
                                {perm.permissionKey}
                              </span>
                            </div>
                            <Toggle
                              checked={isChecked}
                              onChange={() =>
                                onTogglePermission(module.moduleCode, perm.action, perm)
                              }
                              size="sm"
                              color="primary"
                              aria-label={`Toggle ${perm.label}`}
                            />
                          </div>

                          {/* Bottom: Action Tag & Description */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border-color)]/60 text-[10px]">
                            <span
                              className={`px-1.5 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider text-[9px] border ${actionBadgeClass}`}
                            >
                              {perm.action === 'edit' ? 'update' : perm.action}
                            </span>
                            <span
                              className="text-[var(--text-muted)] truncate text-right max-w-[180px]"
                              title={perm.description || perm.label}
                            >
                              {perm.description || perm.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Extra Utilities (e.g. Export, Print) if present */}
        {extraPermissions.length > 0 && (
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)]/40 overflow-hidden">
            <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-primary-500" />
                <span className="font-bold text-xs text-[var(--text-primary)]">
                  Additional Staff Utilities & Export
                </span>
              </div>
            </div>
            <div className="p-3 sm:p-3.5 bg-[var(--bg-card)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {extraPermissions.map((perm) => {
                  const isChecked = Boolean(selectedPermissions[perm.permissionKey]);
                  return (
                    <div
                      key={perm.permissionKey}
                      onClick={() => onTogglePermission(module.moduleCode, perm.action, perm)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-primary-500/10 border-primary-500 shadow-xs'
                          : 'bg-[var(--bg-input)] border-[var(--border-color)] hover:bg-white/5'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)] block">
                          {perm.label}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">
                          {perm.permissionKey}
                        </span>
                      </div>
                      <Toggle
                        checked={isChecked}
                        onChange={() => onTogglePermission(module.moduleCode, perm.action, perm)}
                        size="sm"
                        color="primary"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPermissionGroups;
