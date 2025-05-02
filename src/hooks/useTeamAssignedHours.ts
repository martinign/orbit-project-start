
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { format } from 'date-fns';

export interface TeamAssignedHour {
  id: string;
  project_id: string;
  user_id: string;
  task_id: string | null;
  assigned_hours: number;
  month: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  user_profile?: {
    full_name: string;
    last_name: string | null;
  };
  task?: {
    title: string;
  };
}

export function useTeamAssignedHours(projectId?: string) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch team assigned hours for the project
  const { data: teamAssignedHours = [], isLoading, error } = useQuery({
    queryKey: ['team_assigned_hours', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('team_assigned_hours')
        .select(`
          *,
          user_profile:user_id(full_name, last_name),
          task:task_id(title)
        `)
        .eq('project_id', projectId)
        .order('month', { ascending: false });
      
      if (error) {
        console.error('Error fetching team assigned hours:', error);
        throw error;
      }
      
      return data as TeamAssignedHour[];
    },
    enabled: !!projectId && !!user
  });
  
  // Subscribe to real-time updates
  useRealtimeSubscription({
    table: 'team_assigned_hours',
    event: '*',
    filter: 'project_id',
    filterValue: projectId,
    onRecordChange: () => {
      queryClient.invalidateQueries({ queryKey: ['team_assigned_hours', projectId] });
    }
  });
  
  // Add team assigned hours
  const addTeamAssignedHoursMutation = useMutation({
    mutationFn: async (entry: Omit<TeamAssignedHour, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'user_profile' | 'task'>) => {
      if (!user) throw new Error('User is not authenticated');
      
      const { data, error } = await supabase
        .from('team_assigned_hours')
        .insert({
          ...entry,
          created_by: user.id
        })
        .select();
      
      if (error) {
        console.error('Error adding team assigned hours:', error);
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      toast({
        title: 'Hours assigned',
        description: 'Team member hours have been assigned successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['team_assigned_hours', projectId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to assign hours: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  // Update team assigned hours
  const updateTeamAssignedHoursMutation = useMutation({
    mutationFn: async (entry: Partial<TeamAssignedHour> & { id: string }) => {
      const { id, ...updates } = entry;
      const { data, error } = await supabase
        .from('team_assigned_hours')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error updating team assigned hours:', error);
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      toast({
        title: 'Hours updated',
        description: 'Team member assigned hours have been updated successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['team_assigned_hours', projectId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update assigned hours: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  // Delete team assigned hours
  const deleteTeamAssignedHoursMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('team_assigned_hours')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting team assigned hours:', error);
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      toast({
        title: 'Assignment removed',
        description: 'Team member hour assignment has been removed successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['team_assigned_hours', projectId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to remove assignment: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  // Group team assigned hours by month for easy display
  const groupedByMonth = React.useMemo(() => {
    const groups: Record<string, TeamAssignedHour[]> = {};
    
    teamAssignedHours.forEach(entry => {
      const monthKey = entry.month.substring(0, 7); // YYYY-MM format
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(entry);
    });
    
    return groups;
  }, [teamAssignedHours]);
  
  // Calculate total hours by month
  const totalsByMonth = React.useMemo(() => {
    const totals: Record<string, number> = {};
    
    teamAssignedHours.forEach(entry => {
      const monthKey = entry.month.substring(0, 7); // YYYY-MM format
      if (!totals[monthKey]) {
        totals[monthKey] = 0;
      }
      totals[monthKey] += Number(entry.assigned_hours);
    });
    
    return totals;
  }, [teamAssignedHours]);
  
  // Calculate total hours by user
  const totalsByUser = React.useMemo(() => {
    const totals: Record<string, number> = {};
    
    teamAssignedHours.forEach(entry => {
      if (!totals[entry.user_id]) {
        totals[entry.user_id] = 0;
      }
      totals[entry.user_id] += Number(entry.assigned_hours);
    });
    
    return totals;
  }, [teamAssignedHours]);
  
  // Format a date as YYYY-MM for month input
  const formatMonthForInput = (date: Date = new Date()) => {
    return format(date, 'yyyy-MM');
  };
  
  return {
    teamAssignedHours,
    isLoading,
    error,
    addTeamAssignedHours: addTeamAssignedHoursMutation.mutate,
    updateTeamAssignedHours: updateTeamAssignedHoursMutation.mutate,
    deleteTeamAssignedHours: deleteTeamAssignedHoursMutation.mutate,
    groupedByMonth,
    totalsByMonth,
    totalsByUser,
    formatMonthForInput
  };
}
