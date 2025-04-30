
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { SiteInitiationTracker } from '@/components/extra-features/SiteInitiationTracker';

interface SiteInitiationTrackerTabProps {
  projectId: string;
}

export const SiteInitiationTrackerTab: React.FC<SiteInitiationTrackerTabProps> = ({ projectId }) => {
  return (
    <TabsContent value="site-initiation" className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Site Initiation Tracker</h3>
        <SiteInitiationTracker />
      </div>
    </TabsContent>
  );
};
