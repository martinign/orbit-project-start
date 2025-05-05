
import React from 'react';
import { Button } from '@/components/ui/button';
import { List } from 'lucide-react';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface TableFooterProps {
  showAll: boolean;
  setShowAll: React.Dispatch<React.SetStateAction<boolean>>;
  pagination: {
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
  };
}

export const TableFooter: React.FC<TableFooterProps> = ({
  showAll,
  setShowAll,
  pagination
}) => {
  return (
    <div className="flex justify-between items-center mt-4">
      <Button 
        variant="outline"
        size="sm"
        onClick={() => setShowAll(!showAll)}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        <List className="h-4 w-4 mr-2" />
        {showAll ? "Show Paged" : "Show All"}
      </Button>
      
      {!showAll && (
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.goToPage}
        />
      )}
    </div>
  );
};
