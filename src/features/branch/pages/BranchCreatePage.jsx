import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import BranchForm from '../components/BranchForm';
import { createBranch } from '../api/branchApi';
import { useBranch } from '../context/BranchContext';
import { toast } from 'sonner';

export const BranchCreatePage = () => {
  const navigate = useNavigate();
  const { refreshBranches, setCurrentBranch } = useBranch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBranch, setCreatedBranch] = useState(null);

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
        navigate('/branches');
      } else {
        toast.success(`Branch "${newBranch.name}" (${newBranch.code}) created successfully.`);
        setCreatedBranch(newBranch);
      }
    } catch (err) {
      console.error('Branch creation error:', err);
      toast.error(err?.message || 'Failed to create branch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[760px] mx-auto py-2 sm:py-4">
      {/* Top Navigation & Exit Bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => navigate('/branches')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back to branches</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/branches')}
          className="text-xs font-medium text-[var(--text-secondary)] hover:text-primary-500 underline transition cursor-pointer"
        >
          Save & exit
        </button>
      </div>

      {/* Main Form Card Container */}
      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-6 sm:p-8 shadow-sm">
        {createdBranch ? (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Branch Successfully Created
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  <strong className="text-[var(--text-primary)] font-semibold">{createdBranch.name}</strong> ({createdBranch.code}) has been saved with status{' '}
                  <span className="font-semibold uppercase text-emerald-400">{createdBranch.status}</span>.
                </p>
                <p className="text-xs text-[var(--text-muted)] pt-1">
                  All branch profile, address, contact, and business hours details have been stored.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => navigate('/branches')}
                className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs sm:text-sm font-medium transition cursor-pointer"
              >
                Back to branches list
              </button>

              <button
                type="button"
                onClick={() => navigate(`/branches/${createdBranch.id}`)}
                className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-semibold transition shadow-sm cursor-pointer"
              >
                View branch details
              </button>
            </div>
          </div>
        ) : (
          <BranchForm
            onSubmit={handleCreate}
            isSubmitting={isSubmitting}
            onCancel={() => navigate('/branches')}
          />
        )}
      </div>
    </div>
  );
};

export default BranchCreatePage;
