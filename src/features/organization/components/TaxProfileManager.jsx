import { useState } from 'react';
import { Receipt, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, LayoutGrid, List } from 'lucide-react';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Select from '../../../components/common/Select/Select';
import Badge from '../../../components/common/Badge/Badge';
import Modal from '../../../components/common/Modal/Modal';
import DataTable from '../../../components/tables/DataTable/DataTable';

export const TaxProfileManager = ({
  taxProfiles = [],
  onCreate,
  onUpdate,
  onDelete,
  saving = false,
  loading = false,
}) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);

  const [formData, setFormData] = useState({
    taxIdentifierType: 'gstin',
    taxIdentifierValue: '',
    taxName: '',
    legalName: '',
    verificationStatus: 'pending',
    defaultTaxRate: '18.00',
    filingFrequency: 'monthly',
  });

  const handleOpenModal = (tax = null) => {
    if (tax) {
      setEditingTax(tax);
      setFormData({
        taxIdentifierType: tax.taxIdentifierType || 'gstin',
        taxIdentifierValue: tax.taxIdentifierValue || '',
        taxName: tax.taxName || '',
        legalName: tax.legalName || '',
        verificationStatus: tax.verificationStatus || 'pending',
        defaultTaxRate: tax.defaultTaxRate ? tax.defaultTaxRate.toString() : '18.00',
        filingFrequency: tax.filingFrequency || 'monthly',
      });
    } else {
      setEditingTax(null);
      setFormData({
        taxIdentifierType: 'gstin',
        taxIdentifierValue: '',
        taxName: '',
        legalName: '',
        verificationStatus: 'pending',
        defaultTaxRate: '18.00',
        filingFrequency: 'monthly',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTax(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      defaultTaxRate: parseFloat(formData.defaultTaxRate),
    };

    if (editingTax) {
      await onUpdate(editingTax.id, payload);
    } else {
      await onCreate(payload);
    }
    handleCloseModal();
  };

  const taxTypeOptions = [
    { value: 'gstin', label: 'GSTIN (India)' },
    { value: 'vat', label: 'VAT (UK/EU/UAE)' },
    { value: 'ein', label: 'EIN (USA)' },
    { value: 'tin', label: 'TIN (Tax Identification Number)' },
    { value: 'pan', label: 'PAN (India)' },
    { value: 'other', label: 'Other Tax Registration' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending Verification' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const frequencyOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annual', label: 'Annual' },
  ];

  // Pagination slice
  const totalItems = taxProfiles.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTaxProfiles = taxProfiles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const columns = [
    {
      header: 'Tax Type',
      accessor: 'taxIdentifierType',
      cell: (row) => (
        <Badge variant="info">{row.taxIdentifierType?.toUpperCase()}</Badge>
      ),
    },
    {
      header: 'Tax Number / ID',
      accessor: 'taxIdentifierValue',
      cell: (row) => (
        <div className="font-mono font-bold text-[var(--text-primary)] tracking-wider">
          {row.taxIdentifierValue}
        </div>
      ),
    },
    {
      header: 'Tax Name',
      accessor: 'taxName',
      cell: (row) => (
        <div className="font-semibold text-[var(--text-primary)]">
          {row.taxName || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Tax Rate',
      accessor: 'defaultTaxRate',
      cell: (row) => (
        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
          {row.defaultTaxRate}%
        </span>
      ),
    },
    {
      header: 'Verification',
      accessor: 'verificationStatus',
      cell: (row) => (
        <Badge
          variant={
            row.verificationStatus === 'verified'
              ? 'success'
              : row.verificationStatus === 'rejected'
              ? 'danger'
              : 'warning'
          }
        >
          {row.verificationStatus?.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="small"
            icon={Edit2}
            onClick={() => handleOpenModal(row)}
          />
          <Button
            variant="ghost"
            size="small"
            icon={Trash2}
            className="text-rose-500 hover:text-rose-600"
            onClick={() => onDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Tax Registration & Compliance
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage tax profiles, GSTIN/VAT registrations, and default tax percentages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex items-center bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <List size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          <Button variant="primary" icon={Plus} onClick={() => handleOpenModal()}>
            Add Tax Profile
          </Button>
        </div>
      </div>

      {/* Table vs Grid View */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={paginatedTaxProfiles}
          loading={loading}
          emptyMessage="No tax profiles configured yet."
          pagination={{
            currentPage,
            totalPages,
            pageSize,
            totalItems,
            onPageChange: setCurrentPage,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedTaxProfiles.map((t) => (
            <Card
              key={t.id}
              title={t.taxName || t.taxIdentifierValue}
              subtitle={t.taxIdentifierType?.toUpperCase()}
              action={
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={Edit2}
                    onClick={() => handleOpenModal(t)}
                  />
                  <Button
                    variant="ghost"
                    size="small"
                    icon={Trash2}
                    className="text-rose-500 hover:text-rose-600"
                    onClick={() => onDelete(t.id)}
                  />
                </div>
              }
            >
              <div className="space-y-3 text-xs">
                <div className="font-mono font-bold text-sm text-[var(--text-primary)]">
                  {t.taxIdentifierValue}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)]">Default Tax Rate:</span>
                  <span className="font-bold text-emerald-500">{t.defaultTaxRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Status:</span>
                  <Badge
                    variant={
                      t.verificationStatus === 'verified'
                        ? 'success'
                        : t.verificationStatus === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {t.verificationStatus?.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTax ? 'Edit Tax Registration' : 'Add New Tax Profile'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Tax Type / Identifier"
            value={formData.taxIdentifierType}
            onChange={(e) => setFormData({ ...formData, taxIdentifierType: e.target.value })}
            options={taxTypeOptions}
            required
          />

          <Input
            label="Tax Registration Number"
            value={formData.taxIdentifierValue}
            onChange={(e) => setFormData({ ...formData, taxIdentifierValue: e.target.value })}
            placeholder="e.g. 22AAAAA0000A1Z5"
            required
          />

          <Input
            label="Tax Name / Label"
            value={formData.taxName}
            onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
            placeholder="e.g. GST Standard Rate"
            required
          />

          <Input
            label="Legal Name on Tax Document"
            value={formData.legalName}
            onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
            placeholder="e.g. Apex Salon Pvt Ltd"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Default Tax Rate (%)"
              type="number"
              step="0.01"
              value={formData.defaultTaxRate}
              onChange={(e) => setFormData({ ...formData, defaultTaxRate: e.target.value })}
              placeholder="18.00"
              required
            />

            <Select
              label="Filing Frequency"
              value={formData.filingFrequency}
              onChange={(e) => setFormData({ ...formData, filingFrequency: e.target.value })}
              options={frequencyOptions}
            />
          </div>

          <Select
            label="Verification Status"
            value={formData.verificationStatus}
            onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
            options={statusOptions}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingTax ? 'Update Tax Profile' : 'Save Tax Profile'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TaxProfileManager;
