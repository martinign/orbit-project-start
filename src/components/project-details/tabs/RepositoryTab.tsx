
import React from 'react';
import { Repository } from '@/components/extra-features/Repository';
import { TabContentWrapper } from './TabContentWrapper';

interface RepositoryTabProps {
  projectId: string;
}

export const RepositoryTab: React.FC<RepositoryTabProps> = ({ projectId }) => {
  return (
    <TabContentWrapper value="repository" title="Project Repository">
      <Repository projectId={projectId} />
    </TabContentWrapper>
  );
};
