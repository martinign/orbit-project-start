
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Separator } from "@/components/ui/separator";

interface StarterPackFiltersPopoverProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  siteRefFilter: string;
  setSiteRefFilter: (ref: string) => void;
  institutionFilter: string;
  setInstitutionFilter: (institution: string) => void;
  personnelFilter: string;
  setPersonnelFilter: (personnel: string) => void;
  countryFilter: string;
  setCountryFilter: (country: string) => void;
  starterPackFilter: string;
  setStarterPackFilter: (status: string) => void;
  registeredInSrpFilter: string;
  setRegisteredInSrpFilter: (status: string) => void;
  suppliesAppliedFilter: string;
  setSuppliesAppliedFilter: (status: string) => void;
  uniqueCountries: string[];
  onResetFilters: () => void;
  children: React.ReactNode;
}

export const StarterPackFiltersPopover: React.FC<StarterPackFiltersPopoverProps> = ({
  open,
  setOpen,
  siteRefFilter,
  setSiteRefFilter,
  institutionFilter,
  setInstitutionFilter,
  personnelFilter,
  setPersonnelFilter,
  countryFilter,
  setCountryFilter,
  starterPackFilter,
  setStarterPackFilter,
  registeredInSrpFilter,
  setRegisteredInSrpFilter,
  suppliesAppliedFilter,
  setSuppliesAppliedFilter,
  uniqueCountries,
  onResetFilters,
  children
}) => {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[80vh] overflow-y-auto">
        <div className="space-y-4 p-2">
          <h3 className="font-medium">Filter Sites</h3>
          
          <div className="space-y-2">
            <label htmlFor="site-ref-filter" className="text-sm font-medium">
              Site Reference
            </label>
            <Input
              id="site-ref-filter"
              placeholder="Filter by site reference..."
              value={siteRefFilter}
              onChange={(e) => setSiteRefFilter(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="institution-filter" className="text-sm font-medium">
              Institution
            </label>
            <Input
              id="institution-filter"
              placeholder="Filter by institution..."
              value={institutionFilter}
              onChange={(e) => setInstitutionFilter(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="personnel-filter" className="text-sm font-medium">
              Personnel Name
            </label>
            <Input
              id="personnel-filter"
              placeholder="Filter by personnel name..."
              value={personnelFilter}
              onChange={(e) => setPersonnelFilter(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="country-filter" className="text-sm font-medium">
              Country
            </label>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger id="country-filter">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {uniqueCountries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

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
