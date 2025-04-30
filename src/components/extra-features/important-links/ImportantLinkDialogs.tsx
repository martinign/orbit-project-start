
import React from 'react';
import { ImportantLink } from './ImportantLinksTable';
import { ImportantLinkForm, LinkFormValues } from './ImportantLinkForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ImportantLinkDialogsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (isOpen: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (isOpen: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  currentLink: ImportantLink | null;
  handleAddLink: (values: LinkFormValues) => Promise<void>;
  handleEditLink: (values: LinkFormValues) => Promise<void>;
  handleDeleteLink: () => Promise<void>;
  isSubmitting?: boolean;
}

export const ImportantLinkDialogs: React.FC<ImportantLinkDialogsProps> = ({
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
  isSubmitting = false
}) => {
  return (
    <>
      {/* Add Link Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Important Link</DialogTitle>
            <DialogDescription>
              Add a new important link for your project.
            </DialogDescription>
          </DialogHeader>
          <ImportantLinkForm 
            onSubmit={handleAddLink}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Link Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
            <DialogDescription>
              Edit the link details below.
            </DialogDescription>
          </DialogHeader>
          {currentLink && (
            <ImportantLinkForm 
              defaultValues={{
                title: currentLink.title,
                url: currentLink.url,
                description: currentLink.description || '',
              }}
              onSubmit={handleEditLink}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Link Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the link 
              "{currentLink?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLink}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
