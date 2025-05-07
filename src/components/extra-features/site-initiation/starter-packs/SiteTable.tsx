
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
import { SiteHoverCard } from './SiteHoverCard';
import { StarterPackSiteReference } from './types';

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
}

export const SiteTable: React.FC<SiteTableProps> = ({ 
  displaySiteReferences,
  handleStarterPackToggle, 
  handleRegisteredInSrpToggle,
  handleSuppliesAppliedToggle
}) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
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
                  <Switch 
                    checked={site.hasStarterPack}
                    onCheckedChange={(value) => {
                      if (site.labpSite) {
                        handleStarterPackToggle(site.labpSite, value);
                      }
                    }}
                    disabled={!site.labpSite || site.missingLabp}
                  />
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
