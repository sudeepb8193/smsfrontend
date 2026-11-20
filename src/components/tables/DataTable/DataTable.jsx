import React from 'react';
import EmptyState from '../../shared/EmptyState';
import TablePagination from '../TablePagination/TablePagination';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  isFetching = false,
  skeletonRows = 10,
  emptyMessage = 'No data available',
  pagination,
  onRowClick,
  className = '',
}) => {
  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      <div className="w-full overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-md relative">
        {/* Subtle background refetching / pagination indicator */}
        {isFetching && !loading && (
          <div className="w-full h-1 bg-primary-500/20 overflow-hidden absolute top-0 left-0 right-0 z-10">
            <div className="h-full bg-primary-500 animate-pulse motion-reduce:animate-none w-full" />
          </div>
        )}

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
              [...Array(skeletonRows)].map((_, rowIdx) => (
                <tr key={`skeleton-row-${rowIdx}`} className="animate-pulse motion-reduce:animate-none" aria-hidden="true">
                  {columns.map((col, colIdx) => (
                    <td key={col.id || col.accessor || colIdx} className={`p-4 align-middle ${col.className || ''}`}>
                      <div className="flex items-center gap-2">
                        {colIdx === 0 && (
                          <div className="w-7 h-7 rounded-full bg-slate-200/80 dark:bg-slate-800/70 shrink-0" />
                        )}
                        <div
                          className="h-3.5 bg-slate-200/80 dark:bg-slate-800/70 rounded-md"
                          style={{
                            width:
                              colIdx === 0
                                ? '65%'
                                : colIdx === columns.length - 1
                                  ? '40%'
                                  : `${50 + ((rowIdx * 17 + colIdx * 23) % 35)}%`,
                          }}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))
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
