import React, { useState, useMemo } from 'react';
import { CalendarDays, Plus, Edit2, Trash2, Ban, RefreshCw, Search, LayoutGrid, List } from 'lucide-react';
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Select from '../../../components/common/Select/Select';
import Badge from '../../../components/common/Badge/Badge';
import Modal from '../../../components/common/Modal/Modal';
import DataTable from '../../../components/tables/DataTable/DataTable';

export const HolidayCalendarManager = ({
  holidays = [],
  onCreate,
  onUpdate,
  onCancel,
  onDelete,
  saving = false,
  loading = false,
}) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    holidayDate: new Date().toISOString().split('T')[0],
    isRecurring: false,
    status: 'active',
  });

  const handleOpenModal = (holiday = null) => {
    if (holiday) {
      setEditingHoliday(holiday);
      const rawDate = holiday.holidayDate
        ? new Date(holiday.holidayDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      setFormData({
        name: holiday.name || '',
        description: holiday.description || '',
        holidayDate: rawDate,
        isRecurring: holiday.isRecurringAnnually ?? holiday.isRecurring ?? false,
        status: holiday.status || 'active',
      });
    } else {
      setEditingHoliday(null);
      setFormData({
        name: '',
        description: '',
        holidayDate: new Date().toISOString().split('T')[0],
        isRecurring: false,
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHoliday(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingHoliday) {
      await onUpdate(editingHoliday.id, formData);
    } else {
      await onCreate(formData);
    }
    handleCloseModal();
  };

  // Filter holidays
  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) => {
      const matchesSearch =
        !searchQuery ||
        h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || h.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [holidays, searchQuery, statusFilter]);

  // Pagination slice
  const totalItems = filteredHolidays.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedHolidays = filteredHolidays.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active Holidays Only' },
    { value: 'cancelled', label: 'Cancelled Holidays' },
  ];

  const columns = [
    {
      header: 'Holiday Name',
      cell: (row) => (
        <div>
          <div className="font-bold text-[var(--text-primary)]">{row.name}</div>
          {row.description && (
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Calendar Date',
      cell: (row) => (
        <div className="font-mono font-semibold text-[var(--text-primary)] text-xs">
          {new Date(row.holidayDate).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      ),
    },
    {
      header: 'Recurrence',
      cell: (row) =>
        row.isRecurringAnnually || row.isRecurring ? (
          <Badge variant="primary">Annual Recurrence</Badge>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">One-time</span>
        ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'danger'}>
          {row.status?.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="small"
            icon={Edit2}
            onClick={() => handleOpenModal(row)}
          />
          {row.status === 'active' && (
            <Button
              variant="ghost"
              size="small"
              icon={Ban}
              title="Cancel Holiday"
              className="text-amber-500 hover:text-amber-600"
              onClick={() => onCancel(row.id)}
            />
          )}
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
            Holiday Calendar Management
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Configure organization and branch holidays, annual recurring closures, and state transitions.
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
            Add Holiday
          </Button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search holiday name or description..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:col-span-2"
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusOptions}
        />
      </div>

      {/* Table vs Grid View */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={paginatedHolidays}
          loading={loading}
          emptyMessage="No holiday dates matching search criteria."
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
          {paginatedHolidays.map((h) => (
            <Card
              key={h.id}
              title={h.name}
              subtitle={new Date(h.holidayDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              action={
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={Edit2}
                    onClick={() => handleOpenModal(h)}
                  />
                  {h.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="small"
                      icon={Ban}
                      className="text-amber-500 hover:text-amber-600"
                      onClick={() => onCancel(h.id)}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="small"
                    icon={Trash2}
                    className="text-rose-500 hover:text-rose-600"
                    onClick={() => onDelete(h.id)}
                  />
                </div>
              }
            >
              <div className="space-y-3 text-xs">
                {h.description && (
                  <p className="text-[var(--text-muted)] line-clamp-2">{h.description}</p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)]">Recurrence:</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {h.isRecurringAnnually || h.isRecurring ? 'Annual' : 'One-time'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Status:</span>
                  <Badge variant={h.status === 'active' ? 'success' : 'danger'}>
                    {h.status?.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingHoliday ? 'Edit Holiday Date' : 'Add New Holiday'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Holiday Title"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Independence Day"
            required
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Annual national holiday closure"
          />

          <Input
            label="Calendar Date (YYYY-MM-DD)"
            type="date"
            value={formData.holidayDate}
            onChange={(e) => setFormData({ ...formData, holidayDate: e.target.value })}
            required
          />

          <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="w-4 h-4 rounded text-primary-600"
            />
            <span>Repeats Annually Every Year (Annual Recurrence)</span>
          </label>

          {editingHoliday && (
            <Select
              label="Holiday Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active Holiday' },
                { value: 'cancelled', label: 'Cancelled Holiday' },
              ]}
            />
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingHoliday ? 'Update Holiday' : 'Save Holiday'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HolidayCalendarManager;
