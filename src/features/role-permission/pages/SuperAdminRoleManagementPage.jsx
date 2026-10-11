import React from 'react';
import RoleListPage from './RoleListPage';

export const SuperAdminRoleManagementPage = () => {
  return (
    <RoleListPage
      isSuperAdminView={true}
    />
  );
};

export default SuperAdminRoleManagementPage;

