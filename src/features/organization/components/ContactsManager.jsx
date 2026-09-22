import React, { useState } from 'react';
import { Phone, Mail, Plus, Edit2, Trash2, CheckCircle2, LayoutGrid, List } from 'lucide-react';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Select from '../../../components/common/Select/Select';
import Badge from '../../../components/common/Badge/Badge';
import Modal from '../../../components/common/Modal/Modal';
import DataTable from '../../../components/tables/DataTable/DataTable';

export const ContactsManager = ({
  contacts = [],
  onCreate,
  onUpdate,
  onDelete,
  onSetDefaultPublic,
  saving = false,
  loading = false,
}) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const [formData, setFormData] = useState({
    contactType: 'primary',
    contactName: '',
    email: '',
    phoneCountryCode: '+91',
    phoneNumber: '',
    isDefaultPublic: false,
    sameAsPrimary: false,
  });

  const handleOpenModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        contactType: contact.contactType || 'primary',
        contactName: contact.contactName || '',
        email: contact.email || '',
        phoneCountryCode: contact.phoneCountryCode || '+91',
        phoneNumber: contact.phoneNumber || '',
        isDefaultPublic: contact.isDefaultPublic || false,
        sameAsPrimary: contact.sameAsPrimary || false,
      });
    } else {
      setEditingContact(null);
      setFormData({
        contactType: 'primary',
        contactName: '',
        email: '',
        phoneCountryCode: '+91',
        phoneNumber: '',
        isDefaultPublic: false,
        sameAsPrimary: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingContact) {
      await onUpdate(editingContact.id, formData);
    } else {
      await onCreate(formData);
    }
    handleCloseModal();
  };

  const contactTypeOptions = [
    { value: 'primary', label: 'Primary Contact' },
    { value: 'support', label: 'Customer Support' },
    { value: 'billing', label: 'Billing / Finance' },
    { value: 'emergency', label: 'Emergency Contact' },
  ];

  // Pagination slice
  const totalItems = contacts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedContacts = contacts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const columns = [
    {
      header: 'Type',
      accessor: 'contactType',
      cell: (row) => (
        <Badge
          variant={
            row.contactType === 'primary'
              ? 'primary'
              : row.contactType === 'support'
              ? 'info'
              : row.contactType === 'billing'
              ? 'warning'
              : 'danger'
          }
        >
          {row.contactType?.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Contact Name',
      accessor: 'contactName',
      cell: (row) => (
        <div className="font-bold text-[var(--text-primary)]">
          {row.contactName || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Email Address',
      accessor: 'email',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Mail size={14} />
          <span>{row.email || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: 'phoneNumber',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
          <Phone size={14} />
          <span>
            {row.phoneCountryCode} {row.phoneNumber}
          </span>
        </div>
      ),
    },
    {
      header: 'Public Status',
      accessor: 'isDefaultPublic',
      cell: (row) =>
        row.isDefaultPublic ? (
          <Badge variant="success">Default Public</Badge>
        ) : (
          <Button
            variant="ghost"
            size="small"
            onClick={() => onSetDefaultPublic(row.id)}
          >
            Make Public
          </Button>
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
            Contact Information Management
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage primary, support, billing, and emergency organization contacts.
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
            Add Contact
          </Button>
        </div>
      </div>

      {/* Content Rendering: Table or Grid */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={paginatedContacts}
          loading={loading}
          emptyMessage="No organization contacts configured yet."
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
          {paginatedContacts.map((c) => (
            <Card
              key={c.id}
              title={c.contactName || 'Unnamed Contact'}
              subtitle={c.contactType?.toUpperCase()}
              action={
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={Edit2}
                    onClick={() => handleOpenModal(c)}
                  />
                  <Button
                    variant="ghost"
                    size="small"
                    icon={Trash2}
                    className="text-rose-500 hover:text-rose-600"
                    onClick={() => onDelete(c.id)}
                  />
                </div>
              }
            >
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                  <Mail size={16} className="text-primary-500" />
                  <span>{c.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold">
                  <Phone size={16} className="text-primary-500" />
                  <span>
                    {c.phoneCountryCode} {c.phoneNumber || 'No phone'}
                  </span>
                </div>
                {c.isDefaultPublic ? (
                  <Badge variant="success">Default Public Contact</Badge>
                ) : (
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => onSetDefaultPublic(c.id)}
                  >
                    Set Default Public
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingContact ? 'Edit Contact Information' : 'Add New Organization Contact'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Contact Type"
            value={formData.contactType}
            onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
            options={contactTypeOptions}
            required
          />

          <Input
            label="Contact Name"
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            placeholder="e.g. Salon Front Desk"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="support@salon.com"
          />

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Code"
              value={formData.phoneCountryCode}
              onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
              placeholder="+91"
            />
            <Input
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="9876543210"
              className="col-span-2"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={formData.isDefaultPublic}
              onChange={(e) => setFormData({ ...formData, isDefaultPublic: e.target.checked })}
              className="w-4 h-4 rounded text-primary-600"
            />
            <span>Set as Default Public Contact for customer portal</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingContact ? 'Update Contact' : 'Save Contact'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ContactsManager;
