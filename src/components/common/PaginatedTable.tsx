
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';

interface PaginatedTableProps<T> {
  data: T[];
  pageSize?: number;
  renderTable: (items: T[]) => React.ReactNode;
  className?: string;
}

export function PaginatedTable<T>({ 
  data, 
  pageSize = 10,
  renderTable,
  className 
}: PaginatedTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(data.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(start, start + pageSize);
  
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePreviousPage = () => {
    if (canGoPrevious) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (canGoNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className={className}>
      {renderTable(paginatedData)}
      
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousPage}
                  disabled={!canGoPrevious}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </PaginationItem>
              
              <PaginationItem>
                <span className="px-4">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>
              
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={!canGoNext}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
