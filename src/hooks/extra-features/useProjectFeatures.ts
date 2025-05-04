
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExtraFeaturesState, defaultFeatures } from "./types";

export function useProjectFeatures(projectId?: string, userId?: string | null) {
  const [features, setFeaturesState] = useState<ExtraFeaturesState>(() => {
    // Load saved preferences from local storage or use defaults
    const savedFeatures = localStorage.getItem("extraFeatures");
    return savedFeatures ? JSON.parse(savedFeatures) : defaultFeatures;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch project-specific features when projectId changes
  useEffect(() => {
    const fetchProjectFeatures = async () => {
      // Only fetch if we have both a valid project ID and a user
      if (!projectId || !userId || projectId === 'default') return;
      
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
    if (projectId && projectId !== 'default') {
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
  }, [projectId, userId]);

  return { features, setFeaturesState, isLoading };
}
