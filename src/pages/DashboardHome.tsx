
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectsStatisticsCard } from "@/components/dashboard/ProjectsStatisticsCard";
import { TasksStatisticsCard } from "@/components/dashboard/TasksStatisticsCard";
import { TeamStatisticsCard } from "@/components/dashboard/TeamStatisticsCard";
import { InvitationsStatisticsCard } from "@/components/dashboard/InvitationsStatisticsCard";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardFilters {
  projectId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

const DashboardHome = () => {
  const { toast } = useToast();
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
      }),
      
      supabase.channel('tasks_changes').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_tasks'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks_statistics"] });
      }),
      
      supabase.channel('team_changes').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_team_members'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["team_statistics"] });
      }),
      
      supabase.channel('invitations_changes').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_invitations'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["invitations_statistics"] });
      })
    ];

    // Subscribe to all channels
    channels.forEach(channel => channel.subscribe());

    // Clean up
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  const handleFilterChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
    
    // We would use these filters to update our queries, but for now just show a toast
    toast({
      title: "Filters Applied",
      description: `Applied ${Object.keys(newFilters).filter(k => !!newFilters[k as keyof DashboardFilters]).length} filters`,
    });
    
    // In a real implementation, we would invalidate our queries with the new filters
    // or use the filters as query parameters
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      </div>

      <DashboardFilters onFilterChange={handleFilterChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProjectsStatisticsCard />
        <TasksStatisticsCard />
        <TeamStatisticsCard />
        <InvitationsStatisticsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              Activity data will be displayed here
            </div>
          </CardContent>
        </Card>
        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              Upcoming task data will be displayed here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
