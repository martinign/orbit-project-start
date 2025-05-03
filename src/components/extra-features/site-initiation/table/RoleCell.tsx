
import React from 'react';
import { SiteData } from '@/hooks/useSiteInitiationData';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoleCellProps {
  site: SiteData;
}

export const RoleCell: React.FC<RoleCellProps> = ({ site }) => {
  const isLabp = site.role === 'LABP';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            className={isLabp ? 'bg-blue-500' : undefined}
          >
            {site.role}
          </Badge>
        </TooltipTrigger>
        {isLabp && (
          <TooltipContent>
            <p>This role is eligible for a starter pack</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
