import React from 'react';
import RolePermissionMatrix from '../components/RolePermissionMatrix';
import Button from '../../../components/shared/Button';
import Spinner from '../../../components/shared/Spinner';
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[var(--text-muted)]">
        <Spinner size="large" />
        <span className="mt-3 text-sm font-semibold">Loading Permission Matrix...</span>
      </div>
    );
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
