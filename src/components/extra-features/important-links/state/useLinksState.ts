
import { useState } from 'react';
import { ImportantLink } from '../ImportantLinksTable';

export const useLinksState = () => {
  const [links, setLinks] = useState<ImportantLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLink, setCurrentLink] = useState<ImportantLink | null>(null);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return {
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
  };
};
