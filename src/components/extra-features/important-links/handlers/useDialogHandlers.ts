
import { ImportantLink } from '../ImportantLinksTable';

export const useDialogHandlers = (
  setCurrentLink: (link: ImportantLink | null) => void,
  setIsEditDialogOpen: (isOpen: boolean) => void,
  setIsDeleteDialogOpen: (isOpen: boolean) => void,
) => {
  const openEditDialog = (link: ImportantLink) => {
    setCurrentLink(link);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (link: ImportantLink) => {
    setCurrentLink(link);
    setIsDeleteDialogOpen(true);
  };

  return {
    openEditDialog,
    openDeleteDialog,
  };
};
