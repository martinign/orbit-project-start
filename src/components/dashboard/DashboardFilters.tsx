
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardFiltersProps {
  onFilterChange: (filters: {
    projectId?: string;
    status?: string;
    category?: string;
  }) => void;
}

export function DashboardFilters({
  onFilterChange
}: DashboardFiltersProps) {
  const [projectId, setProjectId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  
  const { toast } = useToast();
  
  const { data: projects } = useQuery({
    queryKey: ["project_filter_options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, project_number, Sponsor")
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleReset = () => {
    setProjectId("all");
    setStatus("all");
    setCategory("all");
    onFilterChange({});
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared"
    });
  };

  const applyFilters = () => {
    const filters = {
      projectId: projectId !== "all" ? projectId : undefined,
      status: status !== "all" ? status : undefined,
      category: category !== "all" ? category : undefined
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
        <div className="grid gap-1.5 w-full md:w-1/4">
          <Label htmlFor="project-filter">Project</Label>
          <Select value={projectId} onValueChange={value => setProjectId(value)}>
            <SelectTrigger id="project-filter">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {(projects || []).map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.project_number} - {project.Sponsor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5 w-full md:w-1/4">
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

        <div className="grid gap-1.5 w-full md:w-1/4">
          <Label htmlFor="category-filter">Task Category</Label>
          <Select value={category} onValueChange={value => setCategory(value)}>
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 w-full md:w-1/4">
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
