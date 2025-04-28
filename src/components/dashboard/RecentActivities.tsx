
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDashed, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStatusBadge } from "@/utils/statusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecentActivitiesProps {
  filters: any;
}

export function RecentActivities({ filters }: RecentActivitiesProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(user?.id);
  const queryClient = useQueryClient();
  const [showNewTasksBadge, setShowNewTasksBadge] = useState(false);

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
      
      if (filters.showNewTasks) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        tasksQuery = tasksQuery.gte("created_at", yesterday.toISOString());
      }
      
      const { data, error } = await tasksQuery;
      
      if (error) throw error;
      return data || [];
    },
  });

  const navigateToTask = (taskId: string, projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const { data: newTasksCount } = useQuery({
    queryKey: ["new_tasks_count"],
    queryFn: async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count, error } = await supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .gte("created_at", yesterday.toISOString());
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Set the badge visibility based on new tasks count
  useEffect(() => {
    setShowNewTasksBadge(!!newTasksCount && newTasksCount > 0);
  }, [newTasksCount]);

  useEffect(() => {
    const channel = supabase.channel('tasks_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_tasks'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["new_tasks_count"] });
        queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const toggleNewTasksFilter = () => {
    // Toggle the showNewTasks filter by calling back to the parent
    if (filters.onToggleNewTasks) {
      filters.onToggleNewTasks();
    }
  };

  return (
    <Card className="min-h-[300px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions across all projects</CardDescription>
        </div>
        {showNewTasksBadge && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger onClick={toggleNewTasksFilter} asChild>
                <Badge 
                  className={`cursor-pointer ${
                    filters.showNewTasks 
                      ? "bg-purple-700 hover:bg-purple-800" 
                      : "bg-purple-500 hover:bg-purple-600"
                  }`}
                >
                  {newTasksCount} new
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to {filters.showNewTasks ? 'hide' : 'show'} new tasks in the last 24 hours</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
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
            <CircleDashed className="h-8 w-8 mb-2" />
            <p>No recent activities found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
