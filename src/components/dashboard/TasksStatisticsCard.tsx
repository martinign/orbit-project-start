
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskStatusPieChart } from "../charts/TaskStatusPieChart";
import { columnsConfig } from "../tasks/columns-config";
import { useNavigate } from "react-router-dom";

interface TaskFilters {
  projectId?: string;
  status?: string;
  priority?: string;
  projectType?: string;
  showNewTasks?: boolean;
}

export function TasksStatisticsCard({ filters = {} }: { filters?: TaskFilters }) {
  const navigate = useNavigate();
  
  const { data, isLoading } = useQuery({
    queryKey: ["tasks_statistics", filters],
    queryFn: async () => {
      const statuses = filters.status 
        ? [filters.status] 
        : ["not started", "in progress", "pending", "completed", "stucked"];
      
      const queryResults = [];
      
      for (const status of statuses) {
        // Start with a base query for each status
        let query = supabase
          .from("project_tasks")
          .select("id, project:project_id(project_type)")
          .eq("status", status);
        
        if (filters.projectId && filters.projectId !== "all") {
          query = query.eq("project_id", filters.projectId);
        }
        
        if (filters.priority && filters.priority !== "all") {
          query = query.eq("priority", filters.priority);
        }

        if (filters.showNewTasks) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          query = query.gte("created_at", yesterday.toISOString());
        }
        
        const result = await query;
        queryResults.push(result);
      }
      
      // Check for errors in any query
      const errors = queryResults.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error("Failed to fetch task statistics");
      }

      // Filter by project type if specified
      let filteredResults = queryResults.map(result => result.data || []);
      
      if (filters.projectType && filters.projectType !== "all") {
        filteredResults = filteredResults.map(resultData => 
          resultData.filter(task => task.project?.project_type === filters.projectType)
        );
      }

      // Direct color mapping based on columnsConfig
      const colorMap = {
        "not started": "#888888", // Changed from red to gray
        "in progress": "#3b82f6", // blue-500
        "pending": "#eab308", // yellow-500
        "completed": "#22c55e", // green-500
        "stucked": "#ef4444"  // red-500
      };

      return statuses.map((status, index) => {
        return {
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: filteredResults[index]?.length || 0,
          color: colorMap[status] || '#888888'
        };
      });
    },
    refetchOnWindowFocus: false,
  });

  const total = data?.reduce((acc, item) => acc + item.value, 0) || 0;
  
  const handleSliceClick = (status: string) => {
    // Convert status name back to lowercase for filtering
    const statusFilter = status.toLowerCase();
    navigate('/projects', { state: { filterStatus: statusFilter } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Task Status Distribution</CardTitle>
        <CardDescription>Overview of all task statuses</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : total === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            No tasks data available
          </div>
        ) : (
          <div className="space-y-2">
            <TaskStatusPieChart 
              data={data || []} 
              onSliceClick={handleSliceClick}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
