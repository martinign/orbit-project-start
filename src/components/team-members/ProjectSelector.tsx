
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoaderIcon } from "lucide-react";

interface Project {
  id: string;
  project_number: string;
  Sponsor?: string;
}

interface ProjectSelectorProps {
  projects: Project[] | undefined;
  selectedProject: string;
  onProjectChange: (value: string) => void;
  isLoading: boolean;
}

export function ProjectSelector({ 
  projects, 
  selectedProject, 
  onProjectChange, 
  isLoading 
}: ProjectSelectorProps) {
  return (
    <Select value={selectedProject} onValueChange={onProjectChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a project *" />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-2">
            <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </div>
        ) : projects?.length === 0 ? (
          <div className="p-2 text-center text-sm text-muted-foreground">
            No projects found
          </div>
        ) : (
          projects?.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.project_number} {project.Sponsor ? `- ${project.Sponsor}` : ''}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
