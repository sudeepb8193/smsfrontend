import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Globe, LayoutGrid, List } from 'lucide-react';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Select from '../../../components/common/Select/Select';
import Badge from '../../../components/common/Badge/Badge';
import Modal from '../../../components/common/Modal/Modal';
import DataTable from '../../../components/tables/DataTable/DataTable';

export const AddressesManager = ({
  addresses = [],
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
  const [editingAddress, setEditingAddress] = useState(null);

  const [formData, setFormData] = useState({
    addressType: 'registered',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    landmark: '',
    googleMapsUrl: '',
    latitude: '',
    longitude: '',
  });

  const handleOpenModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        addressType: address.addressType || 'registered',
        addressLine1: address.addressLine1 || '',
        addressLine2: address.addressLine2 || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || '',
        landmark: address.landmark || '',
        googleMapsUrl: address.googleMapsUrl || '',
        latitude: address.latitude || '',
        longitude: address.longitude || '',
      });
    } else {
      setEditingAddress(null);
      setFormData({
        addressType: 'registered',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        landmark: '',
        googleMapsUrl: '',
        latitude: '',
        longitude: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
    };

    if (editingAddress) {
      await onUpdate(editingAddress.id, payload);
    } else {
      await onCreate(payload);
    }
    handleCloseModal();
  };

  const addressTypeOptions = [
    { value: 'registered', label: 'Registered Business Address' },
    { value: 'billing', label: 'Billing / Invoice Address' },
  ];

  // Pagination slice
  const totalItems = addresses.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedAddresses = addresses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const columns = [
    {
      header: 'Type',
      accessor: 'addressType',
      cell: (row) => (
        <Badge variant={row.addressType === 'registered' ? 'primary' : 'warning'}>
          {row.addressType?.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Street Address',
      cell: (row) => (
        <div className="font-bold text-[var(--text-primary)]">
          {row.addressLine1} {row.addressLine2 ? `, ${row.addressLine2}` : ''}
        </div>
      ),
    },
    {
      header: 'City & State',
      cell: (row) => (
        <div className="text-xs text-[var(--text-muted)]">
          {row.city}, {row.state} - {row.postalCode}
        </div>
      ),
    },
    {
      header: 'Country',
      accessor: 'country',
      cell: (row) => (
        <span className="text-xs font-semibold text-[var(--text-primary)]">
          {row.country}
        </span>
      ),
    },
    {
      header: 'Map Link',
      cell: (row) =>
        row.googleMapsUrl ? (
          <a
            href={row.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-primary-500 hover:underline flex items-center gap-1"
          >
            <Globe size={14} /> Open Map
          </a>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">N/A</span>
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
            Address & Location Management
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Configure official registered business and billing locations.
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
            Add Address
          </Button>
        </div>
      </div>

      {/* Table vs Grid View */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={paginatedAddresses}
          loading={loading}
          emptyMessage="No organization addresses configured yet."
          pagination={{
            currentPage,
            totalPages,
            pageSize,
            totalItems,
            onPageChange: setCurrentPage,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedAddresses.map((a) => (
            <Card
              key={a.id}
              title={`${a.city}, ${a.country}`}
              subtitle={a.addressType?.toUpperCase()}
              action={
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={Edit2}
                    onClick={() => handleOpenModal(a)}
                  />
                  <Button
                    variant="ghost"
                    size="small"
                    icon={Trash2}
                    className="text-rose-500 hover:text-rose-600"
                    onClick={() => onDelete(a.id)}
                  />
                </div>
              }
            >
              <div className="space-y-2 text-xs text-[var(--text-primary)]">
                <div className="font-bold">
                  {a.addressLine1} {a.addressLine2 ? `, ${a.addressLine2}` : ''}
                </div>
                <div className="text-[var(--text-muted)]">
                  {a.city}, {a.state} {a.postalCode}
                </div>
                {a.landmark && (
                  <div className="text-[var(--text-muted)]">Landmark: {a.landmark}</div>
                )}
                {a.googleMapsUrl && (
                  <a
                    href={a.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:underline font-bold inline-flex items-center gap-1 pt-1"
                  >
                    <Globe size={14} /> Open Google Maps
                  </a>
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
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Address Type"
            value={formData.addressType}
            onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
            options={addressTypeOptions}
            required
          />

          <Input
            label="Address Line 1"
            value={formData.addressLine1}
            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
            placeholder="Building / Flat / Street Name"
            required
          />

          <Input
            label="Address Line 2"
            value={formData.addressLine2}
            onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
            placeholder="Suite / Floor / Area"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. New York"
              required
            />
            <Input
              label="State / Province"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="e.g. NY"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Postal Code"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              placeholder="e.g. 10005"
              required
            />
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="e.g. USA"
              required
            />
          </div>

          <Input
            label="Landmark"
            value={formData.landmark}
            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
            placeholder="e.g. Near Central Metro Station"
          />

          <Input
            label="Google Maps URL"
            type="url"
            value={formData.googleMapsUrl}
            onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
            placeholder="https://maps.google.com/?q=..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingAddress ? 'Update Address' : 'Save Address'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AddressesManager;
