
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StarterPackFiltersPopoverProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  starterPackFilter: string;
  setStarterPackFilter: (status: string) => void;
  registeredInSrpFilter: string;
  setRegisteredInSrpFilter: (status: string) => void;
  suppliesAppliedFilter: string;
  setSuppliesAppliedFilter: (status: string) => void;
  onResetFilters: () => void;
  children: React.ReactNode;
}

export const StarterPackFiltersPopover: React.FC<StarterPackFiltersPopoverProps> = ({
  open,
  setOpen,
  starterPackFilter,
  setStarterPackFilter,
  registeredInSrpFilter,
  setRegisteredInSrpFilter,
  suppliesAppliedFilter,
  setSuppliesAppliedFilter,
  onResetFilters,
  children
}) => {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4 p-2">
          <h3 className="font-medium">Filter Sites</h3>
          
          <div className="space-y-2">
            <label htmlFor="starter-pack-filter" className="text-sm font-medium">
              Starter Pack Status
            </label>
            <Select value={starterPackFilter} onValueChange={setStarterPackFilter}>
              <SelectTrigger id="starter-pack-filter">
                <SelectValue placeholder="Select starter pack status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="not-sent">Not Sent</SelectItem>
                <SelectItem value="no-labp">No LABP Role Assigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="registered-srp-filter" className="text-sm font-medium">
              Registered in SRP
            </label>
            <Select value={registeredInSrpFilter} onValueChange={setRegisteredInSrpFilter}>
              <SelectTrigger id="registered-srp-filter">
                <SelectValue placeholder="Select registration status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="supplies-applied-filter" className="text-sm font-medium">
              Supplies Applied
            </label>
            <Select value={suppliesAppliedFilter} onValueChange={setSuppliesAppliedFilter}>
              <SelectTrigger id="supplies-applied-filter">
                <SelectValue placeholder="Select supplies status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" onClick={onResetFilters}>
              Reset Filters
            </Button>
            <Button 
              size="sm" 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => setOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
