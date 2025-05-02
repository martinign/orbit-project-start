
import { ImportantLink } from '../ImportantLinksTable';

export const useDialogHandlers = <T extends { id: string }>(
  setCurrentItem: (item: T | null) => void,
  setIsEditDialogOpen: (isOpen: boolean) => void,
  setIsDeleteDialogOpen: (isOpen: boolean) => void,
) => {
  const openEditDialog = (item: T) => {
    setCurrentItem(item);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: T) => {
    setCurrentItem(item);
    setIsDeleteDialogOpen(true);
  };

  return {
    openEditDialog,
    openDeleteDialog,
  };
};
