
import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtraFeaturesState } from '@/hooks/useExtraFeatures';
import { useAuth } from '@/contexts/AuthContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProjectContentTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
  extraFeatures?: ExtraFeaturesState;
  isProjectOwner: boolean;
}

export const ProjectContentTabs: React.FC<ProjectContentTabsProps> = ({
  activeTab,
  onTabChange,
  children,
  extraFeatures = {
    importantLinks: false,
    siteInitiationTracker: false,
    repository: false,
    docPrinting: false,
    billOfMaterials: false,
    designSheet: false,
    workdayScheduled: false
  },
  isProjectOwner
}) => {
  // Make sure extraFeatures is never undefined
  const safeExtraFeatures = extraFeatures || {
    importantLinks: false,
    siteInitiationTracker: false,
    repository: false,
    docPrinting: false,
    billOfMaterials: false,
    designSheet: false,
    workdayScheduled: false
  };

  // Count the number of enabled features to determine if carousel is needed
  const [shouldUseCarousel, setShouldUseCarousel] = useState(false);
  
  useEffect(() => {
    // Calculate if we need the carousel based on the number of enabled features
    const enabledFeaturesCount = Object.values(safeExtraFeatures).filter(Boolean).length;
    const totalTabsCount = 5 + (isProjectOwner ? 1 : 0) + enabledFeaturesCount; // Base tabs + owner tab + enabled features
    
    // If we have many tabs, use carousel
    setShouldUseCarousel(totalTabsCount >= 7);
  }, [safeExtraFeatures, isProjectOwner]);

  // Define tabs content
  const renderTabs = () => (
    <>
      <TabsTrigger value="tasks" className="text-xs md:text-sm">Tasks</TabsTrigger>
      <TabsTrigger value="notes" className="text-xs md:text-sm">Notes</TabsTrigger>
      <TabsTrigger value="calendar" className="text-xs md:text-sm">Calendar</TabsTrigger>
      <TabsTrigger value="contacts" className="text-xs md:text-sm">Contacts</TabsTrigger>
      <TabsTrigger value="team" className="text-xs md:text-sm">Team</TabsTrigger>
      
      {isProjectOwner && (
        <TabsTrigger value="invites" className="text-xs md:text-sm">Invites</TabsTrigger>
      )}
      
      {safeExtraFeatures.importantLinks && (
        <TabsTrigger value="important-links" className="text-xs md:text-sm">Links</TabsTrigger>
      )}
      
      {safeExtraFeatures.siteInitiationTracker && (
        <TabsTrigger value="site-initiation" className="text-xs md:text-sm">Site Tracker</TabsTrigger>
      )}
      
      {safeExtraFeatures.repository && (
        <TabsTrigger value="repository" className="text-xs md:text-sm">Repository</TabsTrigger>
      )}
      
      {safeExtraFeatures.docPrinting && (
        <TabsTrigger value="doc-printing" className="text-xs md:text-sm">Doc Printing</TabsTrigger>
      )}
      
      {safeExtraFeatures.billOfMaterials && (
        <TabsTrigger value="bill-of-materials" className="text-xs md:text-sm">Bill of Materials</TabsTrigger>
      )}
      
      {safeExtraFeatures.designSheet && (
        <TabsTrigger value="design-sheet" className="text-xs md:text-sm">Design Sheet</TabsTrigger>
      )}
      
      {safeExtraFeatures.workdayScheduled && (
        <TabsTrigger value="workday-schedule" className="text-xs md:text-sm">Workday Schedule</TabsTrigger>
      )}
    </>
  );
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      {shouldUseCarousel ? (
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
          >
            <CarouselContent className="ml-0">
              <TabsList className="flex w-full h-auto bg-muted p-1">
                {renderTabs()}
              </TabsList>
            </CarouselContent>
            <CarouselPrevious 
              className="absolute top-1/2 -translate-y-1/2 -left-4 h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none"
              aria-label="Scroll tabs left"
            />
            <CarouselNext 
              className="absolute top-1/2 -translate-y-1/2 -right-4 h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white border-none"
              aria-label="Scroll tabs right"
            />
          </Carousel>
        </div>
      ) : (
        <TabsList className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 w-full">
          {renderTabs()}
        </TabsList>
      )}

      {children}
    </Tabs>
  );
};
