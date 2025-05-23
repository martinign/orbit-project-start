
import React from 'react';
import { SiteData } from '@/hooks/site-initiation/types';
import { format } from 'date-fns';

export interface SiteDetailsTabProps {
  site?: SiteData;
}

export const SiteDetailsTab: React.FC<SiteDetailsTabProps> = ({ site }) => {
  if (!site) return <div>No site details available</div>;
  
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium">Site Details</h4>
        <div className="space-y-1 mt-1">
          {site.institution && (
            <div>
              <span className="text-xs font-medium">Institution:</span>
              <p className="text-xs">{site.institution}</p>
            </div>
          )}
          
          {site.address && (
            <div>
              <span className="text-xs font-medium">Address:</span>
              <p className="text-xs">{site.address}</p>
            </div>
          )}
          
          {site.city_town && (
            <div className="flex space-x-2">
              <span className="text-xs font-medium">City:</span>
              <span className="text-xs">{site.city_town}</span>
            </div>
          )}
          
          {(site.province_state || site.zip_code) && (
            <div className="flex space-x-2">
              {site.province_state && (
                <>
                  <span className="text-xs font-medium">State:</span>
                  <span className="text-xs">{site.province_state}</span>
                </>
              )}
              
              {site.zip_code && (
                <>
                  <span className="text-xs font-medium ml-auto">Zip:</span>
                  <span className="text-xs">{site.zip_code}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium">Contact Information</h4>
        <div className="space-y-1 mt-1">
          <div>
            <span className="text-xs font-medium">Name:</span>
            <p className="text-xs">{site.site_personnel_name}</p>
          </div>
          
          {site.site_personnel_email_address && (
            <div>
              <span className="text-xs font-medium">Email:</span>
              <p className="text-xs break-all">{site.site_personnel_email_address}</p>
            </div>
          )}
          
          {site.site_personnel_telephone && (
            <div className="flex space-x-2">
              <span className="text-xs font-medium">Phone:</span>
              <span className="text-xs">{site.site_personnel_telephone}</span>
            </div>
          )}
        </div>
      </div>
      
      {site.updated_at && (
        <div className="text-xs text-gray-400">
          Last updated: {format(new Date(site.updated_at), 'MMM dd, yyyy')}
        </div>
      )}
    </div>
  );
};
