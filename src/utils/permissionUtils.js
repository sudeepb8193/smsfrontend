/**
 * Centralized Permission Utilities for Salon Management System (SMS)
 * 
 * Evaluates user permissions dynamically against role assignments,
 * module codes, and standard actions:
 * - view
 * - create
 * - edit
 * - delete
 * - approve
 * - export
 * - print
 */

/**
 * Normalizes permission key string into canonical lowercase form
 */
export const normalizePermissionKey = (key) => {
  if (!key || typeof key !== 'string') return '';
  return key.trim().toLowerCase();
};

/**
 * Generates singular and plural aliases for a permission key
 * (e.g. 'branch.create' <-> 'branches.create')
 */
export const getPermissionAliases = (key) => {
  const normalized = normalizePermissionKey(key);
  if (!normalized) return [];

  const parts = normalized.split('.');
  if (parts.length !== 2) return [normalized];

  const [module, action] = parts;
  const aliases = new Set([normalized]);

  // Support spelling: organisation <-> organization
  const spellingVariants = [module];
  if (module.includes('organisation')) {
    spellingVariants.push(module.replace(/organisation/g, 'organization'));
  } else if (module.includes('organization')) {
    spellingVariants.push(module.replace(/organization/g, 'organisation'));
  }

  for (const m of spellingVariants) {
    aliases.add(`${m}.${action}`);
    if (m.endsWith('es')) {
      aliases.add(`${m.slice(0, -2)}.${action}`); // branches.create -> branch.create
    } else if (m.endsWith('s')) {
      aliases.add(`${m.slice(0, -1)}.${action}`); // users.view -> user.view, roles.edit -> role.edit, organizations.view -> organization.view
    } else {
      aliases.add(`${m}s.${action}`); // user.view -> users.view, role.edit -> roles.edit, organization.view -> organizations.view
      aliases.add(`${m}es.${action}`); // branch.create -> branches.create
    }
  }

  return Array.from(aliases);
};

/**
 * Check if the user has a specific permission (with optional branch scoping)
 * 
 * @param {Object} user - The authenticated user object from useAuth()
 * @param {string} permissionKey - e.g. 'branches.create', 'branch.create', 'users.view'
 * @param {string|null} branchId - Optional target branchId for branch scope restrictions
 * @returns {boolean}
 */
export const hasPermission = (user, permissionKey, branchId = null) => {
  if (!user) return false;

  const roleSlug = String(user?.roleSlug || user?.role || user?.roleName || '').toLowerCase().replace(/[\s_-]+/g, '-');
  const userRoles = (user?.roles || []).map((r) => String(r).toLowerCase().replace(/[\s_-]+/g, '-'));

  // 1. Super Admin has unrestricted authority across all modules
  if (
    roleSlug === 'super-admin' ||
    userRoles.includes('super-admin')
  ) {
    return true;
  }

  // 2. Wildcard check
  const permissionsList = Array.isArray(user?.permissions) ? user.permissions : [];
  if (permissionsList.includes('*')) {
    return true;
  }

  // 3. Match against permission aliases
  const targetAliases = getPermissionAliases(permissionKey);
  const matchedKey = targetAliases.find((alias) =>
    permissionsList.some((p) => normalizePermissionKey(p) === alias)
  );

  if (!matchedKey) {
    return false;
  }

  // 4. Branch Scope Evaluation (if target branchId is provided)
  if (branchId && Array.isArray(user?.effectivePermissions)) {
    const permEntry = user.effectivePermissions.find((ep) => {
      const epKey = normalizePermissionKey(ep.permissionKey);
      return targetAliases.includes(epKey);
    });

    if (permEntry) {
      if (permEntry.isAllBranches || permEntry.scope === 'all_branches') {
        return true;
      }
      if (Array.isArray(permEntry.allowedBranchIds) && permEntry.allowedBranchIds.length > 0) {
        return permEntry.allowedBranchIds.includes(branchId);
      }
      // If scoped to own_branch or restricted_branches but this branchId is not in allowed list
      return false;
    }
  }

  return true;
};

/**
 * Check if the user has at least one permission in the provided array
 */
export const hasAnyPermission = (user, permissionKeys = [], branchId = null) => {
  if (!Array.isArray(permissionKeys) || permissionKeys.length === 0) return true;
  return permissionKeys.some((key) => hasPermission(user, key, branchId));
};

/**
 * Check if the user has all permissions in the provided array
 */
export const hasAllPermissions = (user, permissionKeys = [], branchId = null) => {
  if (!Array.isArray(permissionKeys) || permissionKeys.length === 0) return true;
  return permissionKeys.every((key) => hasPermission(user, key, branchId));
};

/**
 * Global Real-Time Event & Channel to notify permission updates without page reload
 */
export const PERMISSIONS_UPDATED_EVENT = 'sms:permissions-updated';

export const notifyPermissionUpdate = (detail = {}) => {
  if (typeof window === 'undefined') return;

  const timestamp = Date.now();
  const payload = { timestamp, ...detail };

  // 1. Same-tab CustomEvent
  try {
    window.dispatchEvent(new CustomEvent(PERMISSIONS_UPDATED_EVENT, { detail: payload }));
  } catch (e) {
    console.warn('CustomEvent dispatch error:', e);
  }

  // 2. Cross-tab localStorage signal
  try {
    localStorage.setItem('sms_permissions_last_updated', timestamp.toString());
  } catch (e) {
    // Ignore storage quota or disabled storage
  }

  // 3. Cross-tab BroadcastChannel
  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('sms_permissions_sync');
      channel.postMessage({ type: 'PERMISSIONS_UPDATED', ...payload });
      channel.close();
    }
  } catch (e) {
    // Graceful fallback
  }
};
