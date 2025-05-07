
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { SiteHoverCard } from './hover-card';
import { StarterPackSiteReference } from './types';
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from './hover-card/components/StatusBadge';

interface SortableColumnHeaderProps {
  field: string;
  children: React.ReactNode;
}

const SortableColumnHeader: React.FC<SortableColumnHeaderProps> = ({ 
  field, 
  children 
}) => {
  return (
    <div className="flex items-center">
      {children}
    </div>
  );
};

interface SiteTableProps {
  displaySiteReferences: StarterPackSiteReference[];
  handleStarterPackToggle: (site: any, value: boolean) => void;
  handleRegisteredInSrpToggle: (site: any, value: boolean) => void;
  handleSuppliesAppliedToggle: (site: any, value: boolean) => void;
  selectedSiteRefs: string[];
  setSelectedSiteRefs: (refs: string[]) => void;
}

export const SiteTable: React.FC<SiteTableProps> = ({ 
  displaySiteReferences,
  handleStarterPackToggle, 
  handleRegisteredInSrpToggle,
  handleSuppliesAppliedToggle,
  selectedSiteRefs,
  setSelectedSiteRefs
}) => {
  // Handle the selection of all sites
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all visible sites
      const allSiteRefs = displaySiteReferences.map(site => site.reference);
      setSelectedSiteRefs(allSiteRefs);
    } else {
      // Deselect all
      setSelectedSiteRefs([]);
    }
  };

  // Handle selection of a single site
  const handleSelectSite = (checked: boolean, siteRef: string) => {
    if (checked) {
      setSelectedSiteRefs([...selectedSiteRefs, siteRef]);
    } else {
      setSelectedSiteRefs(selectedSiteRefs.filter(ref => ref !== siteRef));
    }
  };

  // Check if all displayed sites are selected
  const isAllSelected = displaySiteReferences.length > 0 && 
    displaySiteReferences.every(site => selectedSiteRefs.includes(site.reference));

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all sites"
              />
            </TableHead>
            <TableHead>
              <SortableColumnHeader field="reference">Site Reference</SortableColumnHeader>
            </TableHead>
            <TableHead>
              <SortableColumnHeader field="institution">Institution</SortableColumnHeader>
            </TableHead>
            <TableHead>
              <SortableColumnHeader field="country">Country</SortableColumnHeader>
            </TableHead>
            <TableHead>
              <SortableColumnHeader field="personnel">Personnel</SortableColumnHeader>
            </TableHead>
            <TableHead className="text-center">
              <SortableColumnHeader field="hasStarterPack">Starter Pack</SortableColumnHeader>
            </TableHead>
            <TableHead className="text-center">
              <SortableColumnHeader field="registeredInSrp">Registered in SRP</SortableColumnHeader>
            </TableHead>
            <TableHead className="text-center">
              <SortableColumnHeader field="suppliesApplied">Supplies Applied</SortableColumnHeader>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displaySiteReferences.map((site) => (
            <TableRow key={site.reference}>
              <TableCell className="w-[50px]">
                <Checkbox 
                  checked={selectedSiteRefs.includes(site.reference)}
                  onCheckedChange={(checked) => handleSelectSite(!!checked, site.reference)}
                  aria-label={`Select site ${site.reference}`}
                />
              </TableCell>
              <TableCell>
                <SiteHoverCard siteRef={site}>
                  <span className="font-medium">{site.reference}</span>
                </SiteHoverCard>
              </TableCell>
              <TableCell>{site.institution}</TableCell>
              <TableCell>{site.country}</TableCell>
              <TableCell>{site.personnel}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  {site.missingLabp ? (
                    <StatusBadge variant="secondary" className="text-xs opacity-70">
                      No LABP role assigned
                    </StatusBadge>
                  ) : (
                    <Switch 
                      checked={site.hasStarterPack}
                      onCheckedChange={(value) => {
                        if (site.labpSite) {
                          handleStarterPackToggle(site.labpSite, value);
                        }
                      }}
                      disabled={!site.labpSite}
                    />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Switch 
                    checked={site.registeredInSrp}
                    onCheckedChange={(value) => {
                      if (site.allSitesForReference.length > 0) {
                        handleRegisteredInSrpToggle(site.allSitesForReference[0], value);
                      }
                    }}
                  />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Switch 
                    checked={site.suppliesApplied}
                    onCheckedChange={(value) => {
                      if (site.allSitesForReference.length > 0) {
                        handleSuppliesAppliedToggle(site.allSitesForReference[0], value);
                      }
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
