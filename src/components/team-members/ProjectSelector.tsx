
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

const ProjectSelector = ({ 
  value, 
  onChange, 
  disabled = false,
  required = false 
}: ProjectSelectorProps) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("id, project_number, Sponsor, project_type")
          .order("project_number", { ascending: true });
        
        if (error) throw error;
        setProjects(data || []);
      } catch (error: any) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={isLoading || disabled}
    >
      <SelectTrigger className="mt-1">
        <SelectValue placeholder={`Select a project${required ? ' *' : ''}`} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading">
            Loading projects...
          </SelectItem>
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.project_type === 'non-billable' 
                ? project.project_number 
                : `${project.project_number} - ${project.Sponsor}`}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="none">
            No projects found
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default ProjectSelector;
