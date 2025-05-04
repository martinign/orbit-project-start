
import React from 'react';
import { PackageCheck } from 'lucide-react';

interface StarterPackProgressProps {
  totalSites: number;
  sitesWithStarterPack: number;
}

export const StarterPackProgress: React.FC<StarterPackProgressProps> = ({ 
  totalSites, 
  sitesWithStarterPack 
}) => {
  const percentComplete = totalSites > 0 
    ? Math.round((sitesWithStarterPack / totalSites) * 100) 
    : 0;
  
  return (
    <div>
      <h3 className="font-semibold mb-2 flex items-center">
        <PackageCheck className="h-4 w-4 mr-1 text-indigo-600" />
        Site Starter Pack Status
      </h3>
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-blue-500 h-full rounded-full" 
            style={{ width: `${percentComplete}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium">
          {sitesWithStarterPack} of {totalSites} ({percentComplete}%)
        </span>
      </div>
    </div>
  );
};
