import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';

export const useUsers = (initialParams = {}) => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState(initialParams.search || '');
  const [roleFilter, setRoleFilter] = useState(initialParams.role || '');
  const [statusFilter, setStatusFilter] = useState(initialParams.status || 'all');
  const [page, setPage] = useState(initialParams.page || 1);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await userService.getUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 10,
      });
      setUsers(res.data || []);
      setMeta(res.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    meta,
    loading,
    error,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    refetch: fetchUsers,
  };
};

export default useUsers;
