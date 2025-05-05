
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CRAData } from './types';

export const useCraOperations = (projectId?: string, userId?: string) => {
  const [loading, setLoading] = useState(false);
  
  // Add a new CRA
  const addCra = async (craData: CRAData): Promise<string | null> => {
    if (!projectId || !userId) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add CRA data.",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      setLoading(true);
      
      const newCra = {
        ...craData,
        project_id: projectId,
        user_id: userId,
        created_by: userId,
        created_date: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('project_cra_list')
        .insert(newCra)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error adding CRA:', error);
        toast({
          title: "Failed to add CRA",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
      
      toast({
        title: "CRA Added",
        description: `Successfully added ${craData.full_name}`,
      });
      
      return data.id;
    } catch (error) {
      console.error('Error in addCra:', error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Update an existing CRA
  const updateCra = async (id: string, craData: Partial<CRAData>): Promise<boolean> => {
    if (!projectId || !userId) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update CRA data.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setLoading(true);
      
      // Remove id from update data if present
      const { id: _, ...updateData } = craData;
      
      const { error } = await supabase
        .from('project_cra_list')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('project_id', projectId);
      
      if (error) {
        console.error('Error updating CRA:', error);
        toast({
          title: "Failed to update CRA",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "CRA Updated",
        description: "Successfully updated CRA information",
      });
      
      return true;
    } catch (error) {
      console.error('Error in updateCra:', error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a CRA
  const deleteCra = async (id: string): Promise<boolean> => {
    if (!projectId || !userId) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to delete CRA data.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('project_cra_list')
        .delete()
        .eq('id', id)
        .eq('project_id', projectId);
      
      if (error) {
        console.error('Error deleting CRA:', error);
        toast({
          title: "Failed to delete CRA",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "CRA Deleted",
        description: "Successfully deleted CRA",
      });
      
      return true;
    } catch (error) {
      console.error('Error in deleteCra:', error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle CRA status (active/inactive)
  const toggleCraStatus = async (id: string, currentStatus: string): Promise<boolean> => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    return updateCra(id, { status: newStatus });
  };
  
  return {
    loading,
    addCra,
    updateCra,
    deleteCra,
    toggleCraStatus
  };
};
