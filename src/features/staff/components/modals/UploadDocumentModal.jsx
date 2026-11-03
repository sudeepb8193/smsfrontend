import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import CustomSelector from '../../../../components/shared/CustomSelector';
import MediaUpload from '../../../../components/shared/MediaUpload';
import Toggle from '../../../../components/shared/Toggle';

export function UploadDocumentModal({
  isOpen,
  onClose,
  existingDocuments = [],
  onUpload,
  loading,
}) {
  const [category, setCategory] = useState('id_proof');
  const [customFileName, setCustomFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isRenewal, setIsRenewal] = useState(false);
  const [supersedesDocumentId, setSupersedesDocumentId] = useState('');
  const [errors, setErrors] = useState({});

  const eligiblePredecessors = existingDocuments.filter(
    (d) => d.status === 'active' && d.category === category,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!customFileName.trim()) errs.customFileName = 'File name is required';
    if (!fileUrl) errs.fileUrl = 'Please upload a document file';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    onUpload({
      category,
      fileName: customFileName.trim(),
      fileUrl,
      fileSizeBytes: 1024 * 1024, // approx or handled by backend
      supersedesDocumentId: isRenewal && supersedesDocumentId ? supersedesDocumentId : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Employee Document"
      size="medium"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="upload-document-form"
            onClick={handleSubmit}
            variant="primary"
            loading={loading}
          >
            Upload Document
          </Button>
        </div>
      }
    >
      <form id="upload-document-form" noValidate onSubmit={handleSubmit} className="space-y-4">
        <div>
          <CustomSelector
            label="Document Category"
            value={category}
            onChange={(val) => {
              setCategory(val);
              setSupersedesDocumentId('');
            }}
            options={[
              { value: 'id_proof', label: 'Government ID Proof' },
              { value: 'employment_contract', label: 'Employment Contract' },
              { value: 'offer_letter', label: 'Offer Letter' },
              { value: 'background_check', label: 'Background Check' },
              { value: 'other', label: 'Other Document' },
            ]}
            isSearchable={false}
            isClearable={false}
            required
          />
        </div>

        <div>
          <Input
            label="Display File Name"
            value={customFileName}
            maxLength={255}
            showCharCount
            onChange={(e) => {
              setCustomFileName(e.target.value.slice(0, 255));
              if (errors.customFileName) setErrors((prev) => ({ ...prev, customFileName: undefined }));
            }}
            placeholder="e.g. Passport_Scan_2026.png or Contract_Signed.pdf"
            error={errors.customFileName}
            required
          />
        </div>

        <div>
          <MediaUpload
            label="Document File (Max 10 MB)"
            helperText="Upload image or document scan · PNG, JPG, WebP"
            value={fileUrl}
            onChange={(url, res) => {
              setFileUrl(url);
              if (errors.fileUrl) setErrors((prev) => ({ ...prev, fileUrl: undefined }));
              if (!customFileName && res?.name) {
                setCustomFileName(res.name);
              }
            }}
            folder="staff-documents"
            maxSizeMB={10}
            aspectRatio="wide"
            required
          />
          {errors.fileUrl && (
            <span className="block mt-1 text-xs text-rose-500 font-medium" role="alert">
              {errors.fileUrl}
            </span>
          )}
        </div>

        {/* Document Renewal / Supersede Option */}
        <div className="pt-2 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Is this a renewal of an existing document?
              </span>
              <p className="text-xs text-[var(--text-muted)]">
                Marks previous version as superseded while retaining historical document records.
              </p>
            </div>
            <Toggle checked={isRenewal} onChange={(checked) => setIsRenewal(checked)} />
          </div>

          {isRenewal && (
            <div className="mt-2">
              <CustomSelector
                label="Select Document to Supersede"
                placeholder="Choose active document to supersede..."
                value={supersedesDocumentId}
                onChange={(val) => setSupersedesDocumentId(val)}
                options={eligiblePredecessors.map((d) => ({
                  value: d.id,
                  label: `${d.fileName} (Uploaded: ${new Date(d.createdAt).toLocaleDateString()})`,
                }))}
                isSearchable={true}
                isClearable={true}
                helperText={
                  eligiblePredecessors.length === 0
                    ? 'No other active documents exist under this category.'
                    : undefined
                }
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default UploadDocumentModal;
