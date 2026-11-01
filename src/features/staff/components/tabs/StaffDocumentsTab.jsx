import React, { useState } from 'react';
import Card from '../../../../components/shared/Card';
import Button from '../../../../components/shared/Button';
import Badge from '../../../../components/shared/Badge';
import CustomSelector from '../../../../components/shared/CustomSelector';
import EmptyState from '../../../../components/shared/EmptyState';
import { usePermission } from '../../../../hooks/usePermission';
import { UploadDocumentModal } from '../modals/UploadDocumentModal';
import {
  FileText,
  UploadCloud,
  Download,
  ExternalLink,
  History,
  Trash2,
  Clock,
} from 'lucide-react';

export function StaffDocumentsTab({
  documents = [],
  onUploadDocument,
  onDeleteDocument,
  loading,
}) {
  const { can } = usePermission();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewingHistoryDoc, setViewingHistoryDoc] = useState(null);

  const filteredDocuments = documents.filter((doc) => {
    if (selectedCategory && doc.category !== selectedCategory) return false;
    if (selectedStatus && doc.status !== selectedStatus) return false;
    return true;
  });

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'id_proof':
        return 'ID Proof';
      case 'employment_contract':
        return 'Employment Contract';
      case 'offer_letter':
        return 'Offer Letter';
      case 'background_check':
        return 'Background Check';
      default:
        return 'Other';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'superseded':
        return <Badge variant="warning">Superseded</Badge>;
      case 'expired':
        return <Badge variant="danger">Expired</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-color)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Employee HR Documents & Contracts
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Secure cloud storage for identity verification, legal compliance, and employment agreements.
            </p>
          </div>
          {(can('staff_document.create') ||
            can('staff_document.upload') ||
            can('staff_document.manage')) && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <UploadCloud size={14} className="mr-1.5" />
              Upload Document
            </Button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="w-56">
            <CustomSelector
              placeholder="All Categories"
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val || '')}
              options={[
                { value: '', label: 'All Categories' },
                { value: 'id_proof', label: 'ID Proof' },
                { value: 'employment_contract', label: 'Employment Contract' },
                { value: 'offer_letter', label: 'Offer Letter' },
                { value: 'background_check', label: 'Background Check' },
                { value: 'other', label: 'Other Documents' },
              ]}
              isSearchable={false}
              isClearable={false}
            />
          </div>

          <div className="w-48">
            <CustomSelector
              placeholder="All Statuses"
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val || '')}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'superseded', label: 'Superseded' },
                { value: 'expired', label: 'Expired' },
              ]}
              isSearchable={false}
              isClearable={false}
            />
          </div>
        </div>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents found"
            description="Upload compliance documents, identity proof, or employment agreements for this employee."
            action={
              (can('staff_document.create') ||
                can('staff_document.upload') ||
                can('staff_document.manage')) ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <UploadCloud size={14} className="mr-1.5" />
                  Upload First Document
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--bg-card-hover)] px-3 rounded-xl transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-[var(--text-primary)] text-sm truncate max-w-xs sm:max-w-md">
                        {doc.fileName}
                      </h4>
                      {getStatusBadge(doc.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[var(--text-muted)]">
                      <span className="font-semibold text-[var(--text-secondary)]">
                        {getCategoryLabel(doc.category)}
                      </span>
                      <span>•</span>
                      <span>{formatFileSize(doc.fileSizeBytes)}</span>
                      <span>•</span>
                      <span>Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Superseded Notice */}
                    {doc.supersededBy && (
                      <div className="flex items-center space-x-1.5 text-xs text-amber-600 dark:text-amber-400 mt-1">
                        <Clock size={12} />
                        <span>Superseded by newer revision</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  {doc.supersedesDocument &&
                    (can('staff_document.view') || can('staff_document.manage')) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingHistoryDoc(doc.supersedesDocument)}
                        className="text-xs"
                        title="View previous version replaced by this document"
                      >
                        <History size={14} className="mr-1" />
                        Prev Version
                      </Button>
                    )}

                  {(can('staff_document.view') || can('staff_document.download')) && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-primary-500 hover:border-primary-500 transition-colors"
                      title="View / Download Document"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}

                  {(can('staff_document.delete') || can('staff_document.manage')) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteDocument(doc.id)}
                      className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-2"
                      title="Delete Document"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Upload Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        existingDocuments={documents}
        onUpload={async (data) => {
          await onUploadDocument(data);
          setIsUploadModalOpen(false);
        }}
        loading={loading}
      />
    </div>
  );
}

export default StaffDocumentsTab;
