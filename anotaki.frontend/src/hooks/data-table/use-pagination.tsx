import type { PaginatedDataResponse } from "@/types";

export function usePagination<T>(
  paginatedDataResponse?: PaginatedDataResponse<T>
) {
  const {
    page = 1,
    totalPages = 1,
    totalItems = 0,
    pageSize = 5,
  } = paginatedDataResponse ?? {};

  const currentPage = page;

  const startRange =
    totalItems === 0 ? 0 : Math.max(1, (currentPage - 1) * pageSize + 1);
  const isLastPage = currentPage === totalPages || totalPages === 0;

  const itemsOnCurrentPage =
    isLastPage && totalItems > 0
      ? Math.max(0, totalItems - (currentPage - 1) * pageSize)
      : totalItems > 0
      ? Math.min(pageSize, totalItems)
      : 0;

  const endRange =
    totalItems === 0
      ? 0
      : Math.min(totalItems, startRange + itemsOnCurrentPage - 1);

  const safeEndRange = totalItems > 0 ? Math.max(startRange, endRange) : 0;

  return {
    currentPage,
    totalPages: Math.max(0, totalPages),
    totalItems,
    pageSize,
    startRange,
    endRange: safeEndRange,
    isValidPage:
      totalItems === 0 || (currentPage >= 1 && currentPage <= totalPages),
    hasItems: totalItems > 0,
    isFirstPage: currentPage === 1,
    isLastPage,
  };
}
