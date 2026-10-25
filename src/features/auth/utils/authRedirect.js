/**
 * Safe Role-Based Redirection Helper
 * Validates return paths to prevent open-redirect vulnerabilities
 * Resolves destination according to the authenticated user's role
 */

export const sanitizeReturnUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  // Disallow external URLs, protocol-relative URLs (//), javascript:, and data:
  if (
    trimmed.startsWith('//') ||
    trimmed.includes('://') ||
    trimmed.toLowerCase().startsWith('javascript:') ||
    trimmed.toLowerCase().startsWith('data:')
  ) {
    return null;
  }
  // Must be an internal path starting with /
  if (trimmed.startsWith('/')) {
    // Avoid redirect loops back to login/register
    if (trimmed.startsWith('/login') || trimmed.startsWith('/register')) {
      return null;
    }
    return trimmed;
  }
  return null;
};

export const resolveRoleDestination = (user, explicitReturnUrl = null) => {
  const safeReturn = sanitizeReturnUrl(explicitReturnUrl);
  if (safeReturn) {
    return safeReturn;
  }

  if (!user) {
    return '/login';
  }

  // Extract primary role name or slug
  const rawRole =
    user.roleSlug ||
    user.role ||
    user.roleName ||
    (user.roles && user.roles[0]) ||
    '';

  const normalized = String(rawRole).toUpperCase().replace(/[\s-]+/g, '_');

  // Customer role destination
  if (normalized === 'CUSTOMER') {
    return '/dashboard';
  }

  // Owner destination
  if (normalized === 'OWNER') {
    return '/dashboard';
  }

  // Admin / Super Admin destination
  if (normalized === 'SUPER_ADMIN' || normalized === 'ADMIN') {
    return '/dashboard';
  }

  // Staff roles (Branch Manager, Front Desk, Service Staff, Inventory Manager, Accountant, etc.)
  if (
    normalized === 'BRANCH_MANAGER' ||
    normalized === 'FRONT_DESK' ||
    normalized === 'SERVICE_STAFF' ||
    normalized === 'STAFF' ||
    normalized === 'INVENTORY_MANAGER' ||
    normalized === 'ACCOUNTANT' ||
    normalized === 'MARKETING_MANAGER'
  ) {
    return '/dashboard';
  }

  // Safe fallback
  return '/dashboard';
};
