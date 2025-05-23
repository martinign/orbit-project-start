
import React, { useState, useEffect } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { TasksTab } from './tabs/TasksTab';
import { NotesTab } from './tabs/NotesTab';
import { CalendarTab } from './tabs/CalendarTab';
import { ContactsTab } from './tabs/ContactsTab';
import { TeamMembersTab } from './tabs/TeamMembersTab';
import { InvitesTab } from './tabs/InvitesTab';
import { ImportantLinksTab } from './tabs/ImportantLinksTab';
import { SiteInitiationTrackerTab } from './tabs/SiteInitiationTrackerTab';
import { DocPrintingTab } from './tabs/DocPrintingTab';
import { WorkdayScheduleTab } from './tabs/WorkdayScheduleTab';
import { VacationTrackerTab } from './tabs/VacationTrackerTab';
import { ExtraFeaturesState } from '@/hooks/useExtraFeatures';

interface ProjectTabsContentProps {
  projectId: string;
  extraFeatures?: ExtraFeaturesState;
  isProjectOwner: boolean;
}

export const ProjectTabsContent: React.FC<ProjectTabsContentProps> = ({
  projectId,
  extraFeatures = {
    importantLinks: false,
    siteInitiationTracker: false,
    docPrinting: false,
    workdayScheduled: false,
    vacationTracker: false
  },
  isProjectOwner
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Listen for search query changes from child components
  useEffect(() => {
    const handleSearchQueryChange = (event: CustomEvent<string>) => {
      setSearchQuery(event.detail);
    };

    window.addEventListener('searchQueryChange', handleSearchQueryChange as EventListener);
    return () => {
      window.removeEventListener('searchQueryChange', handleSearchQueryChange as EventListener);
    };
  }, []);

  // Make sure extraFeatures is never undefined
  const safeExtraFeatures = extraFeatures || {
    importantLinks: false,
    siteInitiationTracker: false,
    docPrinting: false,
    workdayScheduled: false,
    vacationTracker: false
  };

  return (
    <>
      <TabsContent value="tasks">
        <TasksTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="notes">
        <NotesTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="calendar">
        <CalendarTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="contacts">
        <ContactsTab projectId={projectId} />
      </TabsContent>

      <TabsContent value="team">
        <TeamMembersTab projectId={projectId} searchQuery={searchQuery} />
      </TabsContent>

      {isProjectOwner && (
        <TabsContent value="invites">
          <InvitesTab projectId={projectId} />
        </TabsContent>
      )}

      {safeExtraFeatures.importantLinks && (
        <TabsContent value="important-links">
          <ImportantLinksTab projectId={projectId} />
        </TabsContent>
      )}

      {safeExtraFeatures.siteInitiationTracker && (
        <TabsContent value="site-initiation">
          <SiteInitiationTrackerTab projectId={projectId} />
        </TabsContent>
      )}

      {safeExtraFeatures.docPrinting && (
        <TabsContent value="doc-printing">
          <DocPrintingTab projectId={projectId} />
        </TabsContent>
      )}

      {safeExtraFeatures.workdayScheduled && (
        <TabsContent value="workday-schedule">
          <WorkdayScheduleTab projectId={projectId} />
        </TabsContent>
      )}

      {safeExtraFeatures.vacationTracker && (
        <TabsContent value="vacation-tracker">
          <VacationTrackerTab projectId={projectId} />
        </TabsContent>
      )}
    </>
  );
};
