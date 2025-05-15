
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { ExtraFeaturesState } from './types';
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

export function useProjectFeatures() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  // Create BOM task when Bill of Materials feature is enabled
  const createBOMTask = async (projectId: string) => {
    if (!user) return;
    try {
      // Check if Bill of Materials task already exists
      const {
        data: existingTask,
        error: checkError
      } = await supabase.from('project_tasks').select('id').eq('project_id', projectId).eq('title', 'TP34-Bill of Materials').limit(1);
      if (checkError) throw checkError;

      // Only create task if it doesn't exist yet
      if (!existingTask || existingTask.length === 0) {
        const {
          error
        } = await supabase.from('project_tasks').insert({
          title: 'TP34-Bill of Materials',
          description: 'Setup and maintain the bill of materials for this project.',
          status: 'not started',
          priority: 'medium',
          project_id: projectId,
          user_id: user.id
        });
        if (error) throw error;

        // Invalidate tasks query to refresh task list
        queryClient.invalidateQueries({
          queryKey: ['tasks', projectId]
        });
      }
    } catch (error) {
      console.error('Error creating BOM task:', error);
    }
  };

  return {
    isLoading,
    setIsLoading,
    saveProjectFeatures,
    createBOMTask
  };
}
