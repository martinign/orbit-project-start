
import React from 'react';
import { SiteData, isEligibleForStarterPack } from '@/hooks/useSiteInitiationData';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StarterPackCellProps {
  site: SiteData;
}

export const StarterPackCell: React.FC<StarterPackCellProps> = ({ site }) => {
  const isEligible = isEligibleForStarterPack(site);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {isEligible ? (
            site.starter_pack ? (
              <Badge className="flex items-center gap-1 bg-green-100 text-green-800" variant="secondary">
                <Check className="h-3 w-3" /> Sent
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <X className="h-3 w-3" /> Not sent
              </Badge>
            )
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1 opacity-70">
              <X className="h-3 w-3" /> N/A
            </Badge>
          )}
        </TooltipTrigger>
        <TooltipContent>
          {isEligible 
            ? site.starter_pack 
              ? "Starter pack has been sent" 
              : "Starter pack needs to be sent" 
            : "This role is not eligible for a starter pack"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
