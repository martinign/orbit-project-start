
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
    />
  );
};
