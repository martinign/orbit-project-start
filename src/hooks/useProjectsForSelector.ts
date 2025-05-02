
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProjectOption {
  value: string;
  label: string;
}

export function useProjectsForSelector() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setProjects([]);
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch projects where the user is owner or has edit permissions
        const { data, error } = await supabase
          .from('projects')
          .select('id, project_number, protocol_title')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching projects:', error);
          setProjects([]);
          return;
        }
        
        // Ensure we always have a valid array of projects
        if (!data || !Array.isArray(data)) {
          setProjects([]);
          return;
        }
        
        const projectOptions = data.map(project => ({
          value: project.id,
          label: project.protocol_title 
            ? `${project.project_number} - ${project.protocol_title}` 
            : project.project_number
        }));
        
        setProjects(projectOptions);
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Set empty array on error to prevent undefined
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [user]);

  // Always return a valid array, even if projects is somehow undefined
  return { 
    projects: Array.isArray(projects) ? projects : [], 
    isLoading 
  };
}
