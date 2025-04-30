
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WorkdayCodeDetails {
  task: string;
  activity: string;
  label: string;
}

export function useWorkdayCodeDetails(workdayCodeId?: string | null) {
  return useQuery({
    queryKey: ["workday_code", workdayCodeId],
    queryFn: async (): Promise<WorkdayCodeDetails | null> => {
      if (!workdayCodeId) return null;
      
      const { data, error } = await supabase
        .from('workday_codes')
        .select('task, activity')
        .eq('id', workdayCodeId)
        .single();

      if (error) {
        console.error('Error fetching workday code details:', error);
        return null;
      }
      
      if (data) {
        return {
          task: data.task,
          activity: data.activity,
          label: `${data.task} - ${data.activity}`
        };
      }
      
      return null;
    },
    enabled: !!workdayCodeId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
