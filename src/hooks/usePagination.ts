
import { useState, useEffect } from "react";

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  goToPage: (page: number) => void;
}

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
  pageSize?: number;  // Added this property to fix the TypeScript error
  totalCount?: number; // Added this property to fix the TypeScript error
}

export const usePagination = ({ 
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0,
  totalCount = 0, // Added parameter with default value
  pageSize = 10     // Added pageSize parameter with default value
}: PaginationOptions = {}) => {
  // Use totalCount if provided, otherwise fallback to totalItems for backward compatibility
  const actualTotalItems = totalCount > 0 ? totalCount : totalItems;
  
  const [paginationState, setPaginationState] = useState<Omit<PaginationState, 'goToPage'>>({
    currentPage: initialPage,
    pageSize: initialPageSize,
    totalItems: actualTotalItems,
    totalPages: Math.max(1, Math.ceil(actualTotalItems / initialPageSize))
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
