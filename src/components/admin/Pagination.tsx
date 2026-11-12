import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    onPageChange(page);
    // Scroll to top of table
    const tableElement = document.querySelector('[data-table-container]');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-3 sm:px-4 py-3 bg-gradient-to-r from-white to-[#F5F5F0]/30 border-t border-[#5E6B2F]/20 shadow-sm">
      {/* Info */}
      <div className="text-xs sm:text-sm text-[#77796D] font-medium">
        عرض {startItem} - {endItem} من {totalItems} عنصر
      </div>

      {/* Page Navigation */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 sm:p-2 rounded-lg border border-[#5E6B2F]/30 hover:bg-[#5E6B2F]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md"
        >
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#5E6B2F]" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={typeof page === 'string'}
              className={`
                w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300
                ${page === currentPage
                  ? 'bg-gradient-to-r from-[#5E6B2F] to-[#4a5525] text-white shadow-md hover:shadow-lg transform hover:scale-105'
                  : 'text-[#282A18] hover:bg-[#5E6B2F]/10 hover:shadow-sm'
                }
                ${typeof page === 'string' ? 'cursor-default opacity-60' : ''}
              `}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 sm:p-2 rounded-lg border border-[#5E6B2F]/30 hover:bg-[#5E6B2F]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md"
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#5E6B2F]" />
        </button>
      </div>

      {/* Items Per Page */}
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm text-[#77796D] font-medium">عرض:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-2 sm:px-3 py-1.5 rounded-lg border border-[#5E6B2F]/30 bg-white text-[#282A18] text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5E6B2F]/30 focus:border-[#5E6B2F] transition-all duration-300 hover:shadow-md"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}
