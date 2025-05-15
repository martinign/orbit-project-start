
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
  const totalFeatures = 5; // Updated to the correct total number of features
  
  // Update local state when features change
  useEffect(() => {
    setLocalFeatures(features);
  }, [features]);
  
  // Listen for storage events to update the card immediately
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'extraFeatures' && e.newValue) {
        const updatedFeatures = JSON.parse(e.newValue);
        setLocalFeatures(updatedFeatures);
      }
    };
    
    // Also listen for custom events from the dialog
    const handleFeatureUpdate = (e: CustomEvent) => {
      if (e.detail && e.detail.projectId === projectId) {
        setLocalFeatures(e.detail.features);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('featureUpdate', handleFeatureUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('featureUpdate', handleFeatureUpdate as EventListener);
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
