
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

interface DashboardHeaderProps {
  onNewTasksClick?: () => void;
  isNewTasksFilterActive?: boolean;
}

export function DashboardHeader({ onNewTasksClick, isNewTasksFilterActive }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(user?.id);
  const queryClient = useQueryClient();
  
  // Add real-time subscription for tasks with custom event
  useRealtimeSubscription({
    table: 'project_tasks',
    event: 'INSERT',
    onRecordChange: () => {
      queryClient.invalidateQueries({ queryKey: ["new_tasks_count"] });
    }
  });
  
  const { data: newTasksCount } = useQuery({
    queryKey: ["new_tasks_count"],
    queryFn: async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count, error } = await supabase
        .from("project_tasks")
        .select("id", { count: "exact", head: true })
        .gte("created_at", yesterday.toISOString());
      
      if (error) throw error;
      return count || 0;
    },
  });

  const handleCreateProject = () => {
    navigate("/projects");
  };

  const displayName = userProfile?.displayName ? `Welcome, ${userProfile.displayName}!` : "Welcome!";

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {newTasksCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger onClick={onNewTasksClick} asChild>
                <Badge 
                  className={`cursor-pointer ${
                    isNewTasksFilterActive 
                      ? "bg-purple-700 hover:bg-purple-800" 
                      : "bg-purple-500 hover:bg-purple-600"
                  }`}
                >
                  {newTasksCount} new
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to {isNewTasksFilterActive ? 'hide' : 'show'} new tasks in the last 24 hours</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex items-center gap-4 mt-2 md:mt-0">
        <span className="text-muted-foreground font-medium">{displayName}</span>
        <div className="flex gap-2">
          
        </div>
      </div>
    </div>
  );
}
