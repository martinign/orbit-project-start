
import React from 'react';
import { RepositoryDisplay } from './repository/RepositoryDisplay';

interface RepositoryProps {
  projectId?: string;
}

export const Repository: React.FC<RepositoryProps> = ({ projectId }) => {
  return <RepositoryDisplay projectId={projectId} />;
};
