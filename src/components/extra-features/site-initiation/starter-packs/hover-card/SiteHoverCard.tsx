
import React, { useState } from 'react';
import { Info, History } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteDetailsTab } from './tabs/SiteDetailsTab';
import { SiteRolesTab } from './tabs/SiteRolesTab';
import { SiteHistoryTab } from './tabs/SiteHistoryTab';
import { SiteData } from '@/hooks/site-initiation/types';
import { SiteStatusHistoryDialog } from '../SiteStatusHistoryDialog';

interface SiteHoverCardProps {
  siteReferences: {
    siteRef: string;
    sites: SiteData[];
    hasSiteData: boolean;
  };
  children: React.ReactNode;
}

export const SiteHoverCard: React.FC<SiteHoverCardProps> = ({
  siteReferences,
  children
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  
  // Extract LABP site specifically, as it's the one we typically work with
  const labpSite = siteReferences.sites.find(site => site.role === 'LABP');
  const firstSite = siteReferences.sites[0];
  const site = labpSite || firstSite;
  
  if (!site) {
    return <>{children}</>;
  }
  
  return (
    <>
      <HoverCard>
        <HoverCardTrigger asChild>
          {children}
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-3 w-3 mr-1" /> 
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="p-1">
              <SiteDetailsTab site={site} />
            </TabsContent>
            
            <TabsContent value="roles" className="p-1">
              <SiteRolesTab sites={siteReferences.sites} />
            </TabsContent>
            
            <TabsContent value="history" className="p-1">
              <SiteHistoryTab 
                site={site} 
                onViewFullHistory={() => setHistoryDialogOpen(true)} 
              />
            </TabsContent>
          </Tabs>
        </HoverCardContent>
      </HoverCard>
      
      <SiteStatusHistoryDialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        projectId={site.project_id}
        siteId={site.id}
        siteRef={site.pxl_site_reference_number}
        siteName={site.site_personnel_name}
      />
    </>
  );
};
