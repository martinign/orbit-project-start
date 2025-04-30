
import React from 'react';

interface ImportantLinksProps {
  projectId?: string;
}

export const ImportantLinks: React.FC<ImportantLinksProps> = ({ projectId }) => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium mb-2">Important Links</h3>
      {projectId ? (
        <p className="text-muted-foreground">Project-specific links for project ID: {projectId}</p>
      ) : (
        <p className="text-muted-foreground">Global important links</p>
      )}
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">Add and manage important links here.</p>
      </div>
    </div>
  );
};
