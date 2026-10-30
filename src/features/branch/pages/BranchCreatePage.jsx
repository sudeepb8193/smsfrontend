import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BranchForm from '../components/BranchForm';
import { createBranch } from '../api/branchApi';
import { useBranch } from '../context/BranchContext';
import { toast } from 'sonner';

export const BranchCreatePage = () => {
  const navigate = useNavigate();
  const { refreshBranches, setCurrentBranch } = useBranch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (payload, isDraftExit) => {
    try {
      setIsSubmitting(true);
      const res = await createBranch(payload);
      const newBranch = res?.data || res;

      await refreshBranches();
      if (newBranch?.id) {
        setCurrentBranch(newBranch);
      }

      if (isDraftExit) {
        toast.success(`Draft branch "${newBranch.name}" created and saved.`);
      } else {
        toast.success(`Branch "${newBranch.name}" (${newBranch.code}) created successfully.`);
      }
      navigate('/branches');
    } catch (err) {
      console.error('Branch creation error:', err);
      toast.error(err?.message || 'Failed to create branch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <BranchForm
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
        onCancel={() => navigate('/branches')}
      />
    </div>
  );
};

export default BranchCreatePage;
