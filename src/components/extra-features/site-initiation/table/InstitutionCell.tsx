
import React from 'react';
import { SiteData } from '@/hooks/useSiteInitiationData';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

interface InstitutionCellProps {
  site: SiteData;
}

export const InstitutionCell: React.FC<InstitutionCellProps> = ({ site }) => {
  return (
    <HoverCard>
      <HoverCardTrigger className="hover:underline cursor-help">
        {site.institution || 'N/A'}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Institution Details</h4>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div className="font-medium">Name:</div>
            <div>{site.institution || 'N/A'}</div>
            
            <div className="font-medium">Country:</div>
            <div>{site.country || 'N/A'}</div>
            
            <div className="font-medium">Address:</div>
            <div>{site.address || 'N/A'}</div>
            
            <div className="font-medium">City:</div>
            <div>{site.city_town || 'N/A'}</div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
