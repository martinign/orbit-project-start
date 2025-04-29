
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface DashboardFiltersProps {
  onFilterChange: (filters: {
    projectId?: string;
    status?: string;
    priority?: string;
    projectType?: string;
  }) => void;
  showNewTasks?: boolean;
  onClearNewTasks?: () => void;
}

export function DashboardFilters({
  onFilterChange,
  showNewTasks,
  onClearNewTasks
}: DashboardFiltersProps) {
  const [projectId, setProjectId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [projectType, setProjectType] = useState<string>("all");
  
  const { toast } = useToast();
  
  const { data: projects } = useQuery({
    queryKey: ["project_filter_options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, project_number, Sponsor, project_type")
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleReset = () => {
    setProjectId("all");
    setStatus("all");
    setPriority("all");
    setProjectType("all");
    onFilterChange({});
    if (showNewTasks && onClearNewTasks) {
      onClearNewTasks();
    }
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared"
    });
  };

  const applyFilters = () => {
    const filters = {
      projectId: projectId !== "all" ? projectId : undefined,
      status: status !== "all" ? status : undefined,
      priority: priority !== "all" ? priority : undefined,
      projectType: projectType !== "all" ? projectType : undefined
    };
    onFilterChange(filters);
    toast({
      title: "Filters Applied",
      description: `Applied filters to dashboard data`
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        {showNewTasks && (
          <div className="flex items-center gap-2 text-sm text-purple-600 mb-4 md:mb-0">
            <Badge variant="secondary" className="bg-purple-100">
              Showing new tasks from last 24h
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearNewTasks}
              className="h-7 px-2"
            >
              Clear
            </Button>
          </div>
        )}

        <div className="grid gap-1.5 w-full md:w-1/5">
          <Label htmlFor="project-type-filter">Project Type</Label>
          <Select value={projectType} onValueChange={value => setProjectType(value)}>
            <SelectTrigger id="project-type-filter">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="billable">Billable</SelectItem>
              <SelectItem value="non-billable">Non-billable</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-1.5 w-full md:w-1/5">
          <Label htmlFor="project-filter">Project</Label>
          <Select value={projectId} onValueChange={value => setProjectId(value)}>
            <SelectTrigger id="project-filter">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {(projects || []).map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.project_type === 'non-billable' 
                    ? project.project_number
                    : `${project.project_number} - ${project.Sponsor}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-1.5 w-full md:w-1/5">
          <Label htmlFor="status-filter">Task Status</Label>
          <Select value={status} onValueChange={value => setStatus(value)}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="not started">Not Started</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="stucked">Stucked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5 w-full md:w-1/5">
          <Label htmlFor="priority-filter">Task Priority</Label>
          <Select value={priority} onValueChange={value => setPriority(value)}>
            <SelectTrigger id="priority-filter">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>



        <div className="flex gap-2 w-full md:w-1/5">
          <Button onClick={applyFilters} className="w-full" variant="secondary">
            <Filter className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
          <Button onClick={handleReset} variant="outline" className="px-3">
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
