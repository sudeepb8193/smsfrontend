import React from 'react';
import RolePermissionMatrix from '../components/RolePermissionMatrix';
import Button from '../../../components/shared/Button';
import Loader from '../../../components/shared/Loader';
import { ArrowLeft } from 'lucide-react';
import { useRolePermissions } from '../hooks/useRolePermission';

export const RolePermissionsPage = ({ isSuperAdminView = false }) => {
  const {
    role,
    matrixTemplate,
    initialAssignments,
    branches,
    versionToken,
    loading,
    saving,
    concurrencyConflict,
    loadData,
    handleSave,
    handleBack,
  } = useRolePermissions({ isSuperAdminView });

  if (loading && !role) {
    return <Loader type="table" rows={10} columns={6} text="Loading Permission Matrix..." />;
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="small"
          icon={ArrowLeft}
          onClick={handleBack}
        >
          Back to Roles
        </Button>
      </div>

      {/* Permission Matrix */}
      <RolePermissionMatrix
        role={role}
        matrixTemplate={matrixTemplate}
        initialAssignments={initialAssignments}
        branches={branches}
        versionToken={versionToken}
        onSave={handleSave}
        loading={loading}
        saving={saving}
        concurrencyConflict={concurrencyConflict}
        onResolveConflict={loadData}
      />
    </div>
  );
};

export default RolePermissionsPage;
