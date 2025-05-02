
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ImportantLink } from './ImportantLinksTable';
import { LinkFormValues } from './ImportantLinkForm';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

export const useImportantLinks = (projectId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [links, setLinks] = useState<ImportantLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<ImportantLink | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLinks = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_important_links')
        .select('*')
        .eq('link_project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("Fetched important links:", data);
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching important links:', error);
      toast({
        title: 'Error',
        description: 'Failed to load important links',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchLinks();
    }
  }, [projectId]);

  // Add real-time subscription for links
  useRealtimeSubscription({
    table: 'project_important_links',
    filter: projectId ? 'link_project_id' : undefined,
    filterValue: projectId,
    onRecordChange: (payload) => {
      console.log('Important links change detected:', payload);
      fetchLinks(); // Refetch the links when changes occur
    }
  });

  const handleAddLink = async (values: LinkFormValues) => {
    if (!user || !projectId) {
      toast({
        title: 'Error',
        description: 'User or project information missing',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Use explicit column references to avoid ambiguity
      const { error } = await supabase
        .from('project_important_links')
        .insert({
          link_project_id: projectId,
          link_title: values.title,
          link_url: values.url,
          link_description: values.description || null,
          user_id: user.id,
        });

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Link added successfully',
      });
      
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error('Error adding link:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add link',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLink = async (values: LinkFormValues) => {
    if (!currentLink) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('project_important_links')
        .update({
          link_title: values.title,
          link_url: values.url,
          link_description: values.description || null,
        })
        .eq('id', currentLink.id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Link updated successfully',
      });
      
      setIsEditDialogOpen(false);
      setCurrentLink(null);
    } catch (error: any) {
      console.error('Error updating link:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update link',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLink = async () => {
    if (!currentLink) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('project_important_links')
        .delete()
        .eq('id', currentLink.id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Link deleted successfully',
      });
      
      setIsDeleteDialogOpen(false);
      setCurrentLink(null);
    } catch (error: any) {
      console.error('Error deleting link:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete link',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (link: ImportantLink) => {
    setCurrentLink(link);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (link: ImportantLink) => {
    setCurrentLink(link);
    setIsDeleteDialogOpen(true);
  };

  return {
    links,
    isLoading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    currentLink,
    setCurrentLink,
    handleAddLink,
    handleEditLink,
    handleDeleteLink,
    openEditDialog,
    openDeleteDialog,
    isSubmitting,
  };
};
