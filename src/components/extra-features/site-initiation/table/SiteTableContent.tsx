
import React from 'react';
import { SiteData, isEligibleForStarterPack } from '@/hooks/useSiteInitiationData';
import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from '@/components/ui/table';
import { AlertCircle } from 'lucide-react';
import { SiteReferenceCell } from './SiteReferenceCell';
import { SitePersonnelCell } from './SitePersonnelCell';
import { RoleCell } from './RoleCell';
import { InstitutionCell } from './InstitutionCell';
import { ContactCell } from './ContactCell';
import { StarterPackCell } from './StarterPackCell';
import { SiteActions } from './SiteActions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SiteTableContentProps {
  sites: SiteData[];
  onEditSite: (site: SiteData) => void;
  onDeleteSite: (id: string) => void;
}

export const SiteTableContent: React.FC<SiteTableContentProps> = ({ 
  sites, 
  onEditSite, 
  onDeleteSite 
}) => {
  return (
    <div className="max-h-[600px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Site Ref.</TableHead>
            <TableHead>Personnel</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Institution</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1">
                      Starter Pack
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Starter packs are only sent to sites with LABP role</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sites.map((site) => (
            <TableRow key={site.id} className={!isEligibleForStarterPack(site) ? "opacity-80" : undefined}>
              <TableCell className="font-medium">
                <SiteReferenceCell site={site} />
              </TableCell>
              <TableCell>
                <SitePersonnelCell site={site} />
              </TableCell>
              <TableCell>
                <RoleCell site={site} />
              </TableCell>
              <TableCell>
                <InstitutionCell site={site} />
              </TableCell>
              <TableCell>
                <ContactCell site={site} />
              </TableCell>
              <TableCell>
                <StarterPackCell site={site} />
              </TableCell>
              <TableCell className="text-right">
                <SiteActions site={site} onEdit={onEditSite} onDelete={onDeleteSite} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
