import React from 'react';
import { ArrowLeft, Loader2, Building2 } from 'lucide-react';
import BranchForm from '../components/BranchForm';
import UnauthorizedAccess from '../../../components/shared/UnauthorizedAccess';
import { useBranchEdit } from '../hooks/useBranch';

export const BranchEditPage = () => {
  const {
    branch,
    loading,
    isSubmitting,
    error,
    canEditBranch,
    handleUpdate,
    handleCancel,
    handleBackToBranches,
  } = useBranchEdit();

  if (!canEditBranch) {
    return (
      <UnauthorizedAccess
        title="Access Restricted"
        message="You do not have permission to edit salon branches in this organization."
        requiredPermission="branches.edit"
        resourceName="Edit Branch"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center text-[var(--text-muted)]">
        <Loader2 className="mb-2 h-7 w-7 animate-spin text-primary-500" />
        <p className="text-xs font-semibold">Loading branch details...</p>
      </div>
    );
  }

  if (error || !branch) {
    const isPermissionError = error && (
      String(error).toLowerCase().includes('permission') ||
      String(error).toLowerCase().includes('forbidden') ||
      String(error).toLowerCase().includes('403')
    );

    if (isPermissionError) {
      return (
        <UnauthorizedAccess
          title="Access Restricted"
          message={error}
          requiredPermission="branches.edit"
          resourceName="Edit Branch"
        />
      );
    }
    return (
      <div className="mx-auto max-w-[760px] rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 text-center my-6">
        <Building2 className="mx-auto mb-3 h-10 w-10 text-rose-500" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Branch Not Found</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{error}</p>
        <button
          type="button"
          onClick={handleBackToBranches}
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to branches
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <BranchForm
        initialValues={branch}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
        isEditMode={true}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default BranchEditPage;
