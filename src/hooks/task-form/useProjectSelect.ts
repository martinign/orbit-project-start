
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Project {
  id: string;
  project_number: string;
  Sponsor: string;
}

export const useProjectSelect = (initialProjectId?: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(initialProjectId);

  // Fetch projects when needed
  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('id, project_number, Sponsor')
      .order('project_number', { ascending: true });
    
    if (data) setProjects(data);
  };

  return {
    projects,
    selectedProject,
    setSelectedProject,
    fetchProjects
  };
};
