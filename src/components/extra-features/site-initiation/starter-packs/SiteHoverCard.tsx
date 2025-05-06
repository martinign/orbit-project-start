
import React from 'react';
import { StarterPackSiteReference } from './types';
import { 
  Tabs, TabsList, TabsTrigger, TabsContent 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Calendar, Phone, Users, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { REQUIRED_ROLES } from '@/hooks/site-initiation/siteUtils';

interface SiteHoverCardProps {
  siteRef: StarterPackSiteReference;
}

export const SiteHoverCard: React.FC<SiteHoverCardProps> = ({ siteRef }) => {
  // Get the LABP site if it exists
  const labpSite = siteRef.labpSite;
  
  // Get all roles for this site reference
  const presentRoles = siteRef.allSitesForReference.map(site => site.role);
  
  return (
    <div className="space-y-6 max-w-md">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Site Details</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>
        
        {/* Site Details Tab - Only showing data not visible in the table */}
        <TabsContent value="details" className="space-y-4">
          {labpSite ? (
            <>
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="rounded-full bg-amber-100 p-3 mb-2">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-medium mb-1">No LABP Role Found</h3>
              <p className="text-sm text-muted-foreground">
                This site reference does not have a LABP role assigned.
              </p>
            </div>
          )}
          
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
                    <Badge variant="outline" className="bg-amber-50">Missing LABP Role</Badge>
                    <span className="text-xs">Cannot send starter pack</span>
                  </div>
                ) : siteRef.hasStarterPack ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-green-600">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Sent</Badge>
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
                    <Badge variant="outline">Not Sent</Badge>
                    <span className="text-xs text-muted-foreground">Starter pack needs to be sent</span>
                  </div>
                )}
              </div>
              
              {/* Registered in SRP Status */}
              <div>
                <div className="text-sm font-medium mb-1">Registered in SRP:</div>
                {siteRef.missingLabp ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Badge variant="outline" className="bg-amber-50">Missing LABP Role</Badge>
                  </div>
                ) : siteRef.registeredInSrp ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Yes, registered in SRP</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Badge variant="outline">Not Registered</Badge>
                    <span className="text-xs">Not yet registered in SRP</span>
                  </div>
                )}
              </div>
              
              {/* Supplies Applied Status */}
              <div>
                <div className="text-sm font-medium mb-1">Supplies Applied:</div>
                {siteRef.missingLabp ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Badge variant="outline" className="bg-amber-50">Missing LABP Role</Badge>
                  </div>
                ) : siteRef.suppliesApplied ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Yes, supplies have been applied</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Badge variant="outline">Not Applied</Badge>
                    <span className="text-xs">Supplies have not been applied yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
