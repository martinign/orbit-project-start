
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtraFeaturesState } from '@/hooks/useExtraFeatures';
import { useAuth } from '@/contexts/AuthContext';

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
    docPrinting: false,
    workdayScheduled: false,
    vacationTracker: false
  },
  isProjectOwner
}) => {
  // Make sure extraFeatures is never undefined
  const safeExtraFeatures = extraFeatures || {
    importantLinks: false,
    siteInitiationTracker: false,
    docPrinting: false,
    workdayScheduled: false,
    vacationTracker: false
  };
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 w-full">
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
        
        {safeExtraFeatures.docPrinting && (
          <TabsTrigger value="doc-printing" className="text-xs md:text-sm">Doc Printing</TabsTrigger>
        )}
        
        {safeExtraFeatures.workdayScheduled && (
          <TabsTrigger value="workday-schedule" className="text-xs md:text-sm">Workday Schedule</TabsTrigger>
        )}
        
        {safeExtraFeatures.vacationTracker && (
          <TabsTrigger value="vacation-tracker" className="text-xs md:text-sm">Vacation</TabsTrigger>
        )}
      </TabsList>

      {children}
    </Tabs>
  );
};
