
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyImportantLinksProps {
  onAddLink: () => void;
}

export const EmptyImportantLinks: React.FC<EmptyImportantLinksProps> = ({ onAddLink }) => {
  return (
    <div className="bg-gray-50 p-6 text-center border rounded-md">
      <p className="text-muted-foreground">No important links have been added yet.</p>
      <Button 
        onClick={onAddLink} 
        variant="outline" 
        className="mt-4"
      >
        Add your first link
      </Button>
    </div>
  );
};
