
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { CRAData } from '@/hooks/cra-list/types';
import { calculateCRASummary } from '@/hooks/cra-list/craUtils';
import { Users, UserCheck, UserMinus, Globe, Briefcase } from 'lucide-react';

interface CraSummaryStatsProps {
  craList: CRAData[];
}

export const CraSummaryStats: React.FC<CraSummaryStatsProps> = ({ craList }) => {
  const summary = calculateCRASummary(craList);
  
  // Get top countries and roles
  const topCountries = Object.entries(summary.byCountry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
    
  const topRoles = Object.entries(summary.byRole)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Users className="mr-2 h-4 w-4 text-blue-500" />
            Total CRAs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalCRAs}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <UserCheck className="mr-2 h-4 w-4 text-green-500" />
            Active CRAs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.activeCRAs}</div>
          <p className="text-xs text-muted-foreground">
            {summary.totalCRAs > 0 
              ? `${Math.round((summary.activeCRAs / summary.totalCRAs) * 100)}% of total`
              : 'No CRAs available'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Globe className="mr-2 h-4 w-4 text-purple-500" />
            Top Countries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topCountries.length > 0 ? (
            <div className="space-y-1">
              {topCountries.map(([country, count]) => (
                <div key={country} className="flex justify-between items-center">
                  <span className="text-sm">{country}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No country data</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Briefcase className="mr-2 h-4 w-4 text-amber-500" />
            Top Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topRoles.length > 0 ? (
            <div className="space-y-1">
              {topRoles.map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="text-sm">{role}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No role data</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
