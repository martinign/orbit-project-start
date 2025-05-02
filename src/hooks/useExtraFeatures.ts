
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ExtraFeaturesState {
  importantLinks: boolean;
  siteInitiationTracker: boolean;
  repository: boolean;
  docPrinting: boolean;
  billOfMaterials: boolean;
  designSheet: boolean;
}

const defaultFeatures: ExtraFeaturesState = {
  importantLinks: false,
  siteInitiationTracker: false,
  repository: false,
  docPrinting: false,
  billOfMaterials: false,
  designSheet: false,
};

export function useExtraFeatures(projectId?: string) {
  const [features, setFeaturesState] = useState<ExtraFeaturesState>(() => {
    // Load saved preferences from local storage or use defaults
    const savedFeatures = localStorage.getItem("extraFeatures");
    return savedFeatures ? JSON.parse(savedFeatures) : defaultFeatures;
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch project-specific features when projectId changes
  useEffect(() => {
    const fetchProjectFeatures = async () => {
      if (!projectId || !user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('project_features')
          .select('feature_name, enabled')
          .eq('project_id', projectId);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Convert array of features to object format
          const projectFeatures = { ...defaultFeatures };
          data.forEach(feature => {
            const featureName = feature.feature_name as keyof ExtraFeaturesState;
            if (featureName in projectFeatures) {
              projectFeatures[featureName] = feature.enabled;
            }
          });
          setFeaturesState(projectFeatures);
        }
      } catch (error) {
        console.error('Error fetching project features:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectFeatures();
  }, [projectId, user]);

  // Listen for storage events from other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'extraFeatures' && e.newValue && !projectId) {
        setFeaturesState(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [projectId]);

  // Save project features to database
  const saveProjectFeatures = async (
    projectIds: string[], 
    updatedFeatures: ExtraFeaturesState
  ) => {
    if (!user || !projectIds.length) return;

    try {
      // Convert features object to array of records for batch insert
      const featureRecords = [];
      
      for (const projectId of projectIds) {
        for (const [featureName, enabled] of Object.entries(updatedFeatures)) {
          featureRecords.push({
            project_id: projectId,
            feature_name: featureName,
            enabled,
            user_id: user.id
          });
        }
      }

      // Use upsert to insert or update features
      const { error } = await supabase
        .from('project_features')
        .upsert(featureRecords, { 
          onConflict: 'project_id,feature_name',
          ignoreDuplicates: false
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error saving project features:', error);
      throw error;
    }
  };

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
    
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'extraFeatures',
      newValue: JSON.stringify(newFeatures)
    }));
  };

  return {
    features,
    toggleFeature,
    setFeatures,
    isLoading,
    saveProjectFeatures
  };
}
