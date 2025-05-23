
import { useState } from "react";
import { ExtraFeaturesState, defaultFeatures } from "./types";
import { useLocalFeatures } from "./useLocalFeatures";
import { useProjectFeatures } from "./useProjectFeatures";
import { useFeatureEvents } from "./useFeatureEvents";
import { useFetchProjectFeatures } from "./useFetchProjectFeatures";

export function useExtraFeatures(projectId?: string) {
  const {
    features: localFeatures,
    setFeatures,
    toggleFeature
  } = useLocalFeatures();
  
  const [features, setFeaturesState] = useState<ExtraFeaturesState>(localFeatures);
  
  const {
    isLoading,
    setIsLoading,
    saveProjectFeatures
  } = useProjectFeatures();

  // Set up event listeners
  useFeatureEvents(projectId, setFeaturesState);
  
  // Fetch project features from database
  useFetchProjectFeatures(projectId, setFeaturesState, setIsLoading);

  // Handle saving project features
  const handleSaveProjectFeatures = async (
    projectIds: string[], 
    updatedFeatures: ExtraFeaturesState
  ) => {
    // Save to database
    await saveProjectFeatures(projectIds, updatedFeatures);
  };

  return {
    features,
    toggleFeature,
    setFeatures,
    isLoading,
    saveProjectFeatures: handleSaveProjectFeatures
  };
}

// Export all from types for convenience
export * from './types';
