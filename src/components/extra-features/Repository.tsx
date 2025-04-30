
import React from 'react';

interface RepositoryProps {
  projectId?: string;
}

export const Repository: React.FC<RepositoryProps> = ({ projectId }) => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium mb-2">Document Repository</h3>
      {projectId ? (
        <p className="text-muted-foreground">Project-specific repository for project ID: {projectId}</p>
      ) : (
        <p className="text-muted-foreground">Global document repository</p>
      )}
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">Upload and manage project documents here.</p>
      </div>
    </div>
  );
};
