import {
  LayoutDashboard,
  Building2,
  Users,
  Scissors,
  ShieldAlert,
  Settings,
} from 'lucide-react';

export const SIDEBAR_MODULE_CONFIG = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'FRONT_DESK', 'SERVICE_STAFF'],
    path: '/dashboard',
  },
  {
    id: 'organization',
    label: 'Organization',
    icon: Building2,
    allowedRoles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT'],
    subtasks: [
      { id: 'org-profile', label: 'Business Profile', path: '/organization/profile' },
      { id: 'org-hours', label: 'Business Hours', path: '/organization/hours' },
      { id: 'org-holidays', label: 'Holiday Calendar', path: '/organization/holidays' },
    ],
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    allowedRoles: ['SUPER_ADMIN', 'BRANCH_MANAGER'],
    subtasks: [
      { id: 'user-credentials', label: 'Account Credentials & Invites', path: '/users/credentials', active: true },
      { id: 'user-roles', label: 'Role Permissions & Scopes', path: '/users/roles' },
      { id: 'user-security', label: 'Session Security & 2FA', path: '/users/security' },
    ],
  },
  {
    id: 'staff',
    label: 'Staff',
    icon: Scissors,
    allowedRoles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'FRONT_DESK'],
    subtasks: [
      { id: 'staff-directory', label: 'Staff HR Directory', path: '/staff/directory' },
      { id: 'staff-rosters', label: 'Shift Rosters & Schedules', path: '/staff/rosters' },
    ],
  },
  {
    id: 'audit',
    label: 'Security & Audit',
    icon: ShieldAlert,
    allowedRoles: ['SUPER_ADMIN'],
    subtasks: [
      { id: 'audit-history', label: 'Audit Activity History', path: '/audit/history' },
      { id: 'audit-incidents', label: 'Security Incident Log', path: '/audit/incidents' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    allowedRoles: ['SUPER_ADMIN', 'BRANCH_MANAGER'],
  },
];

export const getAuthorizedNavModules = (userRole = 'SUPER_ADMIN') => {
  return SIDEBAR_MODULE_CONFIG.filter((module) => {
    if (!module.allowedRoles || module.allowedRoles.length === 0) return true;
    return module.allowedRoles.includes(userRole);
  });
};
