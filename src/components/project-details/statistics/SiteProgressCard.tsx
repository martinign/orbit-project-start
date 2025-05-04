
import React from 'react';
import { Building, MapPin } from 'lucide-react';
import { StatisticCard } from './StatisticCard';
import { Progress } from '@/components/ui/progress';

interface SiteProgressCardProps {
  totalSites: number;
  completedSites: number;
  onClick: () => void;
}

export const SiteProgressCard: React.FC<SiteProgressCardProps> = ({
  totalSites,
  completedSites,
  onClick,
}) => {
  // Calculate completion percentage
  const completionPercentage = totalSites > 0 
    ? Math.round((completedSites / totalSites) * 100) 
    : 0;
  
  return (
    <StatisticCard
      title="Site Progress"
      value={`${totalSites}`}
      icon={<Building className="h-8 w-8" />}
      iconColor="text-indigo-500"
      onClick={onClick}
      extraContent={
        <div className="mt-2 space-y-1">
          <div className="flex justify-between items-center text-xs mb-1">
            <span>Starter Packs</span>
            <span className="font-medium">{completedSites}/{totalSites}</span>
          </div>
          <Progress value={completionPercentage} className="h-1.5" />
        </div>
      }
    />
  );
};
