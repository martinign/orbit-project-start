
import React from 'react';
import { StarterPackSiteReference } from '../types';
import { 
  Tabs, TabsList, TabsTrigger, TabsContent 
} from '@/components/ui/tabs';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { SiteDetailsTab } from './tabs/SiteDetailsTab';
import { SiteRolesTab } from './tabs/SiteRolesTab';

interface SiteHoverCardProps {
  siteRef: StarterPackSiteReference;
  children: React.ReactNode;
}

export const SiteHoverCard: React.FC<SiteHoverCardProps> = ({ siteRef, children }) => {
  return (
    <HoverCard openDelay={0} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="hover:underline cursor-pointer">
          {children}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 z-50" side="right" sideOffset={10}>
        <div className="space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Site Details</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
            </TabsList>
            
            {/* Site Details Tab */}
            <TabsContent value="details">
              <SiteDetailsTab siteRef={siteRef} />
            </TabsContent>
            
            {/* Roles Tab */}
            <TabsContent value="roles">
              <SiteRolesTab siteRef={siteRef} />
            </TabsContent>
          </Tabs>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
