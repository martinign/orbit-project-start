
import React from 'react';
import { SiteData } from '@/hooks/useSiteInitiationData';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { isMissingLabpRole, getMissingRoles, REQUIRED_ROLES } from '@/hooks/site-initiation/siteUtils';

interface SiteReferenceCellProps {
  site: SiteData;
  allSites: SiteData[];
}

export const SiteReferenceCell: React.FC<SiteReferenceCellProps> = ({ site, allSites }) => {
  const siteRef = site.pxl_site_reference_number;
  const missingLabp = isMissingLabpRole(allSites, siteRef);
  const missingRoles = getMissingRoles(allSites, siteRef);
  const hasMissingRoles = missingRoles.length > 0;
  
  return (
    <div className="flex items-center">
      <HoverCard>
        <HoverCardTrigger className="hover:underline cursor-help">
          {site.pxl_site_reference_number}
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Site Details</h4>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <div className="font-medium">Site Reference:</div>
              <div>{site.pxl_site_reference_number}</div>
              
              <div className="font-medium">Country:</div>
              <div>{site.country || 'N/A'}</div>
              
              <div className="font-medium">Address:</div>
              <div>{site.address || 'N/A'}</div>
              
              <div className="font-medium">City:</div>
              <div>{site.city_town || 'N/A'}</div>
              
              <div className="font-medium">State/Province:</div>
              <div>{site.province_state || 'N/A'}</div>
              
              <div className="font-medium">Zip Code:</div>
              <div>{site.zip_code || 'N/A'}</div>
              
              {hasMissingRoles && (
                <>
                  <div className="font-medium">Missing Roles:</div>
                  <div className="flex flex-wrap gap-1">
                    {missingRoles.map(role => (
                      <Badge 
                        key={role} 
                        variant={role === 'LABP' ? 'destructive' : 'outline'} 
                        className="text-xs"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {hasMissingRoles && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                This site is missing {missingRoles.length} of {REQUIRED_ROLES.length} required roles.
                {missingLabp && <div className="font-medium mt-1">LABP role required for starter packs.</div>}
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
      
      {missingLabp && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <AlertTriangle className="h-4 w-4 text-amber-500 ml-1" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Missing LABP role - Required for starter packs</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
