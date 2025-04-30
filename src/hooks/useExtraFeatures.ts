
import { useState, useEffect } from "react";

export interface ExtraFeaturesState {
  importantLinks: boolean;
  siteInitiationTracker: boolean;
  repository: boolean;
}

export function useExtraFeatures() {
  const [features, setFeatures] = useState<ExtraFeaturesState>(() => {
    // Load saved preferences from local storage or use defaults
    const savedFeatures = localStorage.getItem("extraFeatures");
    return savedFeatures ? JSON.parse(savedFeatures) : {
      importantLinks: false,
      siteInitiationTracker: false,
      repository: false,
    };
  });

  // Save to localStorage when features change
  useEffect(() => {
    localStorage.setItem("extraFeatures", JSON.stringify(features));
  }, [features]);

  const toggleFeature = (featureName: keyof ExtraFeaturesState, value?: boolean) => {
    setFeatures(prev => ({
      ...prev,
      [featureName]: value !== undefined ? value : !prev[featureName]
    }));
  };

  return {
    features,
    toggleFeature,
    setFeatures
  };
}
