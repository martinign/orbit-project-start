
import React, { useState } from 'react';
import { SiteInitiationDisplay } from './site-initiation/SiteInitiationDisplay';
import { SiteInitiationCSVUploader } from './site-initiation/SiteInitiationCSVUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StarterPacksTab } from './site-initiation/StarterPacksTab';

interface SiteInitiationTrackerProps {
  projectId?: string;
}

export const SiteInitiationTracker: React.FC<SiteInitiationTrackerProps> = ({
  projectId
}) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="starter-packs">Starter Packs</TabsTrigger>
          <TabsTrigger value="import">Import CSV</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <SiteInitiationDisplay projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="starter-packs">
          <StarterPacksTab projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="import">
          <SiteInitiationCSVUploader projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
