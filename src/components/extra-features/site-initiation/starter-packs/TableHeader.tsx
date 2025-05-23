
import React from 'react';
import { CardTitle } from "@/components/ui/card";
import { Download, Filter, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface TableHeaderProps {
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
  handleExportCSV: () => void;
  selectedCount: number;
  totalCount: number;
  exporting?: boolean;
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
  resetFilters,
  handleExportCSV,
  selectedCount,
  totalCount,
  exporting = false
}) => {
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b gap-2">
      <CardTitle className="text-base">Sites</CardTitle>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sites..."
            className="pl-8 h-8 w-[180px] text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        
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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleExportCSV} 
                size="sm" 
                className="h-8 bg-blue-500 hover:bg-blue-600 text-white"
                disabled={selectedCount === 0 || exporting}
              >
                {exporting ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 mr-1" />
                )}
                Export LABP ({selectedCount})
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Export LABP data for selected site references</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
