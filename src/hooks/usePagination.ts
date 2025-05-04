
import { useState } from "react";

interface UsePaginationProps {
  initialPage?: number;
  pageSize?: number;
  totalItems?: number;
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export function usePagination({
  initialPage = 1,
  pageSize = 10,
  totalItems = 0
}: UsePaginationProps = {}) {
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: initialPage,
    pageSize: pageSize,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize))
  });

  // Update total pages when total items or page size changes
  const updateTotalPages = (itemsCount: number, size: number = pagination.pageSize) => {
    setPagination(prev => ({
      ...prev,
      totalPages: Math.max(1, Math.ceil(itemsCount / size))
    }));
  };

  // Set current page
  const setPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, pagination.totalPages));
    setPagination(prev => ({
      ...prev,
      currentPage: validPage
    }));
  };

  // Set page size and recalculate total pages
  const setPageSize = (newSize: number, totalItems: number) => {
    const newTotalPages = Math.max(1, Math.ceil(totalItems / newSize));
    const newCurrentPage = Math.min(pagination.currentPage, newTotalPages);
    
    setPagination({
      currentPage: newCurrentPage,
      pageSize: newSize,
      totalPages: newTotalPages
    });
  };

  const nextPage = () => setPage(pagination.currentPage + 1);
  const prevPage = () => setPage(pagination.currentPage - 1);
  const firstPage = () => setPage(1);
  const lastPage = () => setPage(pagination.totalPages);

  return {
    ...pagination,
    setPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    updateTotalPages,
    // Calculate range for Supabase queries
    range: {
      from: (pagination.currentPage - 1) * pagination.pageSize,
      to: pagination.currentPage * pagination.pageSize - 1
    }
  };
}
