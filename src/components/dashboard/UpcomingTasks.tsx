
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CircleDashed, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UpcomingTasks({ filters }: { filters: any }) {
  const navigate = useNavigate();

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
            <CircleDashed className="h-8 w-8 mb-2" />
            <p>No upcoming tasks</p>
            <p className="text-sm mt-1">All caught up for the next 7 days!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
