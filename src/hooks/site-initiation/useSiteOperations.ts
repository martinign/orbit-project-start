
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SiteData, SiteOperationsResult } from './types';
import { isEligibleForStarterPack } from './siteUtils';

export const useSiteOperations = (projectId?: string, userId?: string) => {
  const [loading, setLoading] = useState(false);
  
  // Add a single site
  const addSite = async (siteData: SiteData) => {
    if (!userId || !projectId) return null;

    try {
      // Ensure starter pack is false for non-LABP roles
      const updatedSiteData = {
        ...siteData,
        starter_pack: siteData.role === 'LABP' ? siteData.starter_pack : false
      };

      const { data, error } = await supabase
        .from('project_csam_site')
        .insert([{ ...updatedSiteData, user_id: userId, project_id: projectId }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Site added successfully",
        description: "New site has been added to the project.",
      });
      
      return data;
    } catch (error) {
      console.error('Error adding site:', error);
      toast({
        title: "Failed to add site",
        description: (error as Error).message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Update a single site
  const updateSite = async (id: string, updates: Partial<SiteData>) => {
    if (!userId || !projectId) return false;

    try {
      // Get current site data to check role
      const { data: currentSite } = await supabase
        .from('project_csam_site')
        .select('role')
        .eq('id', id)
        .single();

      // Ensure starter pack is false for non-LABP roles
      const updatedData = { ...updates };
      
      // If role is being changed, check if we need to reset starter pack
      if (updates.role && updates.role !== 'LABP') {
        updatedData.starter_pack = false;
      } 
      // If site was not LABP and starter_pack is being set, check role
      else if (updates.starter_pack && currentSite && currentSite.role !== 'LABP') {
        updatedData.starter_pack = false;
      }

      const { error } = await supabase
        .from('project_csam_site')
        .update(updatedData)
        .eq('id', id)
        .eq('project_id', projectId);

      if (error) throw error;
      
      toast({
        title: "Site updated successfully",
        description: "Site information has been updated.",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating site:', error);
      toast({
        title: "Failed to update site",
        description: (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete a single site
  const deleteSite = async (id: string) => {
    if (!userId || !projectId) return false;

    try {
      const { error } = await supabase
        .from('project_csam_site')
        .delete()
        .eq('id', id)
        .eq('project_id', projectId);

      if (error) throw error;
      
      toast({
        title: "Site deleted successfully",
        description: "Site has been removed from the project.",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting site:', error);
      toast({
        title: "Failed to delete site",
        description: (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    loading,
    addSite,
    updateSite,
    deleteSite
  };
};
