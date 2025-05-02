
import React from 'react';
import { StatisticCard } from './statistics/StatisticCard';
import { PuzzleIcon } from 'lucide-react';
import { useExtraFeatures } from '@/hooks/useExtraFeatures';

interface ExtraFeaturesCardProps {
  projectId: string;
  onClick?: () => void;
}

export const ExtraFeaturesCard: React.FC<ExtraFeaturesCardProps> = ({ projectId, onClick }) => {
  const { features } = useExtraFeatures(projectId);
  
  // Count enabled features
  const enabledFeaturesCount = Object.values(features).filter(Boolean).length;
  const totalFeatures = Object.keys(features).length;
  
  return (
    <StatisticCard
      title="Extra Features"
      value={`${enabledFeaturesCount}/${totalFeatures}`}
      icon={<PuzzleIcon className="h-8 w-8" />}
      iconColor="text-purple-500"
      onClick={onClick}
      extraContent={
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.entries(features).map(([key, enabled]) => (
            <div 
              key={key}
              className={`text-xs px-2 py-0.5 rounded-full ${
                enabled ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"
              }`}
            >
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </div>
          )).slice(0, 3)}
          {Object.keys(features).length > 3 && (
            <div className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              +{Object.keys(features).length - 3} more
            </div>
          )}
        </div>
      }
    />
  );
};
