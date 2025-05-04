
import React from 'react';
import { RepositoryDisplay } from './repository/RepositoryDisplay';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';

interface RepositoryProps {
  projectId?: string;
}

export const Repository: React.FC<RepositoryProps> = ({ projectId }) => {
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Project Repository</AlertTitle>
        <AlertDescription>
          Upload and manage project files. All team members with access to this project can view these files.
        </AlertDescription>
      </Alert>
      
      <RepositoryDisplay projectId={projectId} />
    </div>
  );
};
