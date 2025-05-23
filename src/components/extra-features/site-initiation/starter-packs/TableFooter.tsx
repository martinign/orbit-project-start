
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
  filteredCount: number;
  pagination: PaginationState;
  selectedCount?: number;
  exporting?: boolean;
}

export const TableFooter: React.FC<TableFooterProps> = ({
  showAll,
  setShowAll,
  filteredCount,
  selectedCount = 0,
  pagination,
  exporting = false
}) => {
  if (filteredCount === 0) {
    return null;
  }

  return (
    <div className="flex justify-between items-center p-4 border-t">
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
