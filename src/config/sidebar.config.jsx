import {
  LayoutDashboard,
  Building2,
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
    label: 'Organization Setup',
    icon: Building2,
    allowedRoles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT'],
    subtasks: [
      { id: 'org-setup', label: 'Organization Setup', path: '/organization/setup' },
      { id: 'org-hours', label: 'Business Hours & Shifts', path: '/organization/business-hours' },
      { id: 'org-holidays', label: 'Holiday Calendar', path: '/organization/holidays' },
    ],
  },
  {
    id: 'staff',
    label: 'Staff',
    icon: Scissors,
    allowedRoles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'FRONT_DESK'],
    subtasks: [
      { id: 'user-roles', label: 'User Role Assignment', path: '/staff/users' },
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
