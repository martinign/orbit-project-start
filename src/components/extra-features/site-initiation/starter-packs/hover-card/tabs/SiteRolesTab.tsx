
import React from 'react';
import { SiteData } from '@/hooks/site-initiation/types';
import { REQUIRED_ROLES } from '@/hooks/site-initiation/siteUtils';
import { Badge } from '@/components/ui/badge';

export interface SiteRolesTabProps {
  sites?: SiteData[];
}

export const SiteRolesTab: React.FC<SiteRolesTabProps> = ({ sites = [] }) => {
  // Get existing roles for this site reference
  const existingRoles = sites.map(site => site.role);
  
  if (sites.length === 0) {
    return (
      <div className="text-center py-3 text-xs text-gray-500">
        No sites assigned
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Site Roles</h4>
      
      <div className="grid grid-cols-2 gap-2">
        {REQUIRED_ROLES.map(role => {
          const isAvailable = existingRoles.includes(role);
          
          return (
            <Badge
              key={role}
              variant={isAvailable ? "default" : "destructive"}
              className={`text-xs ${
                isAvailable 
                  ? "bg-green-500 hover:bg-green-600 text-white" 
                  : "bg-gray-400 hover:bg-gray-500 text-white"
              }`}
            >
              {role}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
