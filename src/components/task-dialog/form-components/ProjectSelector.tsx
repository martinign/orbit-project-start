
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  id: string;
  project_number: string;
  Sponsor: string;
}

interface ProjectSelectorProps {
  selectedProject?: string;
  setSelectedProject: (projectId: string) => void;
  projects: Project[];
  hasFixedProject: boolean;
}

const ProjectSelector = ({
  selectedProject,
  setSelectedProject,
  projects,
  hasFixedProject,
}: ProjectSelectorProps) => {
  if (hasFixedProject) return null;

  return (
    <div className="space-y-2">
      <Label htmlFor="project">Project</Label>
      <Select value={selectedProject} onValueChange={setSelectedProject} required>
        <SelectTrigger id="project">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.project_number} - {project.Sponsor}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProjectSelector;
