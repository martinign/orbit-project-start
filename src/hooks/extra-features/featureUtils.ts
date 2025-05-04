
import { ExtraFeaturesState } from "./types";
import { supabase } from "@/integrations/supabase/client";

// Save project features to database
export async function saveProjectFeaturesToDB(
  projectIds: string[],
  updatedFeatures: ExtraFeaturesState,
  userId: string | undefined
): Promise<void> {
  if (!userId || !projectIds.length) return;

  try {
    // Convert features object to array of records for batch insert
    const featureRecords = [];
    
    for (const projectId of projectIds) {
      for (const [featureName, enabled] of Object.entries(updatedFeatures)) {
        featureRecords.push({
          project_id: projectId,
          feature_name: featureName,
          enabled,
          user_id: userId
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
}

// Dispatch events to notify other components about feature changes
export function dispatchFeatureEvents(
  features: ExtraFeaturesState, 
  projectId?: string
): void {
  // Dispatch a storage event to notify other components
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'extraFeatures',
    newValue: JSON.stringify(features)
  }));
  
  // Dispatch custom event with project ID if available
  if (projectId) {
    const event = new CustomEvent('featureUpdate', {
      detail: {
        projectId: projectId,
        features: features
      }
    });
    window.dispatchEvent(event);
  }
}
