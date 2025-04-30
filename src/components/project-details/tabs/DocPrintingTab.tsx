
import React from 'react';
import { DocPrinting } from '@/components/extra-features/DocPrinting';
import { TabContentWrapper } from './TabContentWrapper';

interface DocPrintingTabProps {
  projectId: string;
}

export const DocPrintingTab: React.FC<DocPrintingTabProps> = ({ projectId }) => {
  return (
    <TabContentWrapper value="doc-printing" title="Document Printing">
      <DocPrinting projectId={projectId} />
    </TabContentWrapper>
  );
};
