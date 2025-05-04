
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
  workdayScheduled: boolean;
}

const defaultFeatures: ExtraFeaturesState = {
  importantLinks: false,
  siteInitiationTracker: false,
  repository: false,
  docPrinting: false,
  billOfMaterials: false,
  designSheet: false,
  workdayScheduled: false,
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
          
          // Update local storage for this project
          localStorage.setItem("extraFeatures", JSON.stringify(projectFeatures));
        }
      } catch (error) {
        console.error('Error fetching project features:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectFeatures();
    
    // Set up real-time subscription for project features
    if (projectId) {
      const channel = supabase
        .channel('project_features_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'project_features',
          filter: `project_id=eq.${projectId}`
        }, () => {
          fetchProjectFeatures();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [projectId, user]);

  // Listen for storage events from other components
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

      // Dispatch custom event with the updated features
      projectIds.forEach(pid => {
        const event = new CustomEvent('featureUpdate', {
          detail: {
            projectId: pid,
            features: updatedFeatures
          }
        });
        window.dispatchEvent(event);
      });

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
    
    // Dispatch custom event with project ID if available
    if (projectId) {
      const event = new CustomEvent('featureUpdate', {
        detail: {
          projectId: projectId,
          features: newFeatures
        }
      });
      window.dispatchEvent(event);
    }
  };

  return {
    features,
    toggleFeature,
    setFeatures,
    isLoading,
    saveProjectFeatures
  };
}
