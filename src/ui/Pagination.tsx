interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex justify-start items-center space-x-2">
      {/* Previous Button */}
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 bg-buttonColor hover:bg-buttonColorHover text-white rounded-lg"
        >
          Previous
        </button>
      )}

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, i) => {
        const pageNumber = i + 1;

        // Show the first page, last page, current page, and pages around the current page
        if (
          pageNumber === 1 || // Always show the first page
          pageNumber === totalPages || // Always show the last page
          Math.abs(pageNumber - currentPage) <= 1 || // Show pages around the current page
          (pageNumber === 2 && currentPage > 3) || // Show ellipsis after the first page if needed
          (pageNumber === totalPages - 1 && currentPage < totalPages - 2) // Show ellipsis before the last page if needed
        ) {
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`px-3 py-1 ${
                currentPage === pageNumber
                  ? "bg-gradient-to-br from-buttonColor to-[#08527A] hover:bg-buttonColorHover text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-buttonColor hover:bg-opacity-65 hover:text-white"
              } rounded-lg`}
            >
              {pageNumber}
            </button>
          );
        }

        // Show ellipsis for skipped pages
        if (
          (pageNumber === 2 && currentPage > 4) || // Ellipsis after the first page
          (pageNumber === totalPages - 1 && currentPage < totalPages - 3) // Ellipsis before the last page
        ) {
          return <span key={pageNumber}>...</span>;
        }

        return null;
      })}

      {/* Next Button */}
      {currentPage !== totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 bg-gradient-to-br from-buttonColor to-[#08527A] hover:bg-buttonColorHover text-white rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      )}
    </div>
  );
}
