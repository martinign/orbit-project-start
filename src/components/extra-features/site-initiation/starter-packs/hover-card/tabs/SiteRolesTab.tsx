
import React from 'react';
import { Users } from 'lucide-react';
import { StarterPackSiteReference } from '../../types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { REQUIRED_ROLES } from '@/hooks/site-initiation/siteUtils';

interface SiteRolesTabProps {
  siteRef: StarterPackSiteReference;
}

export const SiteRolesTab: React.FC<SiteRolesTabProps> = ({ siteRef }) => {
  // Get all roles for this site reference
  const presentRoles = siteRef.allSitesForReference.map(site => site.role);
  
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-500" />
          Role Coverage
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm mt-3">
          {REQUIRED_ROLES.map(role => {
            const hasRole = presentRoles.includes(role);
            return (
              <div 
                key={role} 
                className={cn(
                  "p-1.5 rounded-md border flex justify-between items-center",
                  hasRole ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                )}
              >
                <span>{role}</span>
                {hasRole ? (
                  <Badge className="bg-green-600">Present</Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-700 border-amber-700">Missing</Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {siteRef.missingRoles.length > 0 && (
        <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-sm">
          <p className="font-medium text-amber-800">Missing {siteRef.missingRoles.length} required roles</p>
          <p className="text-xs mt-1">This site reference is missing the following roles: {siteRef.missingRoles.join(', ')}</p>
          {siteRef.missingLabp && (
            <p className="text-xs font-medium mt-2 text-amber-900">LABP role is required for starter packs</p>
          )}
        </div>
      )}
    </div>
  );
};
