import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../Button/Button';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize,
  totalItems,
  className = '',
}) => {
  if (totalPages <= 1) return null;

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

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 py-3 px-1 text-sm ${className}`}>
      {totalItems !== undefined && (
        <div className="text-xs text-[#8E7A86] font-medium">
          Showing <span className="text-[#F9FAFB] font-semibold">{((currentPage - 1) * (pageSize || 10)) + 1}</span> to{' '}
          <span className="text-[#F9FAFB] font-semibold">{Math.min(currentPage * (pageSize || 10), totalItems)}</span> of{' '}
          <span className="text-[#F9FAFB] font-semibold">{totalItems}</span> entries
        </div>
      )}

      <div className="flex items-center gap-1.5 ml-auto">
        <Button
          variant="secondary"
          size="small"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          icon={ChevronLeft}
          aria-label="Previous page"
        />

        {getPageNumbers().map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onPageChange && onPageChange(num)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
              num === currentPage
                ? 'bg-[#8A4A52] text-white font-bold shadow-md'
                : 'bg-[#271820] text-[#C4B5BE] hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            {num}
          </button>
        ))}

        <Button
          variant="secondary"
          size="small"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          icon={ChevronRight}
          aria-label="Next page"
        />
      </div>
    </div>
  );
};

export default Pagination;
