
import React from 'react';
import { CardTitle } from "@/components/ui/card";
import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StarterPackFiltersPopover } from './StarterPackFiltersPopover';

interface TableHeaderProps {
  starterPackFilter: string;
  setStarterPackFilter: (value: string) => void;
  registeredInSrpFilter: string;
  setRegisteredInSrpFilter: (value: string) => void;
  suppliesAppliedFilter: string;
  setSuppliesAppliedFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeFilterCount: number;
  resetFilters: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  starterPackFilter,
  setStarterPackFilter,
  registeredInSrpFilter,
  setRegisteredInSrpFilter,
  suppliesAppliedFilter,
  setSuppliesAppliedFilter,
  searchQuery,
  setSearchQuery,
  activeFilterCount,
  resetFilters
}) => {
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 gap-2">
      <CardTitle className="text-base">Sites</CardTitle>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sites..."
            className="pl-8 h-8 w-[180px] text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <StarterPackFiltersPopover
          open={filtersOpen}
          setOpen={setFiltersOpen}
          starterPackFilter={starterPackFilter}
          setStarterPackFilter={setStarterPackFilter}
          registeredInSrpFilter={registeredInSrpFilter}
          setRegisteredInSrpFilter={setRegisteredInSrpFilter}
          suppliesAppliedFilter={suppliesAppliedFilter}
          setSuppliesAppliedFilter={setSuppliesAppliedFilter}
          onResetFilters={resetFilters}
        >
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Filter className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </StarterPackFiltersPopover>
        
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={resetFilters}
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
};
