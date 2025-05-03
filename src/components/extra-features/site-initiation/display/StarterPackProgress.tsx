
import React from 'react';

interface StarterPackProgressProps {
  labpSites: number;
  starterPackSent: number;
}

export const StarterPackProgress: React.FC<StarterPackProgressProps> = ({ 
  labpSites, 
  starterPackSent 
}) => {
  const percentComplete = labpSites > 0 
    ? Math.round((starterPackSent / labpSites) * 100) 
    : 0;
  
  return (
    <div>
      <h3 className="font-semibold mb-2 flex items-center">
        <PackageCheck className="h-4 w-4 mr-1 text-indigo-600" />
        LABP Starter Pack Status 
        <span className="text-xs ml-2 text-muted-foreground font-normal">
          (only LABP sites are eligible)
        </span>
      </h3>
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-blue-500 h-full rounded-full" 
            style={{ width: `${percentComplete}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium">
          {starterPackSent} of {labpSites} ({percentComplete}%)
        </span>
      </div>
    </div>
  );
};

// Need to import the icon
import { PackageCheck } from 'lucide-react';
