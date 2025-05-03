
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { SiteData } from '@/hooks/useSiteInitiationData';

interface SiteActionsProps {
  site: SiteData;
  onEdit: (site: SiteData) => void;
  onDelete: (id: string) => void;
}

export const SiteActions: React.FC<SiteActionsProps> = ({ site, onEdit, onDelete }) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button variant="ghost" size="icon" onClick={() => onEdit(site)}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDelete(site.id!)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
