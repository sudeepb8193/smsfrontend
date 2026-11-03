import React, { useState } from 'react';
import Modal from '../../../../components/shared/Modal';
import Button from '../../../../components/shared/Button';
import Input from '../../../../components/shared/Input';
import CustomSelector from '../../../../components/shared/CustomSelector';
import MediaUpload from '../../../../components/shared/MediaUpload';
import DatePicker from '../../../../components/shared/DatePicker';

export function AddQualificationModal({
  isOpen,
  onClose,
  onSave,
  loading,
  initialType = 'formal_qualification',
}) {
  const [recordType, setRecordType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [issuingInstitution, setIssuingInstitution] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!title.trim()) {
      errs.title = recordType === 'formal_qualification' ? 'Qualification title is required' : 'Skill name is required';
    }
    if (issueDate && expiryDate && expiryDate < issueDate) {
      errs.expiryDate = 'Expiry date cannot be earlier than issue date';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onSave({
      recordType,
      title: title.trim(),
      issuingInstitution: recordType === 'formal_qualification' ? issuingInstitution : undefined,
      certificateNumber: recordType === 'formal_qualification' ? certificateNumber : undefined,
      issueDate: recordType === 'formal_qualification' && issueDate ? issueDate : undefined,
      expiryDate: recordType === 'formal_qualification' && expiryDate ? expiryDate : undefined,
      documentUrl: recordType === 'formal_qualification' ? documentUrl : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recordType === 'formal_qualification' ? 'Add Formal Qualification' : 'Add Skill Tag'}
      size={recordType === 'formal_qualification' ? 'large' : 'medium'}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="qualification-form"
            onClick={handleSubmit}
            variant="primary"
            loading={loading}
          >
            {recordType === 'formal_qualification' ? 'Save Qualification' : 'Add Skill Tag'}
          </Button>
        </div>
      }
    >
      <form id="qualification-form" noValidate onSubmit={handleSubmit} className="space-y-4">
        <div>
          <CustomSelector
            label="Record Type"
            value={recordType}
            onChange={(val) => setRecordType(val)}
            options={[
              { value: 'formal_qualification', label: 'Formal Qualification / Certificate' },
              { value: 'skill_tag', label: 'Skill Tag / Capability' },
            ]}
            isSearchable={false}
            isClearable={false}
          />
        </div>

        <div>
          <Input
            label={recordType === 'formal_qualification' ? 'Qualification Title' : 'Skill Name'}
            value={title}
            maxLength={150}
            showCharCount
            onChange={(e) => {
              setTitle(e.target.value.slice(0, 150));
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder={
              recordType === 'formal_qualification'
                ? 'e.g. Cosmetology Diploma, Hair Styling Certification'
                : 'e.g. Balayage, Bridal Makeup, Keratin Treatment'
            }
            error={errors.title}
            required
          />
        </div>

        {recordType === 'formal_qualification' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Issuing Institution"
                  value={issuingInstitution}
                  maxLength={150}
                  showCharCount
                  onChange={(e) => setIssuingInstitution(e.target.value.slice(0, 150))}
                  placeholder="e.g. L'Oréal Professional Academy"
                />
              </div>

              <div>
                <Input
                  label="Certificate / License Number"
                  value={certificateNumber}
                  maxLength={80}
                  showCharCount
                  onChange={(e) => setCertificateNumber(e.target.value.slice(0, 80))}
                  placeholder="e.g. CERT-2024-9981"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <DatePicker
                  label="Issue Date"
                  value={issueDate}
                  onChange={(val) => setIssueDate(val?.target?.value ?? val)}
                />
              </div>

              <div>
                <DatePicker
                  label="Expiry Date (For renewal tracking)"
                  value={expiryDate}
                  onChange={(val) => {
                    setExpiryDate(val?.target?.value ?? val);
                    if (errors.expiryDate) setErrors((prev) => ({ ...prev, expiryDate: undefined }));
                  }}
                  error={errors.expiryDate}
                />
              </div>
            </div>

            <div>
              <MediaUpload
                label="Attach Certificate / Credential Document (Optional)"
                helperText="Upload certificate image or scan · PNG, JPG up to 5 MB"
                value={documentUrl}
                onChange={(url) => setDocumentUrl(url)}
                folder="qualifications"
                aspectRatio="compact"
              />
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}

export default AddQualificationModal;
