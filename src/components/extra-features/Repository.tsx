
import React from 'react';
import { RepositoryDisplay } from './repository/RepositoryDisplay';

interface RepositoryProps {
  projectId?: string;
}

export const Repository: React.FC<RepositoryProps> = ({ projectId }) => {
  // Simple passthrough component to maintain backwards compatibility
  return <RepositoryDisplay projectId={projectId} />;
};
