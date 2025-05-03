
import React, { useState } from 'react';
import { SiteInitiationDisplay } from './site-initiation/SiteInitiationDisplay';
import { SiteInitiationCSVUploader } from './site-initiation/SiteInitiationCSVUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteInitiationTable } from './site-initiation/SiteInitiationTable';

interface SiteInitiationTrackerProps {
  projectId?: string;
}

export const SiteInitiationTracker: React.FC<SiteInitiationTrackerProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sites">Sites</TabsTrigger>
          <TabsTrigger value="import">Import CSV</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <SiteInitiationDisplay projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="sites">
          <SiteInitiationTable projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="import">
          <SiteInitiationCSVUploader projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
