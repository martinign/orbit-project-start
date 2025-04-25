
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskStats {
  status: string;
  count: number;
  color: string;
}

export function TasksStatisticsCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["tasks_statistics"],
    queryFn: async () => {
      const { data: notStarted, error: error1 } = await supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("status", "not started");
        
      const { data: inProgress, error: error2 } = await supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("status", "in progress");
        
      const { data: completed, error: error3 } = await supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("status", "completed");
        
      const { data: blocked, error: error4 } = await supabase
        .from("project_tasks")
        .select("id", { count: "exact" })
        .eq("status", "blocked");
      
      if (error1 || error2 || error3 || error4) {
        throw new Error("Failed to fetch task statistics");
      }
      
      return [
        { status: "Not Started", count: notStarted?.length || 0, color: "#f87171" },
        { status: "In Progress", count: inProgress?.length || 0, color: "#60a5fa" },
        { status: "Completed", count: completed?.length || 0, color: "#4ade80" },
        { status: "Blocked", count: blocked?.length || 0, color: "#fb923c" },
      ];
    },
    refetchOnWindowFocus: false,
  });

  const pieData = data?.map((item) => ({
    name: item.status,
    value: item.count,
    color: item.color,
  }));

  const total = data?.reduce((acc, item) => acc + item.count, 0) || 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Task Status Distribution</CardTitle>
        <CardDescription>Overview of all task statuses</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : total === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            No tasks data available
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">Total Tasks</div>
              <div className="text-xl font-bold">{total}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {data?.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs">{item.status}</span>
                  <span className="text-xs font-medium ml-auto">
                    {item.count} ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
