
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
import { AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface FiltersPopoverProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  countryFilter: string;
  setCountryFilter: (country: string) => void;
  siteRefFilter: string;
  setSiteRefFilter: (ref: string) => void;
  starterPackFilter: string;
  setStarterPackFilter: (status: string) => void;
  missingRolesFilter: string;
  setMissingRolesFilter: (value: string) => void;
  uniqueRoles: string[];
  uniqueCountries: string[];
  onResetFilters: () => void;
  children: React.ReactNode;
}

export const FiltersPopover: React.FC<FiltersPopoverProps> = ({
  open,
  setOpen,
  roleFilter,
  setRoleFilter,
  countryFilter,
  setCountryFilter,
  siteRefFilter,
  setSiteRefFilter,
  starterPackFilter,
  setStarterPackFilter,
  missingRolesFilter,
  setMissingRolesFilter,
  uniqueRoles,
  uniqueCountries,
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
            <label htmlFor="role-filter" className="text-sm font-medium">
              Role
            </label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger id="role-filter">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {uniqueRoles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="space-y-2">
            <label htmlFor="starter-pack-filter" className="text-sm font-medium">
              Starter Pack
            </label>
            <Select value={starterPackFilter} onValueChange={setStarterPackFilter}>
              <SelectTrigger id="starter-pack-filter">
                <SelectValue placeholder="Select starter pack status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                <SelectItem value="eligible">LABP Sites (Eligible)</SelectItem>
                <SelectItem value="sent">Starter Pack Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />
          
          <div className="space-y-2">
            <label htmlFor="missing-roles-filter" className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
              Missing Roles
            </label>
            <Select value={missingRolesFilter} onValueChange={setMissingRolesFilter}>
              <SelectTrigger id="missing-roles-filter">
                <SelectValue placeholder="Filter by missing roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                <SelectItem value="missing-any">Missing Any Role</SelectItem>
                <SelectItem value="missing-labp">
                  <div className="flex items-center">
                    Missing LABP
                    <Badge variant="warning" className="ml-1.5 text-xs">Critical</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="complete">Complete (All Roles)</SelectItem>
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
