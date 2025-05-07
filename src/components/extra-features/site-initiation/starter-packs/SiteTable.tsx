
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { StarterPackSiteReference } from './types';
import { 
  HoverCard, 
  HoverCardTrigger, 
  HoverCardContent 
} from '@/components/ui/hover-card';
import { SiteHoverCard } from './SiteHoverCard';
import { SiteData } from '@/hooks/site-initiation/types';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SiteTableProps {
  displaySiteReferences: StarterPackSiteReference[];
  handleStarterPackToggle: (labpSite: SiteData | undefined, newValue: boolean) => void;
  handleRegisteredInSrpToggle: (labpSite: SiteData | undefined, newValue: boolean) => void;
  handleSuppliesAppliedToggle: (labpSite: SiteData | undefined, newValue: boolean) => void;
}

export const SiteTable: React.FC<SiteTableProps> = ({ 
  displaySiteReferences, 
  handleStarterPackToggle,
  handleRegisteredInSrpToggle,
  handleSuppliesAppliedToggle
}) => {
  // Basic sorting functionality
  const [sortField, setSortField] = React.useState<string>('reference');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Apply sorting to the displayed references
  const sortedReferences = React.useMemo(() => {
    return [...displaySiteReferences].sort((a, b) => {
      let valA: any, valB: any;
      
      switch (sortField) {
        case 'reference':
          valA = a.reference;
          valB = b.reference;
          break;
        case 'institution':
          valA = a.institution;
          valB = b.institution;
          break;
        case 'country':
          valA = a.country;
          valB = b.country;
          break;
        case 'personnel':
          valA = a.personnel;
          valB = b.personnel;
          break;
        case 'hasStarterPack':
          valA = a.hasStarterPack ? 1 : 0;
          valB = b.hasStarterPack ? 1 : 0;
          break;
        case 'registeredInSrp':
          valA = a.registeredInSrp ? 1 : 0;
          valB = b.registeredInSrp ? 1 : 0;
          break;
        case 'suppliesApplied':
          valA = a.suppliesApplied ? 1 : 0;
          valB = b.suppliesApplied ? 1 : 0;
          break;
        default:
          valA = a.reference;
          valB = b.reference;
      }
      
      if (valA === valB) return 0;
      
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
  }, [displaySiteReferences, sortField, sortOrder]);

  const SortableHeader = ({ field, children }: { field: string, children: React.ReactNode }) => (
    <TableHead>
      <Button 
        variant="ghost" 
        className="p-0 font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
        onClick={() => handleSort(field)}
      >
        {children}
        <ArrowUpDown className={cn(
          "h-3 w-3 transition-opacity", 
          sortField === field ? "opacity-100" : "opacity-50"
        )} />
      </Button>
    </TableHead>
  );

  return (
    <div className="border rounded-md overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="reference">Site Reference</SortableHeader>
            <SortableHeader field="institution">Institution</SortableHeader>
            <SortableHeader field="country">Country</SortableHeader>
            <SortableHeader field="personnel">Personnel Name</SortableHeader>
            <SortableHeader field="hasStarterPack" className="text-center">Starter Pack</SortableHeader>
            <SortableHeader field="registeredInSrp">Registered in SRP</SortableHeader>
            <SortableHeader field="suppliesApplied">Supplies Applied</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedReferences.map((siteRef) => (
            <HoverCard key={siteRef.reference} openDelay={300} closeDelay={100}>
              <HoverCardTrigger asChild>
                <TableRow className="cursor-pointer">
                  <TableCell className="font-medium">{siteRef.reference}</TableCell>
                  <TableCell>{siteRef.institution || 'Unknown'}</TableCell>
                  <TableCell>{siteRef.country || 'Unknown'}</TableCell>
                  <TableCell>{siteRef.personnel}</TableCell>
                  <TableCell className="text-center">
                    {siteRef.missingLabp ? (
                      <Badge variant="outline" className="bg-gray-100">
                        Missing LABP Role
                      </Badge>
                    ) : (
                      <div className="flex justify-center items-center gap-2">
                        <Switch 
                          checked={siteRef.hasStarterPack} 
                          onCheckedChange={(checked) => handleStarterPackToggle(siteRef.labpSite, checked)}
                        />
                        <span className={cn(
                          "text-xs",
                          siteRef.hasStarterPack ? "text-green-600" : "text-muted-foreground"
                        )}>
                          {siteRef.hasStarterPack ? "Sent" : "Not sent"}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center items-center gap-2">
                      <Switch 
                        checked={siteRef.registeredInSrp} 
                        onCheckedChange={(checked) => handleRegisteredInSrpToggle(
                          siteRef.labpSite || siteRef.allSitesForReference[0], 
                          checked
                        )}
                      />
                      <span className={cn(
                        "text-xs",
                        siteRef.registeredInSrp ? "text-green-600" : "text-muted-foreground"
                      )}>
                        {siteRef.registeredInSrp ? "Yes" : "No"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center items-center gap-2">
                      <Switch 
                        checked={siteRef.suppliesApplied} 
                        onCheckedChange={(checked) => handleSuppliesAppliedToggle(
                          siteRef.labpSite || siteRef.allSitesForReference[0], 
                          checked
                        )}
                      />
                      <span className={cn(
                        "text-xs",
                        siteRef.suppliesApplied ? "text-green-600" : "text-muted-foreground"
                      )}>
                        {siteRef.suppliesApplied ? "Yes" : "No"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              </HoverCardTrigger>
              <HoverCardContent className="w-[450px] p-0">
                <SiteHoverCard siteRef={siteRef} />
              </HoverCardContent>
            </HoverCard>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
