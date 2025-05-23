
import React from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImportantLinksTable } from './important-links/ImportantLinksTable';
import { EmptyImportantLinks } from './important-links/EmptyImportantLinks';
import { ImportantLinkDialogs } from './important-links/ImportantLinkDialogs';
import { useImportantLinks } from './important-links/useImportantLinks';

interface ImportantLinksProps {
  projectId?: string;
}

export const ImportantLinks: React.FC<ImportantLinksProps> = ({ projectId }) => {
  const {
    links,
    isLoading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    currentLink,
    handleAddLink,
    handleEditLink,
    handleDeleteLink,
    openEditDialog,
    openDeleteDialog,
    isSubmitting,
  } = useImportantLinks(projectId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Link
        </Button>
      </div>

      {links.length === 0 ? (
        <EmptyImportantLinks onAddLink={() => setIsAddDialogOpen(true)} />
      ) : (
        <ImportantLinksTable 
          links={links} 
          onEdit={openEditDialog} 
          onDelete={openDeleteDialog} 
        />
      )}

      <ImportantLinkDialogs 
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        currentLink={currentLink}
        handleAddLink={handleAddLink}
        handleEditLink={handleEditLink}
        handleDeleteLink={handleDeleteLink}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
