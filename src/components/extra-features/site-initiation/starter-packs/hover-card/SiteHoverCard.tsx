
import React, { useState } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteDetailsTab } from './tabs/SiteDetailsTab';
import { SiteRolesTab } from './tabs/SiteRolesTab';
import { SiteData } from '@/hooks/site-initiation/types';

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
  
  // Extract LABP site specifically, as it's the one we typically work with
  const labpSite = siteReferences.sites.find(site => site.role === 'LABP');
  const firstSite = siteReferences.sites[0];
  const site = labpSite || firstSite;
  
  if (!site) {
    return <>{children}</>;
  }
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="p-1">
            <SiteDetailsTab site={site} />
          </TabsContent>
          
          <TabsContent value="roles" className="p-1">
            <SiteRolesTab sites={siteReferences.sites} />
          </TabsContent>
        </Tabs>
      </HoverCardContent>
    </HoverCard>
  );
};
