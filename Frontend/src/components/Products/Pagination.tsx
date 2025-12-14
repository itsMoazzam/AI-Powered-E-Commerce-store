interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 5;

    if (showEllipsis) {
      if (currentPage <= 3) {
        // Show first 3 pages, ellipsis, and last page
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show first page, ellipsis, and last 3 pages
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page, ellipsis, current page and neighbors, ellipsis, last page
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    } else {
      // Show all pages if total pages <= 5
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm md:text-base rounded border disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Back
      </button>

      <div className="flex flex-wrap justify-center gap-1 md:gap-2">
        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={`page-${page}-${index}`}
              onClick={() => onPageChange(page)}
              className={`px-2 md:px-3 py-1 text-sm md:text-base rounded ${currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'border hover:bg-gray-100'
                }`}
            >
              {page}
            </button>
          ) : (
            <span key={`page-ellipsis-${index}`} className="px-1 md:px-2 text-sm md:text-base self-center">
              {page}
            </span>
          )
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm md:text-base rounded border disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}