
import React from 'react';
import { Button } from '@/components/ui/button';
import { List } from 'lucide-react';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface PaginationState {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
}

interface TableFooterProps {
  showAll: boolean;
  setShowAll: (value: boolean) => void;
  filteredReferencesCount: number;
  selectedCount: number;
  pagination: PaginationState;
  exporting?: boolean;
}

const TableFooter: React.FC<TableFooterProps> = ({
  showAll,
  setShowAll,
  filteredReferencesCount,
  selectedCount,
  pagination,
  exporting
}) => {
  if (filteredReferencesCount === 0) {
    return null;
  }

  return (
    <div className="flex justify-between items-center mt-4">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAll(!showAll)}
        >
          <List className="h-4 w-4 mr-2" />
          {showAll ? "Show Paged" : "Show All"}
        </Button>
        
        {selectedCount > 0 && (
          <div className="text-xs text-muted-foreground">
            {selectedCount} site{selectedCount !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>

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

export default TableFooter;
