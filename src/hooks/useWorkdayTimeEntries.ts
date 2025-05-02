
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  workday_code_id: string;
  date: string;
  hours: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  task?: {
    title: string;
    duration_days: number;
  };
  workday_code?: {
    task: string;
    activity: string;
  };
}

export function useWorkdayTimeEntries(projectId?: string, taskId?: string) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Fetch time entries for the project
  const { data: timeEntries = [], isLoading, error } = useQuery({
    queryKey: ['workday_time_entries', projectId, taskId],
    queryFn: async () => {
      if (!projectId) return [];
      
      let query = supabase
        .from('workday_time_entries')
        .select(`
          *,
          task:project_tasks(title, duration_days),
          workday_code:workday_codes(task, activity)
        `);
      
      if (taskId) {
        query = query.eq('task_id', taskId);
      } else if (projectId) {
        query = query.eq('project_tasks.project_id', projectId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching time entries:', error);
        throw error;
      }
      
      return data as TimeEntry[];
    },
    enabled: !!projectId && !!user
  });
  
  // Subscribe to real-time updates
  useRealtimeSubscription({
    table: 'workday_time_entries',
    event: '*',
    filter: taskId ? 'task_id' : undefined,
    filterValue: taskId,
    onRecordChange: () => {
      queryClient.invalidateQueries({ queryKey: ['workday_time_entries', projectId, taskId] });
    }
  });
  
  // Calculate totals
  const calculateTotals = () => {
    const totalHours = timeEntries.reduce((sum, entry) => sum + Number(entry.hours), 0);
    const entriesByTask = timeEntries.reduce((acc, entry) => {
      if (!acc[entry.task_id]) {
        acc[entry.task_id] = {
          totalHours: 0,
          task: entry.task?.title || 'Unknown Task',
          entries: []
        };
      }
      acc[entry.task_id].totalHours += Number(entry.hours);
      acc[entry.task_id].entries.push(entry);
      return acc;
    }, {} as Record<string, { totalHours: number; task: string; entries: TimeEntry[] }>);
    
    return { totalHours, entriesByTask };
  };
  
  // Add a time entry
  const addTimeEntryMutation = useMutation({
    mutationFn: async (entry: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'task' | 'workday_code'>) => {
      if (!user) throw new Error('User is not authenticated');
      
      const { data, error } = await supabase
        .from('workday_time_entries')
        .insert({
          ...entry,
          user_id: user.id
        })
        .select();
      
      if (error) {
        console.error('Error adding time entry:', error);
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      toast({
        title: 'Time entry added',
        description: 'Your time entry has been recorded successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['workday_time_entries', projectId, taskId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add time entry: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  // Update a time entry
  const updateTimeEntryMutation = useMutation({
    mutationFn: async (entry: Partial<TimeEntry> & { id: string }) => {
      const { id, ...updates } = entry;
      const { data, error } = await supabase
        .from('workday_time_entries')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error updating time entry:', error);
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      toast({
        title: 'Time entry updated',
        description: 'Your time entry has been updated successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['workday_time_entries', projectId, taskId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update time entry: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  // Delete a time entry
  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workday_time_entries')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting time entry:', error);
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      toast({
        title: 'Time entry deleted',
        description: 'Your time entry has been deleted successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['workday_time_entries', projectId, taskId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete time entry: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  return {
    timeEntries,
    isLoading,
    error,
    addTimeEntry: addTimeEntryMutation.mutate,
    updateTimeEntry: updateTimeEntryMutation.mutate,
    deleteTimeEntry: deleteTimeEntryMutation.mutate,
    calculateTotals,
    selectedDate,
    setSelectedDate
  };
}
