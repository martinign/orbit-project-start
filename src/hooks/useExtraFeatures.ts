
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
  const [features, setFeaturesState] = useState<ExtraFeaturesState>(defaultFeatures);
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
          
          // Store project-specific features in localStorage
          const storageKey = `extraFeatures-${projectId}`;
          localStorage.setItem(storageKey, JSON.stringify(projectFeatures));
        } else {
          // No features found for this project, use defaults
          setFeaturesState(defaultFeatures);
        }
      } catch (error) {
        console.error('Error fetching project features:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Try loading from localStorage first for immediate display while fetching from DB
    if (projectId) {
      const storageKey = `extraFeatures-${projectId}`;
      const savedFeatures = localStorage.getItem(storageKey);
      if (savedFeatures) {
        try {
          setFeaturesState(JSON.parse(savedFeatures));
        } catch (e) {
          console.error("Error parsing saved features", e);
        }
      }
    }
    
    fetchProjectFeatures();
    
    // Set up real-time subscription for project features
    if (projectId) {
      const channel = supabase
        .channel(`project_features_${projectId}`)
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

  // Listen for custom events for this specific project
  useEffect(() => {
    if (!projectId) return;
    
    const handleFeatureUpdate = (e: CustomEvent) => {
      if (e.detail && e.detail.projectId === projectId) {
        setFeaturesState(e.detail.features);
      }
    };
    
    window.addEventListener('featureUpdate', handleFeatureUpdate as EventListener);
    document.addEventListener('extraFeaturesChanged', handleFeatureUpdate as EventListener);
    
    return () => {
      window.removeEventListener('featureUpdate', handleFeatureUpdate as EventListener);
      document.removeEventListener('extraFeaturesChanged', handleFeatureUpdate as EventListener);
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

      // Update local storage for each project
      projectIds.forEach(pid => {
        const storageKey = `extraFeatures-${pid}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedFeatures));
        
        // Dispatch custom event with the updated features for this project
        const event = new CustomEvent('featureUpdate', {
          detail: {
            projectId: pid,
            features: updatedFeatures
          }
        });
        window.dispatchEvent(event);
        
        // Also dispatch DOM event
        document.dispatchEvent(new CustomEvent('extraFeaturesChanged', {
          detail: {
            projectId: pid,
            features: updatedFeatures
          }
        }));
      });

    } catch (error) {
      console.error('Error saving project features:', error);
      throw error;
    }
  };

  // Set features for specific project
  const setFeatures = (newFeatures: ExtraFeaturesState) => {
    setFeaturesState(newFeatures);
    
    if (projectId) {
      const storageKey = `extraFeatures-${projectId}`;
      localStorage.setItem(storageKey, JSON.stringify(newFeatures));
    }
  };

  const toggleFeature = (featureName: keyof ExtraFeaturesState, value?: boolean) => {
    if (!projectId) return;
    
    const newFeatures = {
      ...features,
      [featureName]: value !== undefined ? value : !features[featureName]
    };
    
    setFeatures(newFeatures);
    
    // Dispatch project-specific custom event
    if (projectId) {
      const event = new CustomEvent('featureUpdate', {
        detail: {
          projectId: projectId,
          features: newFeatures
        }
      });
      window.dispatchEvent(event);
      
      // Also dispatch DOM event
      document.dispatchEvent(new CustomEvent('extraFeaturesChanged', {
        detail: {
          projectId: projectId,
          features: newFeatures
        }
      });
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
