
import React from 'react';
import { format } from 'date-fns';
import { StarterPackSiteReference } from '../../types';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Calendar, CheckCircle2, Users } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

interface SiteDetailsTabProps {
  siteRef: StarterPackSiteReference;
}

export const SiteDetailsTab: React.FC<SiteDetailsTabProps> = ({ siteRef }) => {
  // Get the LABP site if it exists
  const labpSite = siteRef.labpSite;
  
  if (!labpSite) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="rounded-full bg-amber-100 p-3 mb-2">
          <Users className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="font-medium mb-1">No LABP Role Found</h3>
        <p className="text-sm text-muted-foreground">
          This site reference does not have a LABP role assigned.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* LABP Address Section */}
      <div>
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-500" />
          LABP Address
        </h4>
        <div className="grid grid-cols-2 gap-1 text-sm mt-2">
          <div className="font-medium">Address:</div>
          <div>{labpSite.address || 'Not specified'}</div>
          <div className="font-medium">City/Town:</div>
          <div>{labpSite.city_town || 'Not specified'}</div>
          <div className="font-medium">Province/State:</div>
          <div>{labpSite.province_state || 'Not specified'}</div>
          <div className="font-medium">Zip/Postal Code:</div>
          <div>{labpSite.zip_code || 'Not specified'}</div>
        </div>
      </div>
      
      {/* LABP Contact Details Section */}
      <div>
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Mail className="h-4 w-4 text-blue-500" />
          LABP Contact Details
        </h4>
        <div className="grid grid-cols-2 gap-1 text-sm mt-2">
          <div className="font-medium">Email:</div>
          <div className="break-all">{labpSite.site_personnel_email_address || 'Not specified'}</div>
          <div className="font-medium">Telephone:</div>
          <div>{labpSite.site_personnel_telephone || 'Not specified'}</div>
          <div className="font-medium">Fax:</div>
          <div>{labpSite.site_personnel_fax || 'Not specified'}</div>
        </div>
      </div>
      
      {/* Site Status Section */}
      <div>
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />
          Site Status
        </h4>
        <div className="mt-2 space-y-3">
          {/* Starter Pack Status */}
          <div>
            <div className="text-sm font-medium mb-1">Starter Pack Status:</div>
            {siteRef.missingLabp ? (
              <div className="flex items-center gap-2 text-amber-600">
                <StatusBadge variant="outline" className="bg-amber-50">Missing LABP Role</StatusBadge>
                <span className="text-xs">Cannot send starter pack</span>
              </div>
            ) : siteRef.hasStarterPack ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-green-600">
                  <StatusBadge variant="secondary" className="bg-green-100 text-green-800">Sent</StatusBadge>
                  <span className="text-xs">Starter pack has been sent</span>
                </div>
                {siteRef.starterPackUpdatedAt && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>Sent on {format(new Date(siteRef.starterPackUpdatedAt), 'PPP')}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <StatusBadge variant="outline">Not Sent</StatusBadge>
                <span className="text-xs text-muted-foreground">Starter pack needs to be sent</span>
              </div>
            )}
          </div>
          
          {/* Registered in SRP Status */}
          <div>
            <div className="text-sm font-medium mb-1">Registered in SRP:</div>
            {siteRef.missingLabp ? (
              <div className="flex items-center gap-2 text-amber-600">
                <StatusBadge variant="outline" className="bg-amber-50">Missing LABP Role</StatusBadge>
              </div>
            ) : siteRef.registeredInSrp ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Yes, registered in SRP</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <StatusBadge variant="outline">Not Registered</StatusBadge>
                <span className="text-xs">Not yet registered in SRP</span>
              </div>
            )}
          </div>
          
          {/* Supplies Applied Status */}
          <div>
            <div className="text-sm font-medium mb-1">Supplies Applied:</div>
            {siteRef.missingLabp ? (
              <div className="flex items-center gap-2 text-amber-600">
                <StatusBadge variant="outline" className="bg-amber-50">Missing LABP Role</StatusBadge>
              </div>
            ) : siteRef.suppliesApplied ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Yes, supplies have been applied</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <StatusBadge variant="outline">Not Applied</StatusBadge>
                <span className="text-xs">Supplies have not been applied yet</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
