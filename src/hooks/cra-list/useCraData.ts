
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CRAData, CRAFilterOptions } from './types';
import { useAuth } from '@/contexts/AuthContext';

export const useCraData = (projectId?: string) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CRAFilterOptions>({});
  const { user } = useAuth();

  const { data: craList, isLoading, error } = useQuery({
    queryKey: ['cra_list', projectId, filters],
    queryFn: async () => {
      if (!projectId) return [];
      
      let query = supabase
        .from('project_cra_list')
        .select('*')
        .eq('project_id', projectId);
      
      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.country) {
        query = query.eq('study_country', filters.country);
      }
      
      if (filters.role) {
        query = query.eq('study_team_role', filters.role);
      }
        
      const { data, error } = await query;
        
      if (error) throw error;
      return data as CRAData[];
    },
    enabled: !!projectId,
  });

  const addCra = async (craData: CRAData): Promise<boolean> => {
    try {
      // Make sure we have the current user's ID for created_by
      if (!user?.id) throw new Error("User not authenticated");
      
      const insertData = {
        ...craData,
        created_by: user.id,  // Set created_by to the current user's ID
      };
      
      // Make type-safe by explicitly picking only the fields we need
      const { error } = await supabase
        .from('project_cra_list')
        .insert(insertData);
      
      if (error) throw error;
      
      toast({
        title: "CRA Added",
        description: "The CRA has been successfully added.",
      });
      
      // Invalidate query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['cra_list', projectId] });
      return true;
    } catch (error) {
      console.error('Error adding CRA:', error);
      toast({
        title: "Error Adding CRA",
        description: (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateCra = async (id: string, craData: Partial<CRAData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('project_cra_list')
        .update(craData)
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "CRA Updated",
        description: "The CRA has been successfully updated.",
      });
      
      // Invalidate query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['cra_list', projectId] });
      return true;
    } catch (error) {
      console.error('Error updating CRA:', error);
      toast({
        title: "Error Updating CRA",
        description: (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCra = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('project_cra_list')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "CRA Deleted",
        description: "The CRA has been successfully deleted.",
      });
      
      // Invalidate query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['cra_list', projectId] });
      return true;
    } catch (error) {
      console.error('Error deleting CRA:', error);
      toast({
        title: "Error Deleting CRA",
        description: (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Update filters
  const updateFilters = (newFilters: CRAFilterOptions) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({});
  };

  return {
    craList,
    isLoading,
    error,
    addCra,
    updateCra,
    deleteCra,
    filters,
    updateFilters,
    resetFilters
  };
};
