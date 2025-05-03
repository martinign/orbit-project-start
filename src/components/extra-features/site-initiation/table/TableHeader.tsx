
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Filter, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TableHeaderProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  onExportCSV: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  filtersOpen,
  setFiltersOpen,
  hasActiveFilters,
  activeFilterCount,
  onExportCSV
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div>
        <h2 className="text-lg font-semibold">Sites</h2>
        <p className="text-sm text-muted-foreground">Manage site initiation data</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sites..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <Filter className="h-4 w-4 mr-1" />
          Filters
          {hasActiveFilters && (
            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        <Button onClick={onExportCSV} className="bg-blue-500 hover:bg-blue-600 text-white">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};
