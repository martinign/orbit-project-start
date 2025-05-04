
import React from 'react';
import { Check, X } from 'lucide-react';
import { SiteData, REQUIRED_ROLES, getSitesWithSameReference, getMissingRoles, getUniqueSiteReferences } from '@/hooks/site-initiation';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface SiteRolesCoverageTableProps {
  sites: SiteData[];
}

export const SiteRolesCoverageTable: React.FC<SiteRolesCoverageTableProps> = ({ sites }) => {
  // Get all unique site references
  const uniqueReferences = getUniqueSiteReferences(sites);
  
  // Prepare site data by reference number
  const siteData = uniqueReferences.map(refNumber => {
    const sitesWithSameRef = getSitesWithSameReference(sites, refNumber);
    const missingRoles = getMissingRoles(sites, refNumber);
    const existingRoles = REQUIRED_ROLES.filter(role => !missingRoles.includes(role));
    
    // Get institution name (use the first one if multiple exist for the same reference)
    const institution = sitesWithSameRef.find(site => site.institution)?.institution || 'Unknown';
    
    return {
      referenceNumber: refNumber,
      institution,
      existingRoles,
      missingRoles
    };
  });

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-base mb-3">Site Role Coverage</h3>
      <div className="border rounded-md overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site Reference</TableHead>
              <TableHead>Institution</TableHead>
              {REQUIRED_ROLES.map(role => (
                <TableHead key={role} className="text-center">{role}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {siteData.map(site => (
              <TableRow key={site.referenceNumber}>
                <TableCell className="font-medium">{site.referenceNumber}</TableCell>
                <TableCell>{site.institution}</TableCell>
                {REQUIRED_ROLES.map(role => {
                  const hasRole = site.existingRoles.includes(role);
                  return (
                    <TableCell 
                      key={role} 
                      className={cn(
                        "text-center",
                        !hasRole && "text-destructive font-medium bg-destructive/10"
                      )}
                    >
                      {hasRole ? (
                        <div className="flex justify-center">
                          <Check size={16} className="text-green-600" />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <X size={16} />
                        </div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
