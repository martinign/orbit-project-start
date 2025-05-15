
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { ExtraFeaturesState, defaultFeatures } from './types';
import { useAuth } from "@/contexts/AuthContext";

export function useFetchProjectFeatures(
  projectId: string | undefined, 
  setFeaturesState: React.Dispatch<React.SetStateAction<ExtraFeaturesState>>,
  setIsLoading: (isLoading: boolean) => void
) {
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
  }, [projectId, user, setFeaturesState, setIsLoading]);
}
