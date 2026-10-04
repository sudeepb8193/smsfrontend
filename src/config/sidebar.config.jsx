import {
  LayoutDashboard,
  Building2,
} from 'lucide-react';

export const SIDEBAR_MODULE_CONFIG = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['SUPER_ADMIN', 'OWNER', 'BRANCH_MANAGER', 'ACCOUNTANT', 'FRONT_DESK', 'SERVICE_STAFF'],
    path: '/dashboard',
  },
  {
    id: 'organisations',
    label: 'Organisations',
    icon: Building2,
    allowedRoles: ['SUPER_ADMIN'],
    path: '/super-admin/organisations',
  },
];

export const getAuthorizedNavModules = (userRole = 'SUPER_ADMIN') => {
  return SIDEBAR_MODULE_CONFIG.filter((module) => {
    if (!module.allowedRoles || module.allowedRoles.length === 0) return true;
    return module.allowedRoles.includes(userRole);
  });
};
