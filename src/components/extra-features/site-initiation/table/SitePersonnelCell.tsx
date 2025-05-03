
import React from 'react';
import { SiteData } from '@/hooks/useSiteInitiationData';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

interface SitePersonnelCellProps {
  site: SiteData;
}

export const SitePersonnelCell: React.FC<SitePersonnelCellProps> = ({ site }) => {
  return (
    <HoverCard>
      <HoverCardTrigger className="hover:underline cursor-help">
        <div>
          <div>{site.site_personnel_name}</div>
          <div className="text-xs text-muted-foreground">PI: {site.pi_name || 'N/A'}</div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Personnel Details</h4>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div className="font-medium">Name:</div>
            <div>{site.site_personnel_name}</div>
            
            <div className="font-medium">Role:</div>
            <div>{site.role}</div>
            
            <div className="font-medium">PI Name:</div>
            <div>{site.pi_name || 'N/A'}</div>
            
            <div className="font-medium">Email:</div>
            <div className="break-all">{site.site_personnel_email_address || 'N/A'}</div>
            
            <div className="font-medium">Phone:</div>
            <div>{site.site_personnel_telephone || 'N/A'}</div>
            
            <div className="font-medium">Fax:</div>
            <div>{site.site_personnel_fax || 'N/A'}</div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
