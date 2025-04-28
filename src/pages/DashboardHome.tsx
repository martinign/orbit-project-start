
import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectsStatisticsCard } from "@/components/dashboard/ProjectsStatisticsCard";
import { TasksStatisticsCard } from "@/components/dashboard/TasksStatisticsCard";
import { TaskPrioritiesCard } from "@/components/dashboard/TaskPrioritiesCard";
import { InvitationsStatisticsCard } from "@/components/dashboard/InvitationsStatisticsCard";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { DashboardEvents } from "@/components/dashboard/DashboardEvents";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

interface DashboardFilters {
  projectId?: string;
  status?: string;
  category?: string;
  showNewTasks?: boolean;
}

// Helper for debounced query invalidation
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const DashboardHome = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [showNewTasks, setShowNewTasks] = useState(false);

  // Create debounced invalidation functions to prevent UI freezes
  const debouncedInvalidateProjects = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["projects_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
    }, 300),
    [queryClient]
  );

  const debouncedInvalidateTasks = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["tasks_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["task_priorities"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming_tasks"] });
      queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
    }, 300),
    [queryClient]
  );

  const debouncedInvalidateInvitations = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["invitations_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
    }, 300),
    [queryClient]
  );

  // Add new debounced function for events
  const debouncedInvalidateEvents = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["dashboard_events"] });
      queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
    }, 300),
    [queryClient]
  );

  // Use our custom realtime subscription hook instead of creating channels directly
  useRealtimeSubscription({
    table: 'projects',
    onRecordChange: debouncedInvalidateProjects
  });

  useRealtimeSubscription({
    table: 'project_tasks',
    onRecordChange: debouncedInvalidateTasks
  });

  useRealtimeSubscription({
    table: 'project_invitations',
    onRecordChange: debouncedInvalidateInvitations
  });

  // Add new subscription for project events
  useRealtimeSubscription({
    table: 'project_events',
    onRecordChange: debouncedInvalidateEvents
  });

  // Invalidate queries when filters change
  useEffect(() => {
    const invalidateAll = debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["projects_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["task_priorities"] });
      queryClient.invalidateQueries({ queryKey: ["invitations_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_events"] });
    }, 300);
    
    invalidateAll();
  }, [filters, queryClient]);

  const handleFiltersChange = (newFilters: Omit<DashboardFilters, 'showNewTasks'>) => {
    setFilters(current => ({
      ...newFilters,
      showNewTasks: current.showNewTasks
    }));
  };

  const toggleNewTasksFilter = () => {
    setShowNewTasks(prev => !prev);
    setFilters(current => ({
      ...current,
      showNewTasks: !current.showNewTasks
    }));
  };

  return (
    <div className="w-full space-y-6">
      <DashboardHeader 
        onNewTasksClick={toggleNewTasksFilter}
        isNewTasksFilterActive={showNewTasks}
      />
      <DashboardFilters 
        onFilterChange={handleFiltersChange}
        showNewTasks={showNewTasks}
        onClearNewTasks={() => {
          setShowNewTasks(false);
          setFilters(current => ({
            ...current,
            showNewTasks: false
          }));
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProjectsStatisticsCard filters={filters} />
        <TasksStatisticsCard filters={filters} />
        <TaskPrioritiesCard filters={filters} />
        <InvitationsStatisticsCard filters={filters} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentActivities filters={filters} />
        <DashboardEvents filters={filters} />
      </div>
    </div>
  );
};

export default DashboardHome;
