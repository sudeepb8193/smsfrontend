import React from 'react';
import BranchForm from '../components/BranchForm';
import UnauthorizedAccess from '../../../components/shared/UnauthorizedAccess';
import { useBranchCreate } from '../hooks/useBranch';

export const BranchCreatePage = () => {
  const { canCreateBranch, isSubmitting, handleCreate, handleCancel } = useBranchCreate();

  if (!canCreateBranch) {
    return (
      <UnauthorizedAccess
        title="Access Restricted"
        message="You do not have permission to create salon branches in this organization."
        requiredPermission="branches.create"
        resourceName="Create Branch"
      />
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <BranchForm
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default BranchCreatePage;
