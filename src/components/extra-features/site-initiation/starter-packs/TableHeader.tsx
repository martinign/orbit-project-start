
import React from 'react';
import { CardTitle } from "@/components/ui/card";
import { Filter } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface TableHeaderProps {
  countryFilter: string;
  setCountryFilter: (value: string) => void;
  uniqueCountries: string[];
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  countryFilter,
  setCountryFilter,
  uniqueCountries
}) => {
  return (
    <div className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-base">Sites</CardTitle>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Filter by country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {uniqueCountries.map(country => (
              <SelectItem key={country} value={country}>{country}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {countryFilter !== "all" && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={() => setCountryFilter("all")}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
