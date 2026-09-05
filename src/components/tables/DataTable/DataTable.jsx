import React from 'react';
import Spinner from '../../common/Spinner/Spinner';
import EmptyState from '../../common/EmptyState/EmptyState';
import TablePagination from '../TablePagination/TablePagination';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  pagination,
  onRowClick,
  className = '',
}) => {
  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      <div className="w-full overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={col.id || col.accessor || idx} className={`p-4 ${col.headerClassName || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)] text-sm text-[var(--text-primary)]">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-12 text-center text-[#8E7A86]">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Spinner size="large" color="#8A4A52" />
                    <span>Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <EmptyState title={emptyMessage} description="No data matches your current criteria." />
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || row._id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors hover:bg-white/5 ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={col.id || col.accessor || colIdx} className={`p-4 align-middle ${col.className || ''}`}>
                      {col.cell ? col.cell(row) : col.accessor ? row[col.accessor] : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && <TablePagination {...pagination} />}
    </div>
  );
};

export default DataTable;
