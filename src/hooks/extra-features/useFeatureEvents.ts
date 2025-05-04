
import { useState, useEffect } from "react";
import { ExtraFeaturesState } from "./types";

export function useFeatureEvents(
  projectId?: string,
  initialFeatures?: ExtraFeaturesState
): ExtraFeaturesState {
  const [localFeatures, setLocalFeatures] = useState<ExtraFeaturesState>(
    initialFeatures || {
      importantLinks: false,
      siteInitiationTracker: false,
      repository: false,
      docPrinting: false,
      billOfMaterials: false,
      designSheet: false,
      workdayScheduled: false,
    }
  );

  // Listen for storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'extraFeatures' && e.newValue) {
        setLocalFeatures(JSON.parse(e.newValue));
      }
    };
    
    // Also listen for custom events from the dialog
    const handleFeatureUpdate = (e: CustomEvent) => {
      if (e.detail && (!projectId || e.detail.projectId === projectId)) {
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

  return localFeatures;
}
