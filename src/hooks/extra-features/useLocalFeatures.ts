
import { useState, useEffect } from 'react';
import { ExtraFeaturesState, defaultFeatures } from './types';

export function useLocalFeatures() {
  const [features, setFeaturesState] = useState<ExtraFeaturesState>(() => {
    // Load saved preferences from local storage or use defaults
    const savedFeatures = localStorage.getItem("extraFeatures");
    return savedFeatures ? JSON.parse(savedFeatures) : defaultFeatures;
  });

  // Set features for local storage
  const setFeatures = (newFeatures: ExtraFeaturesState) => {
    setFeaturesState(newFeatures);
    localStorage.setItem("extraFeatures", JSON.stringify(newFeatures));
  };

  // Toggle a single feature
  const toggleFeature = (featureName: keyof ExtraFeaturesState, value?: boolean) => {
    const newFeatures = {
      ...features,
      [featureName]: value !== undefined ? value : !features[featureName]
    };
    
    setFeatures(newFeatures);
    
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'extraFeatures',
      newValue: JSON.stringify(newFeatures)
    }));
  };

  return {
    features,
    setFeatures,
    toggleFeature
  };
}
