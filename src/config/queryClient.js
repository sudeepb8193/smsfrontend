import { QueryClient } from '@tanstack/react-query';

/**
 * Production-Level Centralized QueryClient for the Salon Management System (SMS).
 * Implements intelligent caching, garbage collection, and strict multi-tenant isolation.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute freshness window
      gcTime: 5 * 60 * 1000, // 5 minutes cache retention
      refetchOnWindowFocus: false, // Prevent jarring refetches on window focus
      refetchOnReconnect: true, // Auto-revalidate on internet reconnection
      refetchOnMount: true, // Only revalidate if stale
      retry: 1, // Bounded retry for transient failures
    },
  },
});

/**
 * Parameter-aware, predictable hierarchical query key builders.
 * Ensures strict scoping by tenant context, branch context, and query filters.
 */
export const queryKeys = {
  staff: {
    all: ['staff'],
    lists: () => [...queryKeys.staff.all, 'list'],
    list: (orgId, branchId, params) => [
      ...queryKeys.staff.lists(),
      orgId || 'no-org',
      branchId || 'all-branches',
      params || {},
    ],
    details: () => [...queryKeys.staff.all, 'detail'],
    detail: (orgId, staffId) => [...queryKeys.staff.details(), orgId, staffId],
  },
  users: {
    all: ['users'],
    lists: () => [...queryKeys.users.all, 'list'],
    list: (orgId, params) => [...queryKeys.users.lists(), orgId || 'no-org', params || {}],
    details: () => [...queryKeys.users.all, 'detail'],
    detail: (orgId, userId) => [...queryKeys.users.details(), orgId, userId],
    roles: (orgId) => [...queryKeys.users.all, 'roles', orgId || 'no-org'],
  },
  branches: {
    all: ['branches'],
    lists: () => [...queryKeys.branches.all, 'list'],
    list: (orgId, params) => [
      ...queryKeys.branches.lists(),
      orgId || 'no-org',
      params || {},
    ],
    details: () => [...queryKeys.branches.all, 'detail'],
    detail: (orgId, branchId) => [...queryKeys.branches.details(), orgId, branchId],
  },
  organisations: {
    all: ['organisations'],
    lists: () => [...queryKeys.organisations.all, 'list'],
    list: (params) => [...queryKeys.organisations.lists(), params || {}],
    details: () => [...queryKeys.organisations.all, 'detail'],
    detail: (orgId) => [...queryKeys.organisations.details(), orgId],
    marketplace: () => [...queryKeys.organisations.all, 'marketplace'],
  },
  roles: {
    all: ['roles'],
    lists: () => [...queryKeys.roles.all, 'list'],
    list: (orgId, params) => [...queryKeys.roles.lists(), orgId || 'global', params || {}],
    permissions: (roleId) => [...queryKeys.roles.all, 'permissions', roleId],
    matrix: () => [...queryKeys.roles.all, 'matrix'],
    staffOverrides: (staffId) => [...queryKeys.roles.all, 'overrides', staffId],
  },
  staffDesignation: {
    all: ['staffDesignation'],
    tab: (tabName, staffId, orgId, params) => [
      ...queryKeys.staffDesignation.all,
      tabName,
      staffId,
      orgId || 'no-org',
      params || {},
    ],
  },
  staffScheduling: {
    all: ['staffScheduling'],
    tab: (tabName, orgId, branchId, params) => [
      ...queryKeys.staffScheduling.all,
      tabName,
      orgId || 'no-org',
      branchId || 'no-branch',
      params || {},
    ],
  },
  staffAttendance: {
    all: ['staffAttendance'],
    tab: (tabName, orgId, branchId, params) => [
      ...queryKeys.staffAttendance.all,
      tabName,
      orgId || 'no-org',
      branchId || 'no-branch',
      params || {},
    ],
  },
  staffLeave: {
    all: ['staffLeave'],
    types: (orgId, params) => [
      ...queryKeys.staffLeave.all,
      'types',
      orgId || 'no-org',
      params || {},
    ],
    balances: (orgId, branchId, params) => [
      ...queryKeys.staffLeave.all,
      'balances',
      orgId || 'no-org',
      branchId || 'all-branches',
      params || {},
    ],
    myBalances: (orgId, params) => [
      ...queryKeys.staffLeave.all,
      'myBalances',
      orgId || 'no-org',
      params || {},
    ],
    transactions: (orgId, params) => [
      ...queryKeys.staffLeave.all,
      'transactions',
      orgId || 'no-org',
      params || {},
    ],
    requests: (orgId, branchId, params) => [
      ...queryKeys.staffLeave.all,
      'requests',
      orgId || 'no-org',
      branchId || 'all-branches',
      params || {},
    ],
    myRequests: (orgId, params) => [
      ...queryKeys.staffLeave.all,
      'myRequests',
      orgId || 'no-org',
      params || {},
    ],
    approvals: (orgId, branchId, params) => [
      ...queryKeys.staffLeave.all,
      'approvals',
      orgId || 'no-org',
      branchId || 'all-branches',
      params || {},
    ],
    calendar: (orgId, branchId, params) => [
      ...queryKeys.staffLeave.all,
      'calendar',
      orgId || 'no-org',
      branchId || 'all-branches',
      params || {},
    ],
    blackout: (orgId, branchId, params) => [
      ...queryKeys.staffLeave.all,
      'blackout',
      orgId || 'no-org',
      branchId || 'all-branches',
      params || {},
    ],
    reports: (orgId, branchId, params) => [
      ...queryKeys.staffLeave.all,
      'reports',
      orgId || 'no-org',
      branchId || 'all-branches',
      params || {},
    ],
    tab: (tabName, orgId, branchId, params) => [
      ...queryKeys.staffLeave.all,
      tabName,
      orgId || 'no-org',
      branchId || 'no-branch',
      params || {},
    ],
  },
};

/**
 * Invalidate a specific feature's query cache upon mutations.
 */
export function invalidateModuleCache(moduleKey) {
  if (queryKeys[moduleKey]) {
    queryClient.invalidateQueries({ queryKey: queryKeys[moduleKey].all });
  }
}

/**
 * Strict Security Guard: Purge all cached server state on logout or organization switch
 * to completely eliminate cross-tenant data leakage risks.
 */
export function clearTenantCache() {
  queryClient.clear();
}

export default queryClient;

