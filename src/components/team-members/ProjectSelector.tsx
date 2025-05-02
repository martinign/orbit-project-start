
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoaderIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  project_number: string;
  Sponsor?: string;
}

export interface ProjectSelectorProps {
  projects?: Project[];
  selectedProject?: string;
  onProjectChange?: (value: string) => void;
  isLoading?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export function ProjectSelector({ 
  projects, 
  selectedProject, 
  onProjectChange,
  isLoading,
  value,
  onChange,
  disabled,
  required
}: ProjectSelectorProps) {
  // Use either value or selectedProject
  const actualValue = value !== undefined ? value : selectedProject;
  
  // Use either onChange or onProjectChange
  const handleChange = onChange || onProjectChange;
  
  // Fetch projects if they weren't provided
  const { data: fetchedProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ["user_projects"],
    queryFn: async () => {
      if (projects) return projects;
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from("projects")
        .select("id, project_number, Sponsor")
        .eq("user_id", user.user.id)
        .order("project_number");

      if (error) throw error;
      return data as Project[];
    },
    enabled: !projects,
  });
  
  const projectsToShow = projects || fetchedProjects || [];
  const isLoadingProjects = isLoading || projectsLoading;

  return (
    <Select 
      value={actualValue} 
      onValueChange={handleChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={`Select a project${required ? ' *' : ''}`} />
      </SelectTrigger>
      <SelectContent>
        {isLoadingProjects ? (
          <div className="flex items-center justify-center p-2">
            <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </div>
        ) : projectsToShow?.length === 0 ? (
          <div className="p-2 text-center text-sm text-muted-foreground">
            No projects found
          </div>
        ) : (
          projectsToShow.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.project_number} {project.Sponsor ? `- ${project.Sponsor}` : ''}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
