
import React from 'react';
import { SiteData } from '@/hooks/site-initiation/types';

export interface SiteRolesTabProps {
  sites?: SiteData[];
}

export const SiteRolesTab: React.FC<SiteRolesTabProps> = ({ sites = [] }) => {
  // Group sites by role
  const sitesByRole = React.useMemo(() => {
    const roleGroups: Record<string, SiteData[]> = {};
    
    sites.forEach(site => {
      if (!roleGroups[site.role]) {
        roleGroups[site.role] = [];
      }
      roleGroups[site.role].push(site);
    });
    
    return roleGroups;
  }, [sites]);
  
  const roleEntries = Object.entries(sitesByRole);
  
  if (roleEntries.length === 0) {
    return (
      <div className="text-center py-3 text-xs text-gray-500">
        No roles assigned
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Site Roles</h4>
      
      <div className="space-y-2">
        {roleEntries.map(([role, roleSites]) => (
          <div key={role} className="border-b pb-1 last:border-0">
            <div className="text-xs font-medium">{role}</div>
            {roleSites.map(site => (
              <div key={site.id} className="text-xs">
                {site.site_personnel_name}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
