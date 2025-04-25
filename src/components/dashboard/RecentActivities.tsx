
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircleDashed, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RecentActivities({ filters }: { filters: any }) {
  const navigate = useNavigate();

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
      
      const { data, error } = await tasksQuery;
      
      if (error) throw error;
      return data || [];
    },
  });

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

  const navigateToTask = (taskId: string, projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
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
            <CircleDashed className="h-8 w-8 mb-2" />
            <p>No recent activities found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
