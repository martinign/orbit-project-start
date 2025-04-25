
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectsStatisticsCard } from "@/components/dashboard/ProjectsStatisticsCard";
import { TasksStatisticsCard } from "@/components/dashboard/TasksStatisticsCard";
import { TeamStatisticsCard } from "@/components/dashboard/TeamStatisticsCard";
import { InvitationsStatisticsCard } from "@/components/dashboard/InvitationsStatisticsCard";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";

interface DashboardFilters {
  projectId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

const DashboardHome = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<DashboardFilters>({});

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
        queryClient.invalidateQueries({ queryKey: ["upcoming_tasks"] });
        queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
      }),
      
      supabase.channel('team_changes').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_team_members'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["team_statistics"] });
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

    // Subscribe to all channels
    channels.forEach(channel => channel.subscribe());

    // Clean up
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  // Invalidate queries when filters change
  useEffect(() => {
    // This ensures charts and statistics are refreshed when filters change
    queryClient.invalidateQueries({ queryKey: ["projects_statistics"] });
    queryClient.invalidateQueries({ queryKey: ["tasks_statistics"] });
    queryClient.invalidateQueries({ queryKey: ["team_statistics"] });
    queryClient.invalidateQueries({ queryKey: ["invitations_statistics"] });
  }, [filters, queryClient]);

  return (
    <div className="w-full space-y-6">
      <DashboardHeader />
      <DashboardFilters onFilterChange={setFilters} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProjectsStatisticsCard filters={filters} />
        <TasksStatisticsCard filters={filters} />
        <TeamStatisticsCard filters={filters} />
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
