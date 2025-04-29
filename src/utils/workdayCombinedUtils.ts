
import { supabase } from '@/integrations/supabase/client';

export interface WorkdayCodeOption {
  id: string;
  label: string; // Combined task-activity format
  task: string;
  activity: string;
}

// Fetch all workday codes
export const fetchWorkdayCodes = async (): Promise<{ data: WorkdayCodeOption[], error: any }> => {
  try {
    const { data, error } = await supabase
      .from('workday_codes')
      .select('*')
      .order('task', { ascending: true });
      
    if (error) throw error;
    
    // Format codes into option format: "task - activity"
    const formattedCodes = data?.map(code => ({
      id: code.id,
      label: `${code.task} - ${code.activity}`,
      task: code.task,
      activity: code.activity
    })) || [];
    
    return { data: formattedCodes, error: null };
  } catch (error) {
    console.error("Error fetching workday codes:", error);
    return { data: [], error };
  }
};

// Fetch workday codes for a specific project
export const fetchProjectWorkdayCodes = async (projectId: string): Promise<{ data: WorkdayCodeOption[], error: any }> => {
  if (!projectId) {
    return { data: [], error: "No project ID provided" };
  }

  try {
    const { data, error } = await supabase
      .from('project_workday_codes')
      .select(`
        workday_code_id,
        workday_codes (
          id, task, activity
        )
      `)
      .eq('project_id', projectId);
      
    if (error) throw error;
    
    // Format codes into option format: "task - activity"
    const formattedCodes = data?.map(item => ({
      id: item.workday_code_id,
      label: `${item.workday_codes.task} - ${item.workday_codes.activity}`,
      task: item.workday_codes.task,
      activity: item.workday_codes.activity
    })) || [];
    
    return { data: formattedCodes, error: null };
  } catch (error) {
    console.error("Error fetching project workday codes:", error);
    return { data: [], error };
  }
};
