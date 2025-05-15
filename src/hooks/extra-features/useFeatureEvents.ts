
import { useEffect } from 'react';
import { ExtraFeaturesState } from './types';

export function useFeatureEvents(
  projectId: string | undefined,
  setFeaturesState: React.Dispatch<React.SetStateAction<ExtraFeaturesState>>
) {
  // Set up event listeners for feature changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'extraFeatures' && e.newValue) {
        const updatedFeatures = JSON.parse(e.newValue);
        setFeaturesState(updatedFeatures);
      }
    };
    
    // Also listen for custom events
    const handleFeatureUpdate = (e: CustomEvent) => {
      if (e.detail && (!projectId || e.detail.projectId === projectId)) {
        setFeaturesState(e.detail.features);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('featureUpdate', handleFeatureUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('featureUpdate', handleFeatureUpdate as EventListener);
    };
  }, [projectId, setFeaturesState]);
}
