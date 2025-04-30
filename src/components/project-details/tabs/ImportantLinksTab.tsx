
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { ImportantLinks } from '@/components/extra-features/ImportantLinks';

interface ImportantLinksTabProps {
  projectId: string;
}

export const ImportantLinksTab: React.FC<ImportantLinksTabProps> = ({ projectId }) => {
  return (
    <TabsContent value="important-links" className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Project Important Links</h3>
        <ImportantLinks />
      </div>
    </TabsContent>
  );
};
