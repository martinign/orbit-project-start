
import { supabase } from '@/integrations/supabase/client';

export interface WorkdayCodeOption {
  id: string;
  label: string; // Combined task-activity format
  task: string;
  activity: string;
}

// Fetch workday codes and format them for display
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
