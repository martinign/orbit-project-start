
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WorkdayCode {
  id: string;
  task: string;
  activity: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  projects?: { id: string; project_number: string }[];
}

export interface Project {
  id: string;
  project_number: string;
  protocol_title: string | null;
  project_type: string;
  Sponsor: string | null;
}

export type ProjectAssociations = {[key: string]: Project[]};

// Fetch all workday codes
export const fetchWorkdayCodes = async () => {
  try {
    const { data, error } = await supabase
      .from('workday_codes')
      .select('*')
      .order('task', { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching workday codes:", error);
    return { data: [], error };
  }
};

// Fetch projects
export const fetchProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, project_number, protocol_title, project_type, Sponsor')
      .order('project_number', { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { data: [], error };
  }
};

// Fetch project associations for workday codes
export const fetchProjectAssociations = async () => {
  try {
    const { data, error } = await supabase
      .from('project_workday_codes')
      .select('workday_code_id, project_id, projects:project_id(id, project_number, project_type, Sponsor)');

    if (error) throw error;

    // Group projects by workday code ID
    const associations: {[key: string]: Project[]} = {};
    data?.forEach((item: any) => {
      if (!associations[item.workday_code_id]) {
        associations[item.workday_code_id] = [];
      }
      if (item.projects) {
        associations[item.workday_code_id].push(item.projects);
      }
    });

    return { associations, error: null };
  } catch (error) {
    console.error("Error fetching project associations:", error);
    return { associations: {}, error };
  }
};

// Create or update workday code
export const saveWorkdayCode = async (data: { task: string; activity: string; projectId?: string }, userId: string, codeId?: string) => {
  try {
    if (codeId) {
      // Update existing code
      const { error } = await supabase
        .from('workday_codes')
        .update({
          task: data.task,
          activity: data.activity,
          updated_at: new Date().toISOString()
        })
        .eq('id', codeId);

      if (error) throw error;

      // If a project is selected, associate it with the workday code
      if (data.projectId && data.projectId !== "none") {
        await associateProjectWithCode(codeId, data.projectId, userId);
      }

      return { success: true, message: "Workday code updated successfully", error: null };
    } else {
      // Create new code
      const { data: insertedData, error } = await supabase
        .from('workday_codes')
        .insert({
          task: data.task,
          activity: data.activity,
          user_id: userId,
        })
        .select();

      if (error) throw error;

      // If a project is selected, associate it with the new workday code
      if (insertedData && insertedData[0] && data.projectId && data.projectId !== "none") {
        await associateProjectWithCode(insertedData[0].id, data.projectId, userId);
      }

      return { success: true, message: "Workday code created successfully", error: null };
    }
  } catch (error: any) {
    console.error("Error saving workday code:", error);
    const errorMessage = error.code === "23505" 
      ? "This task and activity combination already exists" 
      : (codeId ? "Failed to update the code" : "Failed to create the code");
    return { success: false, message: errorMessage, error };
  }
};

// Associate project with workday code
export const associateProjectWithCode = async (codeId: string, projectId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('project_workday_codes')
      .insert({
        project_id: projectId,
        workday_code_id: codeId,
        user_id: userId,
      });

    if (error) {
      if (error.code === "23505") {
        return { success: true, message: "This project is already associated with this code", error: null };
      } else {
        throw error;
      }
    }
    
    return { success: true, message: "Project associated with workday code", error: null };
  } catch (error) {
    console.error("Error associating project with code:", error);
    return { success: false, message: "Failed to associate project with workday code", error };
  }
};

// Remove project association
export const removeProjectAssociation = async (codeId: string, projectId: string) => {
  try {
    const { error } = await supabase
      .from('project_workday_codes')
      .delete()
      .match({
        workday_code_id: codeId,
        project_id: projectId
      });

    if (error) throw error;
    
    return { success: true, message: "Project association removed", error: null };
  } catch (error) {
    console.error("Error removing project association:", error);
    return { success: false, message: "Failed to remove project association", error };
  }
};

// Delete workday code
export const deleteWorkdayCode = async (codeId: string) => {
  try {
    // First delete all project associations
    const { error: associationError } = await supabase
      .from('project_workday_codes')
      .delete()
      .eq('workday_code_id', codeId);
      
    if (associationError) throw associationError;
    
    // Then delete the code itself
    const { error } = await supabase
      .from('workday_codes')
      .delete()
      .eq('id', codeId);
      
    if (error) throw error;
    
    return { success: true, message: "Workday code deleted successfully", error: null };
  } catch (error) {
    console.error("Error deleting code:", error);
    return { success: false, message: "Failed to delete the code", error };
  }
};
