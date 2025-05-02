
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
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch projects where the user is owner or has edit permissions
        const { data, error } = await supabase
          .from('projects')
          .select('id, project_number, protocol_title')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          const projectOptions = data.map(project => ({
            value: project.id,
            label: project.protocol_title 
              ? `${project.project_number} - ${project.protocol_title}` 
              : project.project_number
          }));
          setProjects(projectOptions);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [user]);

  return { projects, isLoading };
}
