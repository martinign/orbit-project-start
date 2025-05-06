
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CircleDashed } from "lucide-react";
import { getStatusBadge } from "@/utils/statusBadge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function UpcomingTasks({ filters, hideHeader = false }: { filters: any, hideHeader?: boolean }) {
  const { data: upcomingTasks, isLoading: upcomingLoading } = useQuery({
    queryKey: ["upcoming_tasks", filters],
    queryFn: async () => {
      const today = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(today.getDate() + 3);
      
      let tasksQuery = supabase
        .from("project_tasks")
        .select("id, title, status, due_date, project_id, projects:project_id(project_number, Sponsor)")
        .gte("due_date", today.toISOString())
        .lte("due_date", threeDaysLater.toISOString())
        .order("due_date", { ascending: true });
      
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

  return (
    <div className={hideHeader ? "" : "card min-h-[300px]"}>
      {!hideHeader && (
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
          <CardDescription>Tasks due in the next 3 days</CardDescription>
        </CardHeader>
      )}
      <div className={hideHeader ? "" : "card-content"}>
        {upcomingLoading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading upcoming tasks...</p>
          </div>
        ) : upcomingTasks && upcomingTasks.length > 0 ? (
          <ScrollArea className="h-[250px]">
            <div className="space-y-4 pr-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
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
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <CircleDashed className="h-8 w-8 mb-2" />
            <p>No upcoming tasks</p>
            <p className="text-sm mt-1">All caught up for the next 3 days!</p>
          </div>
        )}
      </div>
    </div>
  );
}
