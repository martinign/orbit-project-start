
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Repository } from '@/components/extra-features/Repository';

interface RepositoryTabProps {
  projectId: string;
}

export const RepositoryTab: React.FC<RepositoryTabProps> = ({ projectId }) => {
  return (
    <TabsContent value="repository" className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Project Repository</h3>
        <Repository />
      </div>
    </TabsContent>
  );
};
