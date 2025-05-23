
import React from 'react';
import { SiteData } from '@/hooks/site-initiation/types';
import { SiteHoverCard } from './hover-card';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from './hover-card/components/StatusBadge';
import { isEligibleForStarterPack } from '@/hooks/site-initiation/siteUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SiteTableProps {
  siteReferences: {
    siteRef: string;
    sites: SiteData[];
    hasSiteData: boolean;
  }[];
  selectedSiteRefs: string[];
  setSelectedSiteRefs: (refs: string[]) => void;
  onStarterPackToggle: (site: SiteData | undefined, newValue: boolean) => Promise<void>;
  onRegisteredInSrpToggle: (site: SiteData | undefined, newValue: boolean) => Promise<void>;
  onSuppliesAppliedToggle: (site: SiteData | undefined, newValue: boolean) => Promise<void>;
  onViewHistory: (siteRef: string, siteName: string, siteId?: string) => void;
}

export const SiteTable: React.FC<SiteTableProps> = ({
  siteReferences,
  selectedSiteRefs,
  setSelectedSiteRefs,
  onStarterPackToggle,
  onRegisteredInSrpToggle,
  onSuppliesAppliedToggle,
  onViewHistory
}) => {
  // Toggle selection of a site reference
  const toggleSelection = (siteRef: string) => {
    if (selectedSiteRefs.includes(siteRef)) {
      setSelectedSiteRefs(selectedSiteRefs.filter(ref => ref !== siteRef));
    } else {
      setSelectedSiteRefs([...selectedSiteRefs, siteRef]);
    }
  };
  
  // Toggle selection of all site references
  const toggleSelectAll = () => {
    if (selectedSiteRefs.length === siteReferences.length) {
      setSelectedSiteRefs([]);
    } else {
      setSelectedSiteRefs(siteReferences.map(site => site.siteRef));
    }
  };
  
  // Get LABP site from a site reference group
  const getLabpSite = (sites: SiteData[]) => {
    return sites.find(site => site.role === 'LABP');
  };
  
  // Check if all sites are selected
  const allSelected = selectedSiteRefs.length === siteReferences.length && siteReferences.length > 0;
  // Check if some sites are selected
  const someSelected = selectedSiteRefs.length > 0 && selectedSiteRefs.length < siteReferences.length;
  
  if (siteReferences.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No sites match the current filters.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox 
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                aria-label={allSelected ? "Deselect all sites" : "Select all sites"}
                className={someSelected ? "opacity-50" : ""}
              />
            </TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Institution</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Personnel</TableHead>
            <TableHead className="w-[100px] text-center">Starter Pack</TableHead>
            <TableHead className="w-[100px] text-center">SRP Registration</TableHead>
            <TableHead className="w-[100px] text-center">Supplies Applied</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {siteReferences.map(({ siteRef, sites }) => {
            const labpSite = getLabpSite(sites);
            const firstSite = sites[0]; // Fallback if no LABP site
            const site = labpSite || firstSite;
            
            return (
              <TableRow key={siteRef}>
                <TableCell>
                  <Checkbox 
                    checked={selectedSiteRefs.includes(siteRef)}
                    onCheckedChange={() => toggleSelection(siteRef)}
                  />
                </TableCell>
                <TableCell>
                  <SiteHoverCard siteReferences={{ siteRef, sites, hasSiteData: true }}>
                    <span className="text-blue-600 underline cursor-pointer">{siteRef}</span>
                  </SiteHoverCard>
                </TableCell>
                <TableCell>
                  {site?.institution || <span className="text-gray-400 italic">Not specified</span>}
                </TableCell>
                <TableCell>
                  {site?.country || <span className="text-gray-400 italic">Not specified</span>}
                </TableCell>
                <TableCell>
                  {site?.site_personnel_name || <span className="text-gray-400 italic">Not specified</span>}
                </TableCell>
                <TableCell className="text-center">
                  {labpSite && isEligibleForStarterPack(labpSite) ? (
                    <div className="flex justify-center">
                      <StatusBadge
                        status={labpSite.starter_pack}
                        onToggle={(newValue) => onStarterPackToggle(labpSite, newValue)}
                      />
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs italic">N/A</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <StatusBadge
                      status={site?.registered_in_srp}
                      onToggle={(newValue) => onRegisteredInSrpToggle(site, newValue)}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <StatusBadge
                      status={site?.supplies_applied}
                      onToggle={(newValue) => onSuppliesAppliedToggle(site, newValue)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
