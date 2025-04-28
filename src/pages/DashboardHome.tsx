
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectsStatisticsCard } from "@/components/dashboard/ProjectsStatisticsCard";
import { TasksStatisticsCard } from "@/components/dashboard/TasksStatisticsCard";
import { TaskPrioritiesCard } from "@/components/dashboard/TaskPrioritiesCard";
import { InvitationsStatisticsCard } from "@/components/dashboard/InvitationsStatisticsCard";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { DashboardEvents } from "@/components/dashboard/DashboardEvents";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { useRealtime } from "@/contexts/RealtimeContext";

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
  const { addSubscription } = useRealtime();

  // Setup dashboard-specific realtime subscriptions
  useEffect(() => {
    // Dashboard statistics need to be updated based on these tables
    const dashboardSubscriptions = [
      { table: 'projects', queryKey: ['projects_statistics'] },
      { table: 'project_tasks', queryKey: ['tasks_statistics'] },
      { table: 'project_tasks', queryKey: ['task_priorities'] },
      { table: 'project_tasks', queryKey: ['upcoming_tasks'] },
      { table: 'project_invitations', queryKey: ['invitations_statistics'] },
      { table: 'project_events', queryKey: ['dashboard_events'] },
      { table: 'project_notes', queryKey: ['recent_activities'] },
      { table: 'project_task_updates', queryKey: ['recent_activities'] }
    ];
    
    // Add all dashboard subscriptions
    dashboardSubscriptions.forEach(subscription => {
      addSubscription({
        table: subscription.table as any,
        queryKey: subscription.queryKey
      });
    });
  }, [addSubscription]);

  // Invalidate queries when filters change
  useEffect(() => {
    const invalidateQueries = () => {
      queryClient.invalidateQueries({ queryKey: ["projects_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["task_priorities"] });
      queryClient.invalidateQueries({ queryKey: ["invitations_statistics"] });
    };
    
    invalidateQueries();
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
