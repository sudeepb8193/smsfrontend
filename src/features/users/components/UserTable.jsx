import React from 'react';
import DataTable from '../../../components/tables/DataTable/DataTable';
import Badge from '../../../components/common/Badge/Badge';
import TableActions from '../../../components/tables/TableActions/TableActions';
import { Mail, Phone } from 'lucide-react';

export const UserTable = ({ users = [], loading = false, onView, onEdit, onDelete }) => {
  const columns = [
    {
      header: 'User Details',
      cell: (row) => (
        <div>
          <div className="font-bold text-white text-sm">{row.displayName}</div>
          <div className="text-xs text-[#8E7A86] font-mono">
            UUID: {row.uuid ? row.uuid.substring(0, 16) : row.id}...
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      cell: (row) => (
        <div className="space-y-0.5 text-xs text-[#C4B5BE]">
          {row.email && (
            <div className="flex items-center gap-1.5">
              <Mail size={13} className="text-[#8E7A86]" />
              <span>{row.email}</span>
            </div>
          )}
          {row.phoneNumber && (
            <div className="flex items-center gap-1.5">
              <Phone size={13} className="text-[#8E7A86]" />
              <span>{row.phoneNumber}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (row) => <Badge variant="primary">{row.role || 'STAFF'}</Badge>,
    },
    {
      header: 'Status',
      cell: (row) => {
        const variant =
          row.status === 'ACTIVE'
            ? 'success'
            : row.status === 'PENDING'
            ? 'warning'
            : 'danger';
        return <Badge variant={variant}>{row.status || 'ACTIVE'}</Badge>;
      },
    },
    {
      header: 'Actions',
      cell: (row) => (
        <TableActions
          onView={onView ? () => onView(row) : undefined}
          onEdit={onEdit ? () => onEdit(row) : undefined}
          onDelete={onDelete ? () => onDelete(row) : undefined}
        />
      ),
    },
  ];

  return <DataTable columns={columns} data={users} loading={loading} emptyMessage="No user accounts found." />;
};

export default UserTable;
