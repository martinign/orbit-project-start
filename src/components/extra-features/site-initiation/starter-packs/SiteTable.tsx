
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

interface SiteTableProps {
  displaySiteReferences: StarterPackSiteReference[];
  handleStarterPackToggle: (labpSite: SiteData | undefined, newValue: boolean) => void;
}

export const SiteTable: React.FC<SiteTableProps> = ({ 
  displaySiteReferences, 
  handleStarterPackToggle 
}) => {
  return (
    <div className="border rounded-md overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Site Reference</TableHead>
            <TableHead>Institution</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Personnel Name</TableHead>
            <TableHead className="text-center">Starter Pack</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displaySiteReferences.map(siteRef => (
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
