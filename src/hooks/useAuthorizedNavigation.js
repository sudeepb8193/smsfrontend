import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { SIDEBAR_MODULE_CONFIG } from '../config/sidebar.config';
import { useAuth } from './useAuth';
import { hasPermission } from '../utils/permissionUtils';

const STATIC_ROUTE_TITLES = [
  { prefix: '/dashboard', title: 'Dashboard', subtitle: 'Overview & daily salon operations' },
  { prefix: '/users', title: 'User Management', subtitle: 'Accounts, roles & branch access' },
  { prefix: '/super-admin/organisations', title: 'Organisations & Setup', subtitle: 'Multi-tenant salon accounts' },
  { prefix: '/super-admin/roles', title: 'Roles & Access Control', subtitle: 'Role catalog & permission scopes' },
  { prefix: '/super-admin/permissions', title: 'Permission Catalog', subtitle: 'Granular system permissions' },
  { prefix: '/super-admin/staff-overrides', title: 'Staff Overrides', subtitle: 'User-level permission exceptions' },
  { prefix: '/owner/organisation', title: 'My Organization', subtitle: 'Business identity, hours & tax setup' },
  { prefix: '/branches', title: 'Branch Management', subtitle: 'Locations, hours & operational scopes' },
  { prefix: '/staff/me', title: 'My Profile', subtitle: 'Personal profile & assignments' },
  { prefix: '/staff', title: 'Staff Management', subtitle: 'Team directory, skills & assignments' },
  { prefix: '/scheduling/my-schedule', title: 'My Schedule', subtitle: 'Personal shifts & availability' },
  { prefix: '/scheduling', title: 'Staff Scheduling', subtitle: 'Shift templates & weekly rosters' },
  { prefix: '/attendance', title: 'Staff Attendance', subtitle: 'Daily check-ins, kiosk & approvals' },
  { prefix: '/leave/my-leave', title: 'My Leave', subtitle: 'Leave balance & time-off requests' },
  { prefix: '/leave', title: 'Staff Leave', subtitle: 'Leave policies, calendar & approvals' },
  { prefix: '/audit', title: 'Audit Logs', subtitle: 'Security & operational trail' },
  { prefix: '/customers', title: 'Customers Management', subtitle: 'Client profiles & visit history' },
  { prefix: '/appointments', title: 'Appointment Booking', subtitle: 'Live calendar & booking queue' },
  { prefix: '/services', title: 'Salon Services', subtitle: 'Service catalog, pricing & duration' },
  { prefix: '/products', title: 'Product Catalog', subtitle: 'Retail haircare & beauty products' },
  { prefix: '/inventory', title: 'Inventory & Stock', subtitle: 'Stock levels & reorder alerts' },
  { prefix: '/billing', title: 'Billing & POS', subtitle: 'Checkout, invoices & receipts' },
  { prefix: '/reports', title: 'Business Reports', subtitle: 'Revenue & operational analytics' },
  { prefix: '/settings', title: 'System Settings', subtitle: 'General preferences & policies' },
];

export const isSubtaskPathActive = (stPath, pathname, search = '') => {
  if (!stPath) return false;
  const fullPath = pathname + (search || '');
  if (pathname === stPath || fullPath === stPath) return true;
  if (
    stPath.includes('?') &&
    !search &&
    stPath.endsWith('tab=overview') &&
    pathname === stPath.split('?')[0]
  ) {
    return true;
  }
  if (pathname.startsWith(stPath + '/') && stPath !== '/') return true;
  return false;
};

export const isModulePathActive = (mod, pathname, search = '') => {
  const fullPath = pathname + (search || '');
  const isSubtaskActive = mod.subtasks?.some((st) =>
    isSubtaskPathActive(st.path, pathname, search),
  );
  const isDirectPathActive =
    mod.path &&
    (pathname === mod.path ||
      fullPath === mod.path ||
      (mod.path !== '/dashboard' && pathname.startsWith(mod.path + '/')));
  return Boolean(isDirectPathActive || isSubtaskActive);
};

export const getActivePageMeta = (authorizedModules, pathname, search = '') => {
  for (const mod of authorizedModules) {
    if (mod.subtasks?.length) {
      const activeSub = mod.subtasks.find((st) =>
        isSubtaskPathActive(st.path, pathname, search),
      );
      if (activeSub) {
        return {
          title: activeSub.label,
          subtitle: mod.label,
          moduleId: mod.id,
        };
      }
    }
  }

  const staticMatch = STATIC_ROUTE_TITLES.find((entry) =>
    pathname.startsWith(entry.prefix),
  );
  if (staticMatch) {
    return {
      title: staticMatch.title,
      subtitle: staticMatch.subtitle,
      moduleId: null,
    };
  }

  const activeMod = authorizedModules.find((mod) =>
    isModulePathActive(mod, pathname, search),
  );
  if (activeMod) {
    return {
      title: activeMod.label,
      subtitle: 'SalonFlow Pro Workspace',
      moduleId: activeMod.id,
    };
  }

  return {
    title: 'Workspace',
    subtitle: 'SalonFlow Pro',
    moduleId: null,
  };
};

/**
 * Shared RBAC-aware navigation hook consumed by both Classic and Modern Floating shells.
 * Preserves identical permission, role, and organization/branch filtering rules.
 */
export const useAuthorizedNavigation = () => {
  const { user, role: contextRole } = useAuth();
  const location = useLocation();

  const userRole = contextRole || user?.role || user?.roleSlug || user?.roleName || '';
  const normUserRole = String(userRole).toUpperCase().replace(/[\s_-]+/g, '_');
  const isSuperAdmin = normUserRole === 'SUPER_ADMIN' || normUserRole === 'SUPERADMIN';
  const isServiceStaff = normUserRole === 'SERVICE_STAFF' || normUserRole === 'STAFF';

  const authorizedModules = useMemo(() => {
    return SIDEBAR_MODULE_CONFIG.filter((module) => {
      if (isSuperAdmin) {
        if (module.id === 'organisations' || module.id === 'super-admin-roles') {
          return isSuperAdmin;
        }
        if (module.id === 'my-organisation') {
          return normUserRole === 'OWNER';
        }
        if (module.id.startsWith('my-') && module.id !== 'my-organisation') {
          return false;
        }
        return true;
      }

      if (module.requiredPermission) {
        if (!hasPermission(user, module.requiredPermission)) {
          return false;
        }
      }

      if (!module.allowedRoles || module.allowedRoles.length === 0) return true;
      if (!userRole) return false;
      return module.allowedRoles.some(
        (r) => r.toUpperCase().replace(/[\s_-]+/g, '_') === normUserRole,
      );
    });
  }, [isSuperAdmin, normUserRole, user, userRole]);

  const searchableNavItems = useMemo(() => {
    const items = [];
    authorizedModules.forEach((mod) => {
      if (mod.path) {
        items.push({
          id: mod.id,
          label: mod.label,
          group: 'Module',
          path: mod.path,
          icon: mod.icon,
        });
      }
      if (Array.isArray(mod.subtasks)) {
        mod.subtasks.forEach((st) => {
          items.push({
            id: `${mod.id}:${st.id}`,
            label: st.label,
            group: mod.label,
            path: st.path,
            icon: mod.icon,
          });
        });
      }
    });
    return items;
  }, [authorizedModules]);

  const activePageMeta = getActivePageMeta(
    authorizedModules,
    location.pathname,
    location.search,
  );

  return {
    authorizedModules,
    searchableNavItems,
    activePageMeta,
    userRole,
    normUserRole,
    isSuperAdmin,
    isServiceStaff,
  };
};
