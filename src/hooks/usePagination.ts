
import { useState, useEffect } from "react";

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
}

export const usePagination = ({ 
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0
}: PaginationOptions = {}) => {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    currentPage: initialPage,
    pageSize: initialPageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / initialPageSize))
  });

  // Update total pages when items count or page size changes
  useEffect(() => {
    setPaginationState(prev => ({
      ...prev,
      totalPages: Math.max(1, Math.ceil(prev.totalItems / prev.pageSize))
    }));
  }, [paginationState.totalItems, paginationState.pageSize]);

  const goToPage = (page: number) => {
    const safePage = Math.min(
      Math.max(1, page),
      paginationState.totalPages
    );
    
    setPaginationState(prev => ({
      ...prev,
      currentPage: safePage
    }));
  };

  const nextPage = () => {
    if (paginationState.currentPage < paginationState.totalPages) {
      goToPage(paginationState.currentPage + 1);
    }
  };

  const previousPage = () => {
    if (paginationState.currentPage > 1) {
      goToPage(paginationState.currentPage - 1);
    }
  };

  const setPageSize = (size: number) => {
    setPaginationState(prev => {
      const newTotalPages = Math.max(1, Math.ceil(prev.totalItems / size));
      const newCurrentPage = Math.min(prev.currentPage, newTotalPages);
      
      return {
        ...prev,
        pageSize: size,
        totalPages: newTotalPages,
        currentPage: newCurrentPage
      };
    });
  };

  const setTotalItems = (count: number) => {
    setPaginationState(prev => {
      const newTotalPages = Math.max(1, Math.ceil(count / prev.pageSize));
      const newCurrentPage = Math.min(prev.currentPage, newTotalPages);
      
      return {
        ...prev,
        totalItems: count,
        totalPages: newTotalPages,
        currentPage: newCurrentPage
      };
    });
  };

  return {
    ...paginationState,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    setTotalItems,
    // Calculate offset for database queries
    offset: (paginationState.currentPage - 1) * paginationState.pageSize,
    // Pagination info text
    paginationText: `Page ${paginationState.currentPage} of ${paginationState.totalPages}`
  };
};
