
import React from 'react';
import { SiteData } from '@/hooks/useSiteInitiationData';

interface ContactCellProps {
  site: SiteData;
}

export const ContactCell: React.FC<ContactCellProps> = ({ site }) => {
  return (
    <div className="text-xs">
      {site.site_personnel_email_address && (
        <div className="truncate max-w-[150px]">{site.site_personnel_email_address}</div>
      )}
      {site.site_personnel_telephone && (
        <div>{site.site_personnel_telephone}</div>
      )}
    </div>
  );
};
