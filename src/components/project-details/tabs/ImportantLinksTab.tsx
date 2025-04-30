
import React from 'react';
import { ImportantLinks } from '@/components/extra-features/ImportantLinks';
import { TabContentWrapper } from './TabContentWrapper';

interface ImportantLinksTabProps {
  projectId: string;
}

export const ImportantLinksTab: React.FC<ImportantLinksTabProps> = ({ projectId }) => {
  return (
    <TabContentWrapper value="important-links" title="Project Important Links">
      <ImportantLinks projectId={projectId} />
    </TabContentWrapper>
  );
};
