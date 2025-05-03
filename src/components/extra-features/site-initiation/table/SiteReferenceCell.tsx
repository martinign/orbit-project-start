
import React from 'react';
import { SiteData } from '@/hooks/useSiteInitiationData';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

interface SiteReferenceCellProps {
  site: SiteData;
}

export const SiteReferenceCell: React.FC<SiteReferenceCellProps> = ({ site }) => {
  return (
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
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
