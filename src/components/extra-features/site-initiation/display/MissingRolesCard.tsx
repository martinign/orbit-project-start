
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SiteSummary } from './useSiteSummary';
import { REQUIRED_ROLES } from '@/hooks/site-initiation';

interface MissingRolesCardProps {
  summary: SiteSummary;
  focusOnLabp?: boolean;
}

export const MissingRolesCard: React.FC<MissingRolesCardProps> = ({ summary, focusOnLabp = true }) => {
  const { sitesMissingLabpRole, sitesWithMissingRoles } = summary;
  
  if (focusOnLabp) {
    // Focus on LABP missing sites
    return (
      <div className="space-y-2">
        <h3 className="font-semibold flex items-center">
          <AlertTriangle className="h-4 w-4 mr-1 text-amber-600" />
          Sites Missing LABP Role
          {sitesMissingLabpRole.length > 0 && (
            <Badge variant="default" className="ml-2 bg-amber-500 hover:bg-amber-600">
              {sitesMissingLabpRole.length} sites
            </Badge>
          )}
        </h3>
        
        {sitesMissingLabpRole.length > 0 ? (
          <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
            <p className="text-sm text-amber-800 mb-2">
              The following sites are missing the LABP role and cannot receive starter packs:
            </p>
            <div className="flex flex-wrap gap-1">
              {sitesMissingLabpRole.map(ref => (
                <TooltipProvider key={ref}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-white border-amber-300 hover:bg-amber-50">
                        {ref}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Missing LABP role - Required for starter packs</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
            All site references have the LABP role assigned.
          </p>
        )}
        
        <p className="text-xs text-muted-foreground mt-1">
          Note: Each site reference should have all required roles: {REQUIRED_ROLES.join(', ')}
        </p>
      </div>
    );
  }
  
  // Show all missing roles
  const siteRefWithMissingRoles = Object.keys(sitesWithMissingRoles);
  
  return (
    <div className="space-y-2">
      <h3 className="font-semibold flex items-center">
        <AlertTriangle className="h-4 w-4 mr-1 text-amber-600" />
        Sites With Missing Roles
        {siteRefWithMissingRoles.length > 0 && (
          <Badge variant="default" className="ml-2 bg-amber-500 hover:bg-amber-600">
            {siteRefWithMissingRoles.length} sites
          </Badge>
        )}
      </h3>
      
      {siteRefWithMissingRoles.length > 0 ? (
        <div className="bg-amber-50 p-3 rounded-md border border-amber-200 max-h-48 overflow-auto">
          <p className="text-sm text-amber-800 mb-2">
            The following sites are missing one or more required roles:
          </p>
          <div className="space-y-2">
            {siteRefWithMissingRoles.slice(0, 10).map(ref => (
              <div key={ref} className="flex flex-wrap items-center gap-1 text-sm">
                <span className="font-medium">{ref}:</span>
                <span>Missing</span>
                {sitesWithMissingRoles[ref].map(role => (
                  <Badge key={role} variant={role === 'LABP' ? 'destructive' : 'outline'} className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            ))}
            {siteRefWithMissingRoles.length > 10 && (
              <p className="text-xs text-amber-600">
                And {siteRefWithMissingRoles.length - 10} more sites...
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
          All sites have all required roles assigned.
        </p>
      )}
      
      <p className="text-xs text-muted-foreground mt-1">
        Required roles: {REQUIRED_ROLES.join(', ')}
      </p>
    </div>
  );
};
