
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExtraFeaturesState } from '@/hooks/useExtraFeatures';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  CarouselPrevious,
  CarouselNext
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
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <div className="relative mb-4">
        <TabsList className="w-full overflow-x-auto">
          <Carousel opts={{ align: "start", containScroll: "trimSnaps" }}>
            <CarouselContent className="-ml-2">
              {/* Core tabs that are always shown */}
              <CarouselItem className="pl-2 basis-auto">
                <TabsTrigger value="tasks" className="text-xs md:text-sm px-4">Tasks</TabsTrigger>
              </CarouselItem>
              <CarouselItem className="pl-2 basis-auto">
                <TabsTrigger value="notes" className="text-xs md:text-sm px-4">Notes</TabsTrigger>
              </CarouselItem>
              <CarouselItem className="pl-2 basis-auto">
                <TabsTrigger value="calendar" className="text-xs md:text-sm px-4">Calendar</TabsTrigger>
              </CarouselItem>
              <CarouselItem className="pl-2 basis-auto">
                <TabsTrigger value="contacts" className="text-xs md:text-sm px-4">Contacts</TabsTrigger>
              </CarouselItem>
              <CarouselItem className="pl-2 basis-auto">
                <TabsTrigger value="team" className="text-xs md:text-sm px-4">Team</TabsTrigger>
              </CarouselItem>
              
              {/* Conditional tabs */}
              {isProjectOwner && (
                <CarouselItem className="pl-2 basis-auto">
                  <TabsTrigger value="invites" className="text-xs md:text-sm px-4">Invites</TabsTrigger>
                </CarouselItem>
              )}
              
              {safeExtraFeatures.importantLinks && (
                <CarouselItem className="pl-2 basis-auto">
                  <TabsTrigger value="important-links" className="text-xs md:text-sm px-4">Links</TabsTrigger>
                </CarouselItem>
              )}
              
              {safeExtraFeatures.siteInitiationTracker && (
                <CarouselItem className="pl-2 basis-auto">
                  <TabsTrigger value="site-initiation" className="text-xs md:text-sm px-4">Site Tracker</TabsTrigger>
                </CarouselItem>
              )}
              
              {safeExtraFeatures.repository && (
                <CarouselItem className="pl-2 basis-auto">
                  <TabsTrigger value="repository" className="text-xs md:text-sm px-4">Repository</TabsTrigger>
                </CarouselItem>
              )}
              
              {safeExtraFeatures.docPrinting && (
                <CarouselItem className="pl-2 basis-auto">
                  <TabsTrigger value="doc-printing" className="text-xs md:text-sm px-4">Doc Printing</TabsTrigger>
                </CarouselItem>
              )}
              
              {safeExtraFeatures.billOfMaterials && (
                <CarouselItem className="pl-2 basis-auto">
                  <TabsTrigger value="bill-of-materials" className="text-xs md:text-sm px-4">Bill of Materials</TabsTrigger>
                </CarouselItem>
              )}
              
              {safeExtraFeatures.designSheet && (
                <CarouselItem className="pl-2 basis-auto">
                  <TabsTrigger value="design-sheet" className="text-xs md:text-sm px-4">Design Sheet</TabsTrigger>
                </CarouselItem>
              )}
              
              {safeExtraFeatures.workdayScheduled && (
                <CarouselItem className="pl-2 basis-auto">
                  <TabsTrigger value="workday-schedule" className="text-xs md:text-sm px-4">Workday Schedule</TabsTrigger>
                </CarouselItem>
              )}
            </CarouselContent>
            
            <div className="absolute top-0 left-0 h-full flex items-center">
              <CarouselPrevious className="relative -left-0 bg-blue-500 hover:bg-blue-600 text-white" />
            </div>
            
            <div className="absolute top-0 right-0 h-full flex items-center">
              <CarouselNext className="relative -right-0 bg-blue-500 hover:bg-blue-600 text-white" />
            </div>
          </Carousel>
        </TabsList>
      </div>

      {children}
    </Tabs>
  );
};
