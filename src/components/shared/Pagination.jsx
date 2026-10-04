import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CustomSelector from './CustomSelector';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  totalItems,
  className = '',
}) => {
  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const selectorOptions = pageSizeOptions.map((opt) => ({
    label: String(opt),
    value: Number(opt),
  }));

  const startEntry = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const endEntry = totalItems ? Math.min(currentPage * pageSize, totalItems) : 0;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm ${className}`}>
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>Show</span>
            <div className="w-20">
              <CustomSelector
                options={selectorOptions}
                value={pageSize}
                onChange={(val) => onPageSizeChange && onPageSizeChange(Number(val))}
                isSearchable={false}
                isClearable={false}
                direction="up"
                placeholder={String(pageSize)}
              />
            </div>
            <span>entries per page</span>
          </div>
        )}

        {totalItems !== undefined && (
          <div>
            Showing <span className="text-slate-900 dark:text-white font-semibold">{startEntry}</span> to{' '}
            <span className="text-slate-900 dark:text-white font-semibold">{endEntry}</span> of{' '}
            <span className="text-slate-900 dark:text-white font-semibold">{totalItems}</span> entries
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onPageChange && onPageChange(num)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
              num === currentPage
                ? 'bg-primary-500 text-white font-bold shadow-md shadow-primary-500/20'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
