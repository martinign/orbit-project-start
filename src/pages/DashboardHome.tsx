
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectsStatisticsCard } from "@/components/dashboard/ProjectsStatisticsCard";
import { TasksStatisticsCard } from "@/components/dashboard/TasksStatisticsCard";
import { TeamStatisticsCard } from "@/components/dashboard/TeamStatisticsCard";
import { InvitationsStatisticsCard } from "@/components/dashboard/InvitationsStatisticsCard";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, CheckCircle2, Clock, ArrowUpRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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

  // Query for recent activities
  const { data: recentActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["recent_activities", filters],
    queryFn: async () => {
      let tasksQuery = supabase
        .from("project_tasks")
        .select("id, title, status, updated_at, project_id, projects:project_id(project_number, Sponsor)")
        .order("updated_at", { ascending: false })
        .limit(5);
      
      if (filters.projectId) {
        tasksQuery = tasksQuery.eq("project_id", filters.projectId);
      }
      
      if (filters.status) {
        tasksQuery = tasksQuery.eq("status", filters.status);
      }
      
      if (filters.startDate) {
        tasksQuery = tasksQuery.gte("updated_at", filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        tasksQuery = tasksQuery.lte("updated_at", filters.endDate.toISOString());
      }
      
      const { data: tasks, error } = await tasksQuery;
      
      if (error) throw error;
      return tasks || [];
    },
  });

  // Query for upcoming tasks (due in the next 7 days)
  const { data: upcomingTasks, isLoading: upcomingLoading } = useQuery({
    queryKey: ["upcoming_tasks", filters],
    queryFn: async () => {
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      
      let tasksQuery = supabase
        .from("project_tasks")
        .select("id, title, status, due_date, project_id, projects:project_id(project_number, Sponsor)")
        .gte("due_date", today.toISOString())
        .lte("due_date", sevenDaysLater.toISOString())
        .order("due_date", { ascending: true })
        .limit(5);
      
      if (filters.projectId) {
        tasksQuery = tasksQuery.eq("project_id", filters.projectId);
      }
      
      if (filters.status) {
        tasksQuery = tasksQuery.eq("status", filters.status);
      }
      
      const { data: tasks, error } = await tasksQuery;
      
      if (error) throw error;
      return tasks || [];
    },
  });

  const handleFilterChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
    
    // We would use these filters to update our queries, but for now just show a toast
    toast({
      title: "Filters Applied",
      description: `Applied ${Object.keys(newFilters).filter(k => !!newFilters[k as keyof DashboardFilters]).length} filters`,
    });
    
    // Invalidate queries to refresh with new filters
    queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
    queryClient.invalidateQueries({ queryKey: ["upcoming_tasks"] });
    queryClient.invalidateQueries({ queryKey: ["projects_statistics"] });
    queryClient.invalidateQueries({ queryKey: ["tasks_statistics"] });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'in progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'active':
        return <Badge className="bg-emerald-500">Active</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case 'stucked':
        return <Badge className="bg-red-500">Stucked</Badge>;
      default:
        return <Badge className="bg-gray-500">{status || 'Not Set'}</Badge>;
    }
  };

  const handleCreateProject = () => {
    navigate("/projects");
  };

  const navigateToTask = (taskId: string, projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button variant="default" className="bg-blue-500 hover:bg-blue-600" onClick={handleCreateProject}>
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
            {activitiesLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Loading recent activities...</p>
              </div>
            ) : recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer" onClick={() => navigateToTask(activity.id, activity.project_id)}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {activity.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.projects?.project_number} - {activity.projects?.Sponsor}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {getStatusBadge(activity.status)}
                      <span className="text-xs text-muted-foreground mt-1">
                        {format(new Date(activity.updated_at), "MMM d, h:mm a")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <p>No recent activities found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Loading upcoming tasks...</p>
              </div>
            ) : upcomingTasks && upcomingTasks.length > 0 ? (
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer" onClick={() => navigateToTask(task.id, task.project_id)}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Calendar className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.projects?.project_number} - {task.projects?.Sponsor}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {getStatusBadge(task.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {format(new Date(task.due_date), "MMM d")}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full mt-2 text-blue-500" onClick={() => navigate("/tasks")}>
                  View all tasks <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <p>No upcoming tasks</p>
                <p className="text-sm mt-1">All caught up for the next 7 days!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
