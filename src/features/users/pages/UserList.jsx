import React from 'react';
import PageHeader from '../../../components/layout/PageHeader/PageHeader';
import Button from '../../../components/common/Button/Button';
import Card from '../../../components/common/Card/Card';
import SearchInput from '../../../components/common/SearchInput/SearchInput';
import CustomSelector from '../../../components/common/CustomSelector/CustomSelector';
import UserTable from '../components/UserTable';
import useUsers from '../hooks/useUsers';
import { Plus, Users } from 'lucide-react';

export const UserList = () => {
  const {
    users,
    loading,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
  } = useUsers();

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
    { value: 'BRANCH_MANAGER', label: 'Branch Manager' },
    { value: 'ACCOUNTANT', label: 'Accountant' },
    { value: 'FRONT_DESK', label: 'Front Desk' },
    { value: 'SERVICE_STAFF', label: 'Service Staff' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending Invite' },
    { value: 'expired', label: 'Expired' },
    { value: 'deactivated', label: 'Deactivated' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage staff credentials, invitations, roles, and authentication security."
        action={
          <Button variant="primary" icon={Plus}>
            Add User
          </Button>
        }
      />

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SearchInput
            placeholder="Search users by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <CustomSelector
            placeholder="Filter by Role"
            options={roleOptions}
            value={roleFilter}
            onChange={setRoleFilter}
            isSearchable={false}
          />
          <CustomSelector
            placeholder="Filter by Status"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            isSearchable={false}
          />
        </div>
      </Card>

      <Card>
        <UserTable users={users} loading={loading} />
      </Card>
    </div>
  );
};

export default UserList;
