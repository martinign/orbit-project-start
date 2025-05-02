
import { useState, useEffect } from "react";

export interface ExtraFeaturesState {
  importantLinks: boolean;
  siteInitiationTracker: boolean;
  repository: boolean;
  docPrinting: boolean;
  billOfMaterials: boolean;
  designSheet: boolean;
}

export function useExtraFeatures() {
  const [features, setFeatures] = useState<ExtraFeaturesState>(() => {
    // Load saved preferences from local storage or use defaults
    const savedFeatures = localStorage.getItem("extraFeatures");
    return savedFeatures ? JSON.parse(savedFeatures) : {
      importantLinks: false,
      siteInitiationTracker: false,
      repository: false,
      docPrinting: false,
      billOfMaterials: false,
      designSheet: false,
    };
  });

  // Listen for storage events from other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'extraFeatures' && e.newValue) {
        setFeatures(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Save to localStorage when features change
  useEffect(() => {
    localStorage.setItem("extraFeatures", JSON.stringify(features));
  }, [features]);

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
    toggleFeature,
    setFeatures
  };
}
