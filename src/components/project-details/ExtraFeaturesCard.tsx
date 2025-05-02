
import React, { useState, useEffect } from 'react';
import { StatisticCard } from './statistics/StatisticCard';
import { PuzzleIcon } from 'lucide-react';
import { useExtraFeatures } from '@/hooks/useExtraFeatures';

interface ExtraFeaturesCardProps {
  projectId: string;
  onClick?: () => void;
}

export const ExtraFeaturesCard: React.FC<ExtraFeaturesCardProps> = ({ projectId, onClick }) => {
  const { features } = useExtraFeatures(projectId);
  const [localFeatures, setLocalFeatures] = useState(features);
  
  // Count enabled features
  const enabledFeaturesCount = Object.values(localFeatures).filter(Boolean).length;
  const totalFeatures = Object.keys(localFeatures).length;
  
  // Update local state when features change
  useEffect(() => {
    setLocalFeatures(features);
  }, [features]);
  
  // Listen for feature update events specific to this project
  useEffect(() => {
    const handleFeatureUpdate = (e: CustomEvent) => {
      if (e.detail && e.detail.projectId === projectId) {
        setLocalFeatures(e.detail.features);
      }
    };
    
    // Listen for project-specific custom events
    window.addEventListener('featureUpdate', handleFeatureUpdate as EventListener);
    document.addEventListener('extraFeaturesChanged', handleFeatureUpdate as EventListener);
    
    return () => {
      window.removeEventListener('featureUpdate', handleFeatureUpdate as EventListener);
      document.removeEventListener('extraFeaturesChanged', handleFeatureUpdate as EventListener);
    };
  }, [projectId]);
  
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
