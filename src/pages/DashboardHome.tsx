import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectsStatisticsCard } from "@/components/dashboard/ProjectsStatisticsCard";
import { TasksStatisticsCard } from "@/components/dashboard/TasksStatisticsCard";
import { TaskPrioritiesCard } from "@/components/dashboard/TaskPrioritiesCard";
import { InvitationsStatisticsCard } from "@/components/dashboard/InvitationsStatisticsCard";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";

interface DashboardFilters {
  projectId?: string;
  status?: string;
  category?: string;
  showNewTasks?: boolean;
}

const DashboardHome = () => {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<DashboardFilters>({});
  const [showNewTasks, setShowNewTasks] = useState(false);

  useEffect(() => {
    const channels = [
      supabase.channel('projects_changes').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["projects_statistics"] });
        queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
      }),
      
      supabase.channel('tasks_changes').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_tasks'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks_statistics"] });
        queryClient.invalidateQueries({ queryKey: ["task_priorities"] });
        queryClient.invalidateQueries({ queryKey: ["upcoming_tasks"] });
        queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
      }),
      
      supabase.channel('invitations_changes').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_invitations'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["invitations_statistics"] });
        queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
      })
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["projects_statistics"] });
    queryClient.invalidateQueries({ queryKey: ["tasks_statistics"] });
    queryClient.invalidateQueries({ queryKey: ["task_priorities"] });
    queryClient.invalidateQueries({ queryKey: ["invitations_statistics"] });
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
        <UpcomingTasks filters={filters} />
      </div>
    </div>
  );
};

export default DashboardHome;
