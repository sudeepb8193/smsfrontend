import React, { useState } from 'react';
import { Copy, Loader2, Check, AlertCircle, ArrowRight, Clock3, Settings } from 'lucide-react';
import Modal from '../../../components/shared/Modal';
import CustomSelector from '../../../components/shared/CustomSelector';
import { copyBranchSettings } from '../api/branchApi';
import { useBranch } from '../context/BranchContext';
import { toast } from 'sonner';

export const CopySettingsModal = ({
  isOpen,
  onClose,
  targetBranch,
  onSuccess,
}) => {
  const { branches } = useBranch();
  const [sourceBranchId, setSourceBranchId] = useState('');
  const [copyHours, setCopyHours] = useState(true);
  const [copySettings, setCopySettings] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [error, setError] = useState(null);

  const availableSources = branches.filter((b) => b.id !== targetBranch?.id);

  const handleSourceChange = async (branchId) => {
    setSourceBranchId(branchId);
    setError(null);
    setPreviewData(null);

    if (!branchId || !targetBranch?.id) return;

    try {
      setPreviewLoading(true);
      const res = await copyBranchSettings(targetBranch.id, {
        sourceBranchId: branchId,
        previewOnly: true,
        copyHours,
        copySettings,
      });
      setPreviewData(res);
    } catch (err) {
      setError(err?.message || 'Failed to generate preview for copying settings');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleApply = async () => {
    if (!sourceBranchId || !targetBranch?.id) return;

    try {
      setApplyLoading(true);
      setError(null);
      await copyBranchSettings(targetBranch.id, {
        sourceBranchId,
        previewOnly: false,
        copyHours,
        copySettings,
      });
      toast.success(
        `Successfully copied settings from selected branch to "${targetBranch.name}".`,
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to apply copied settings');
    } finally {
      setApplyLoading(false);
    }
  };

  if (!targetBranch) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Copy Branch Settings"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-xs text-[var(--text-secondary)]">
          Replicate operating hours and baseline booking configurations from an existing salon location into <strong className="text-[var(--text-primary)]">{targetBranch.name}</strong>.
        </p>

        {/* Source Branch Picker */}
        <CustomSelector
          label="Select Source Branch"
          required
          options={availableSources.map((b) => ({
            value: b.id,
            label: `${b.name} (${b.code}) - ${b.branchType}`,
          }))}
          value={sourceBranchId}
          onChange={(val) => handleSourceChange(val)}
          placeholder="Choose a branch to copy from..."
          isSearchable
        />

        {/* Option toggles */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="flex items-center gap-2 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] cursor-pointer hover:border-primary-500/30">
            <input
              type="checkbox"
              checked={copyHours}
              onChange={(e) => setCopyHours(e.target.checked)}
              className="rounded text-primary-500 focus:ring-primary-500"
            />
            <div className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
              <Clock3 size={14} className="text-primary-500" />
              <span>Working Hours</span>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] cursor-pointer hover:border-primary-500/30">
            <input
              type="checkbox"
              checked={copySettings}
              onChange={(e) => setCopySettings(e.target.checked)}
              className="rounded text-primary-500 focus:ring-primary-500"
            />
            <div className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
              <Settings size={14} className="text-purple-500" />
              <span>Booking Rules</span>
            </div>
          </label>
        </div>

        {/* Preview Loading State */}
        {previewLoading && (
          <div className="flex items-center justify-center p-6 text-[var(--text-muted)]">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500 mr-2" />
            <span className="text-xs">Inspecting source configuration...</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Preview Summary */}
        {previewData && !previewLoading && (
          <div className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">
              <span className="flex items-center gap-1.5">
                <Copy size={14} className="text-primary-500" />
                Preview: {previewData.sourceBranch?.name}
              </span>
              <ArrowRight size={14} className="text-[var(--text-muted)]" />
              <span className="text-primary-500">{targetBranch.name}</span>
            </div>

            <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <div className="flex justify-between">
                <span>Custom Operating Days:</span>
                <strong className="text-[var(--text-primary)]">
                  {previewData.settingsToCopy?.businessHoursDaysCount ?? 0} days configured
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Online Booking Enabled:</span>
                <strong className="text-[var(--text-primary)]">
                  {previewData.settingsToCopy?.settingsSummary?.onlineBookingEnabled ? 'Yes' : 'No'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Walk-in Queue:</span>
                <strong className="text-[var(--text-primary)]">
                  {previewData.settingsToCopy?.settingsSummary?.walkinQueueEnabled ? 'Enabled' : 'Disabled'}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={onClose}
            disabled={applyLoading}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border-color)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!sourceBranchId || applyLoading || previewLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-primary-500 hover:bg-primary-600 text-white transition-colors disabled:opacity-50"
          >
            {applyLoading && <Loader2 size={14} className="animate-spin" />}
            <Check size={14} />
            <span>Confirm & Copy Settings</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CopySettingsModal;
