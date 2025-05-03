
import React from 'react';
import { Globe, Building } from 'lucide-react';

interface LocationsListProps {
  items: string[];
  type: 'countries' | 'institutions';
  noDataMessage?: string;
}

export const LocationsList: React.FC<LocationsListProps> = ({ 
  items, 
  type,
  noDataMessage = 'No data available' 
}) => {
  const Icon = type === 'countries' ? Globe : Building;
  const iconColor = type === 'countries' ? 'text-blue-500' : 'text-amber-500';
  
  if (items.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {noDataMessage}
      </div>
    );
  }
  
  return (
    <div className={`grid grid-cols-1 ${type === 'countries' ? 'sm:grid-cols-2 md:grid-cols-3' : 'md:grid-cols-2'} gap-2`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center p-2 rounded-md border">
          <Icon className={`h-4 w-4 mr-2 ${iconColor}`} />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
};
