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
    label: 'Organisations & Setup',
    icon: Building2,
    allowedRoles: ['SUPER_ADMIN'],
    path: '/super-admin/organisations',
  },
  {
    id: 'my-organisation',
    label: 'My Organization',
    icon: Building2,
    allowedRoles: ['OWNER'],
    path: '/owner/organisation/setup',
  },
];

export const getAuthorizedNavModules = (userRole = 'SUPER_ADMIN') => {
  const normalizedRole = String(userRole).toUpperCase().replace(/[\s-]+/g, '_');
  return SIDEBAR_MODULE_CONFIG.filter((module) => {
    if (!module.allowedRoles || module.allowedRoles.length === 0) return true;
    return module.allowedRoles.some(
      (allowedRole) =>
        allowedRole.toUpperCase().replace(/[\s-]+/g, '_') === normalizedRole,
    );
  });
};
