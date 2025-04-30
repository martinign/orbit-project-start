
import React from 'react';
import { TasksTab } from './tabs/TasksTab';
import { NotesTab } from './tabs/NotesTab';
import { CalendarTab } from './tabs/CalendarTab';
import { ContactsTab } from './tabs/ContactsTab';
import { TeamMembersTab } from './tabs/TeamMembersTab';
import { InvitesTab } from './tabs/InvitesTab';
import { SiteInitiationTab } from './tabs/SiteInitiationTab';
import { ImportantLinksTab } from './tabs/ImportantLinksTab';
import { RepositoryTab } from './tabs/RepositoryTab';
import { useExtraFeatures } from '@/contexts/ExtraFeaturesContext';

interface ProjectTabsContentProps {
  activeTab: string;
  projectId: string;
  tasks: any[];
  tasksLoading: boolean;
  refetchTasks: () => void;
  contactSearchQuery: string;
  setContactSearchQuery: (query: string) => void;
}

export const ProjectTabsContent: React.FC<ProjectTabsContentProps> = ({
  activeTab,
  projectId,
  tasks,
  tasksLoading,
  refetchTasks,
  contactSearchQuery,
  setContactSearchQuery,
}) => {
  const [teamSearchQuery, setTeamSearchQuery] = React.useState("");
  const { selectedFeatures } = useExtraFeatures();

  const handleRefetch = async () => {
    try {
      await refetchTasks();
    } catch (error) {
      console.error('Error refetching tasks:', error);
    }
  };

  // Add event listeners for search queries
  React.useEffect(() => {
    const handleTeamSearch = (e: any) => setTeamSearchQuery(e.detail);
    const handleContactSearch = (e: any) => setContactSearchQuery(e.detail);

    window.addEventListener('searchQueryChange', handleTeamSearch);
    window.addEventListener('contactSearchQueryChange', handleContactSearch);

    return () => {
      window.removeEventListener('searchQueryChange', handleTeamSearch);
      window.removeEventListener('contactSearchQueryChange', handleContactSearch);
    };
  }, [setContactSearchQuery]);

  return (
    <>
      {activeTab === 'tasks' && (
        <TasksTab
          projectId={projectId}
          tasks={tasks}
          tasksLoading={tasksLoading}
          refetchTasks={handleRefetch}
        />
      )}

      {activeTab === 'notes' && (
        <NotesTab projectId={projectId} />
      )}

      {activeTab === 'calendar' && (
        <CalendarTab projectId={projectId} />
      )}

      {activeTab === 'contacts' && (
        <ContactsTab
          projectId={projectId}
          contactSearchQuery={contactSearchQuery}
        />
      )}

      {activeTab === 'team' && (
        <TeamMembersTab 
          projectId={projectId}
          searchQuery={teamSearchQuery}
        />
      )}
      
      {/* Dynamic feature tabs */}
      {activeTab === 'site-initiation' && selectedFeatures.includes('site-initiation') && (
        <SiteInitiationTab projectId={projectId} />
      )}
      
      {activeTab === 'important-links' && selectedFeatures.includes('important-links') && (
        <ImportantLinksTab projectId={projectId} />
      )}
      
      {activeTab === 'repository' && selectedFeatures.includes('repository') && (
        <RepositoryTab projectId={projectId} />
      )}

      {activeTab === 'invites' && (
        <InvitesTab projectId={projectId} />
      )}
    </>
  );
};
