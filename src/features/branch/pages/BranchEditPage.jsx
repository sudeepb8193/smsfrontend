import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Building2 } from 'lucide-react';
import BranchForm from '../components/BranchForm';
import { fetchBranchDetails, updateBranch } from '../api/branchApi';
import { useBranch } from '../context/BranchContext';
import { toast } from 'sonner';

export const BranchEditPage = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const { refreshBranches } = useBranch();

  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchBranchDetails(branchId);
        setBranch(res?.data || res);
      } catch (err) {
        console.error('Failed to load branch for editing:', err);
        setError(err?.message || 'Branch not found or inaccessible');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [branchId]);

  const handleUpdate = async (payload) => {
    try {
      setIsSubmitting(true);
      const res = await updateBranch(branchId, payload);
      const updated = res?.data || res;
      toast.success(`Branch "${updated.name}" updated successfully.`);
      await refreshBranches();
      navigate(`/branches/${branchId}`);
    } catch (err) {
      console.error('Branch update error:', err);
      toast.error(err?.message || 'Failed to update branch profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center text-[var(--text-muted)]">
        <Loader2 className="mb-2 h-7 w-7 animate-spin text-primary-500" />
        <p className="text-xs font-semibold">Loading branch details...</p>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="mx-auto max-w-[760px] rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 text-center my-6">
        <Building2 className="mx-auto mb-3 h-10 w-10 text-rose-500" />
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Branch Not Found</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/branches')}
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to branches
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[760px] mx-auto py-2 sm:py-4">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => navigate(`/branches/${branchId}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back to branch details</span>
        </button>

        <span className="text-xs font-mono font-bold text-primary-500 bg-primary-500/10 px-2.5 py-1 rounded-md">
          {branch.code}
        </span>
      </div>

      {/* Main Card Container */}
      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-6 sm:p-8 shadow-sm">
        <BranchForm
          initialValues={branch}
          onSubmit={handleUpdate}
          isSubmitting={isSubmitting}
          isEditMode={true}
          onCancel={() => navigate(`/branches/${branchId}`)}
        />
      </div>
    </div>
  );
};

export default BranchEditPage;
