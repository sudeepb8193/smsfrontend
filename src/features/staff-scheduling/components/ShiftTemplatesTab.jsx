import React, { useState } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Badge from '../../../components/shared/Badge';
import SearchInput from '../../../components/shared/SearchInput';
import EmptyState from '../../../components/shared/EmptyState';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import Pagination from '../../../components/shared/Pagination';
import ShiftTemplateModal from './modals/ShiftTemplateModal';
import {
  Clock,
  Coffee,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Building2,
  ChevronLeft,
  ChevronRight,
  PowerOff,
  Power,
  Users,
} from 'lucide-react';

const COLOR_MAP = {
  blue: { bg: 'bg-blue-500', text: 'text-blue-500' },
  green: { bg: 'bg-emerald-500', text: 'text-emerald-500' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-500' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-500' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-500' },
  teal: { bg: 'bg-teal-500', text: 'text-teal-500' },
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-500' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500' },
  default: { bg: 'bg-slate-500', text: 'text-slate-500' },
};

export default function ShiftTemplatesTab({
  templates = [],
  branches = [],
  loading = false,
  onCreate,
  onUpdate,
  onRetire,
  onReactivate,
  onDelete,
}) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter templates by search
  const filteredTemplates = templates.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.branch?.name && t.branch.name.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredTemplates.length / pageSize) || 1;
  const pagedTemplates = filteredTemplates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (template) => {
    setEditingTemplate(template);
    setModalOpen(true);
  };

  const handleSubmitModal = async (payload) => {
    try {
      setActionLoading(true);
      if (editingTemplate) {
        await onUpdate(editingTemplate.id, payload);
      } else {
        await onCreate(payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      setActionLoading(true);
      await onDelete(deleteCandidate.id);
      setDeleteCandidate(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Templates Data Table Matching Image Panel 2 */}
      {filteredTemplates.length > 0 ? (
        <>
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs overflow-hidden">
            <div className="overflow-x-auto min-h-[220px]">
              <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)]/50 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Break</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4 text-center">Color</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Used In</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-xs">
                {pagedTemplates.map((tmpl) => {
                  const colorObj = COLOR_MAP[tmpl.colorTag] || COLOR_MAP.default;
                  const isActive = tmpl.status === 'active';
                  const isOrgWide = !tmpl.branchId;

                  return (
                    <tr
                      key={tmpl.id}
                      className="hover:bg-[var(--bg-card-hover)] transition-colors group"
                    >
                      {/* Name with colored dot */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${colorObj.bg} shrink-0`} />
                          <span className="font-bold text-[var(--text-primary)] hover:text-primary-500 cursor-pointer">
                            {tmpl.name}
                          </span>
                        </div>
                      </td>

                      {/* Hours */}
                      <td className="py-3.5 px-4 font-mono font-medium text-[var(--text-primary)]">
                        {tmpl.startTime} – {tmpl.endTime}
                      </td>

                      {/* Break */}
                      <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">
                        {tmpl.breakStartTime && tmpl.breakEndTime
                          ? `${tmpl.breakStartTime} – ${tmpl.breakEndTime}`
                          : '—'}
                      </td>

                      {/* Scope */}
                      <td className="py-3.5 px-4 text-[var(--text-secondary)] font-medium">
                        {isOrgWide ? 'Org-wide' : 'Branch'}
                      </td>

                      {/* Branch */}
                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        {tmpl.branch?.name || (isOrgWide ? '—' : 'Current Branch')}
                      </td>

                      {/* Color Preview */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block w-3.5 h-3.5 rounded-full ${colorObj.bg}`} />
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span
                            className={`font-semibold ${
                              isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-muted)]'
                            }`}
                          >
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Used In */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[var(--text-primary)]">
                        {tmpl.usedInCount || tmpl._count?.weeklyDays || 0}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 text-[var(--text-muted)]">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(tmpl)}
                            className="p-1.5 rounded-lg hover:text-primary-500 hover:bg-[var(--bg-input)] transition cursor-pointer"
                            title="Edit Template"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(tmpl)}
                            className="p-1.5 rounded-lg hover:text-blue-500 hover:bg-[var(--bg-input)] transition cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(tmpl)}
                            className="p-1.5 rounded-lg hover:text-rose-500 hover:bg-[var(--bg-input)] transition cursor-pointer"
                            title="Delete / Retire"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shared Pagination Component */}
        {filteredTemplates.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTemplates.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        )}
      </>
      ) : (
        <EmptyState
          title="No Shift Templates Found"
          description="Create your salon's recurring shift templates (such as Morning 9-5, Evening 1-9) to quickly schedule staff."
          actionLabel="Create Shift Template"
          onAction={handleOpenCreate}
        />
      )}

      {/* Shift Template Edit / Create Modal */}
      {modalOpen && (
        <ShiftTemplateModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmitModal}
          initialData={editingTemplate}
          branches={branches}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation */}
      {deleteCandidate && (
        <ConfirmDialog
          isOpen={!!deleteCandidate}
          title="Delete Shift Template"
          message={`Are you sure you want to delete or retire template "${deleteCandidate.name}"? If currently assigned to active staff schedules, it will be safely retired.`}
          confirmLabel="Delete Template"
          confirmVariant="danger"
          loading={actionLoading}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteCandidate(null)}
        />
      )}
    </div>
  );
}
