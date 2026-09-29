"use client";

import React, { useEffect } from "react";
import { Icon } from "./Icon";
import clsx from "clsx";
import { useGlobal } from "@/context/GlobalContext";
import i18n from "@/app/components/i18n";
export interface PaginationProps {
  /**
   * Current page number (1-based)
   */
  page: number;
  /**
   * Number of items per page
   */
  pageSize: number;
  /**
   * Available page size options
   */
  pageSizeOptions?: number[];
  /**
   * Total number of items
   */
  total: number;
  /**
   * Callback when pagination state changes
   */
  onUpdate: (data: { page: number; pageSize: number }) => void;
  /**
   * Alignment of pagination controls
   */
  alignment?: 'start' | 'middle' | 'end';
  /**
   * Custom className
   */
  className?: string;
  showPageSize?:boolean;
  /**
   * Show text labels on Previous/Next buttons
   */
  showButtonText?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50, 100],
  total,
  onUpdate,
  alignment = 'end',
  className = "",
  showPageSize=false,
  showButtonText=false
}) => {
  const { theme, branding } = useGlobal();
  const keyset:any=i18n.keyset("language"); 

  // Calculate total pages
  const pageCount = Math.ceil(total / pageSize);
  // Calculate visible page numbers
  const getVisiblePages = (): (number | "ellipsis")[] => {
    const siblingCount = 1;

    // Show all pages if 5 or fewer
    if (pageCount <= 5) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, pageCount);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < pageCount - 1;

    // Pattern: 1, 2, 3, ..., last
    if (!shouldShowLeftDots && shouldShowRightDots) {
      return [1, 2, 3, "ellipsis", pageCount - 1, pageCount];
    }

    // Pattern: 1, ..., secondLast, last
    if (shouldShowLeftDots && !shouldShowRightDots) {
      return [1, 2, "ellipsis", pageCount - 2, pageCount - 1, pageCount];
    }

    // Pattern: 1, 2, ..., current, ..., last
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, 2, "ellipsis", ...middleRange, "ellipsis", pageCount - 1, pageCount];
    }

    return [];
  };
  const paginationRef = React.useRef<HTMLDivElement>(null);
  const [paginationHeight, setPaginationHeight] = React.useState(40);

  const visiblePages = getVisiblePages();

  // Calculate page info
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pageCount) {
      onUpdate({ page: newPage, pageSize });
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    onUpdate({ page: 1, pageSize: newPageSize }); // Reset to page 1 when changing page size
  };

  // Alignment classes
  const alignmentClasses = {
    start: 'justify-start',
    middle: 'justify-center',
    end: 'justify-end'
  };

  useEffect(() => {
    if (paginationRef.current) {
      if(paginationRef.current.offsetHeight){
        setPaginationHeight(paginationRef.current.offsetHeight);
      }
    }
  }, []);
  

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center ${alignmentClasses[alignment]} gap-4 ${className}`} ref={paginationRef}>
      {/* Pagination Controls */}
      <div className={clsx("flex items-center", showButtonText ? "gap-4" : "gap-2")}>
        {/* Page Size Selector */}
        {showPageSize&&(
        <div className="flex items-center gap-2 mr-4">
          <span className="text-gray-600 dark:text-gray-400">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="
              border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-800
              text-gray-700 dark:text-gray-300
              rounded
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        )}

        {/* First Page */}
        {/* {pageCount > 5 && (
          <Button
            className={buttonBaseClass}
            onClick={() => handlePageChange(1)}
            disabled={page <= 1}
            aria-label="First page"
          >
            <Icon data="FaFastBackward" size={16} />
          </Button>
        )} */}

        {/* Previous Page */}
        {showButtonText ? (
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="h-9 p-5 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Previous page"
          >
            <Icon data="FaArrowLeft" fillContainer={false} size={12} />
            <span className="text-sm font-medium leading-none">{`${keyset("Previous")}`}</span>
          </button>
        ) : (
          <div style={{ width: paginationHeight, height: paginationHeight, paddingTop: "0.5rem" }}>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="w-full h-full flex items-center justify-center p-0 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ color: "var(--brand-color)" }}
              aria-label="Previous page"
              onMouseEnter={(e) => {
                if (page > 1) {
                  e.currentTarget.style.backgroundColor = "var(--hover-color)";
                }
              }}
              onMouseLeave={(e) => {
                if (page > 1) {
                  e.currentTarget.style.backgroundColor = "";
                }
              }}
            >
              <Icon data="FaStepBackward" fillContainer={false} size={paginationHeight ? paginationHeight * 0.5 : 14} />
            </button>
          </div>
        )}

        {/* Page Numbers */}
        {showButtonText ? (
          <div className="flex items-center gap-0">
            {visiblePages.map((pageNum, index) => {
              if (pageNum === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="w-10 h-9 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm"
                  >
                    ...
                  </span>
                );
              }

              const isActive = pageNum === page;

              return (
                <button
                  key={pageNum}
                  className={clsx(
                    "w-10 h-9 flex items-center justify-center text-sm font-medium transition-colors",
                    isActive
                      ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                  onClick={() => handlePageChange(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        ) : (
          visiblePages.map((pageNum, index) => {
            if (pageNum === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex items-center justify-center text-gray-500 dark:text-gray-400"
                  style={{ width: paginationHeight, height: paginationHeight }}
                >
                  ...
                </span>
              );
            }

            const isActive = pageNum === page;

            return (
              <div key={pageNum} style={{ width: paginationHeight, height: paginationHeight, paddingTop: "0.5rem" }}>
                <button
                  className={clsx(
                    "w-full h-full flex items-center justify-center p-0 rounded transition-colors",
                    isActive
                      ? "text-white"
                      : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  )}
                  style={isActive ? { backgroundColor: "var(--selection-color)" } : undefined}
                  onClick={() => handlePageChange(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  aria-current={isActive ? "page" : undefined}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--hover-color)";
                  }}
                  onMouseLeave={(e) => {
                    if (isActive) {
                      e.currentTarget.style.backgroundColor = "var(--selection-color)";
                    } else {
                      e.currentTarget.style.backgroundColor = "";
                    }
                  }}
                >
                  {pageNum}
                </button>
              </div>
            );
          })
        )}

        {/* Next Page */}
        {showButtonText ? (
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= pageCount}
            className="h-9 p-5 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Next page"
          >
            <span className="text-sm font-medium leading-none">{`${keyset("Next")}`}</span>
            <Icon data="FaArrowRight" fillContainer={false} size={12} />
          </button>
        ) : (
          <div style={{ width: paginationHeight, height: paginationHeight, paddingTop: "0.5rem" }}>
            <button
              className="w-full h-full flex items-center justify-center p-0 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ color: "var(--brand-color)" }}
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pageCount}
              aria-label="Next page"
              onMouseEnter={(e) => {
                if (page < pageCount) {
                  e.currentTarget.style.backgroundColor = "var(--hover-color)";
                }
              }}
              onMouseLeave={(e) => {
                if (page < pageCount) {
                  e.currentTarget.style.backgroundColor = "";
                }
              }}
            >
              <Icon data="FaStepForward" fillContainer={false} size={paginationHeight ? paginationHeight * 0.5 : 16} />
            </button>
          </div>
        )}
          <button
            disabled={page >= pageCount}
            className="h-9 p-5 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Next page"
          >
            <span className="text-sm font-medium leading-none">{`${keyset("Total "+total||0)}`}</span>
          </button>
        {/* Last Page */}
        {/* {pageCount > 5 && (
          <Button
            className={buttonBaseClass}
            onClick={() => handlePageChange(pageCount)}
            disabled={page >= pageCount}
            aria-label="Last page"
          >
            <Icon data="FaFastForward" size={16} />
          </Button>
        )} */}
      </div>
    </div>
  );
};

export default Pagination;


