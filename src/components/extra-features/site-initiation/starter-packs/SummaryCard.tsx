
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from '@/components/ui/progress';

export interface SiteStatsProp {
  totalSites: number;
  labpSites: number;
  starterPackSent: number;
  starterPackNeeded: number;
  registeredInSrp: number;
  suppliesApplied: number;
}

export const SummaryCard: React.FC<{ stats: SiteStatsProp }> = ({ stats }) => {
  // Calculate percentage for starter packs
  const starterPackPercentage = stats.labpSites > 0 
    ? Math.round((stats.starterPackSent / stats.labpSites) * 100) 
    : 0;

  return (
    <Card className="bg-muted/40">
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold mb-2">Starter Pack Progress</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="text-sm text-muted-foreground">Total Unique Sites</p>
                <p className="text-2xl font-semibold">{stats.totalSites}</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="text-sm text-muted-foreground">Sites with Starter Packs</p>
                <p className="text-2xl font-semibold">{stats.starterPackSent}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="mb-2 flex justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{starterPackPercentage}%</span>
            </div>
            <Progress value={starterPackPercentage} className="h-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
