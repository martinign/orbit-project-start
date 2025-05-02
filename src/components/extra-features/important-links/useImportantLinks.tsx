import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LinkFormValues } from './ImportantLinkForm';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useLinksState } from './state/useLinksState';
import { useDialogHandlers } from './handlers/useDialogHandlers';
import { 
  fetchImportantLinks, 
  addImportantLink,
  updateImportantLink,
  deleteImportantLink
} from './api/importantLinksApi';

export const useImportantLinks = (projectId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    links, 
    setLinks,
    isLoading, 
    setIsLoading,
    isSubmitting,
    setIsSubmitting,
    currentLink,
    setCurrentLink,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
  } = useLinksState();

  // Type assertion for setCurrentLink to match the expected function signature
  const { openEditDialog, openDeleteDialog } = useDialogHandlers<any>(
    setCurrentLink,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen
  );

  const fetchLinks = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const data = await fetchImportantLinks(projectId);
      console.log("Fetched important links:", data);
      setLinks(data);
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
      await addImportantLink(values, projectId, user.id);
      
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
      await updateImportantLink(values, currentLink.id);
      
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
      await deleteImportantLink(currentLink.id);
      
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
