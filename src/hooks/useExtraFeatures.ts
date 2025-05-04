
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ExtraFeaturesState, UseExtraFeaturesResult, defaultFeatures } from "./extra-features/types";
import { useFeatureEvents } from "./extra-features/useFeatureEvents";
import { useProjectFeatures } from "./extra-features/useProjectFeatures";
import { saveProjectFeaturesToDB, dispatchFeatureEvents } from "./extra-features/featureUtils";

export { ExtraFeaturesState, defaultFeatures } from "./extra-features/types";

export function useExtraFeatures(projectId?: string): UseExtraFeaturesResult {
  const { user } = useAuth();
  const { features, setFeaturesState, isLoading } = useProjectFeatures(projectId, user?.id);
  
  // Set features for local storage (backward compatibility)
  const setFeatures = (newFeatures: ExtraFeaturesState) => {
    setFeaturesState(newFeatures);
    localStorage.setItem("extraFeatures", JSON.stringify(newFeatures));
  };

  const toggleFeature = (featureName: keyof ExtraFeaturesState, value?: boolean) => {
    const newFeatures = {
      ...features,
      [featureName]: value !== undefined ? value : !features[featureName]
    };
    
    setFeatures(newFeatures);
    dispatchFeatureEvents(newFeatures, projectId);
  };

  // Save project features to database
  const saveProjectFeatures = async (
    projectIds: string[], 
    updatedFeatures: ExtraFeaturesState
  ) => {
    await saveProjectFeaturesToDB(projectIds, updatedFeatures, user?.id);
  };

  return {
    features,
    toggleFeature,
    setFeatures,
    isLoading,
    saveProjectFeatures
  };
}
