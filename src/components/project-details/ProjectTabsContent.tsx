
import React from 'react';
import { TasksTab } from './tabs/TasksTab';
import { NotesTab } from './tabs/NotesTab';
import { CalendarTab } from './tabs/CalendarTab';
import { ContactsTab } from './tabs/ContactsTab';
import { TeamMembersTab } from './tabs/TeamMembersTab';
import { InvitesTab } from './tabs/InvitesTab';
import { ImportantLinksTab } from './tabs/ImportantLinksTab';
import { SiteInitiationTrackerTab } from './tabs/SiteInitiationTrackerTab';
import { RepositoryTab } from './tabs/RepositoryTab';
import { DocPrintingTab } from './tabs/DocPrintingTab';
import { ExtraFeaturesState } from '@/hooks/useExtraFeatures';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProjectTabsContentProps {
  activeTab: string;
  projectId: string;
  tasks: any[];
  tasksLoading: boolean;
  refetchTasks: () => void;
  contactSearchQuery: string;
  setContactSearchQuery: (query: string) => void;
  extraFeatures?: ExtraFeaturesState;
}

export const ProjectTabsContent: React.FC<ProjectTabsContentProps> = ({
  activeTab,
  projectId,
  tasks,
  tasksLoading,
  refetchTasks,
  contactSearchQuery,
  setContactSearchQuery,
  extraFeatures
}) => {
  const [teamSearchQuery, setTeamSearchQuery] = React.useState("");
  const { user } = useAuth();
  
  // Check if current user is the project owner
  const { data: project } = useQuery({
    queryKey: ['project_owner_check', projectId],
    queryFn: async () => {
      if (!projectId || !user) return null;
      const { data, error } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId && !!user
  });
  
  const isProjectOwner = user?.id === project?.user_id;

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

      {activeTab === 'invites' && isProjectOwner && (
        <InvitesTab projectId={projectId} />
      )}

      {/* Extra Features Tabs */}
      {activeTab === 'important-links' && extraFeatures?.importantLinks && (
        <ImportantLinksTab projectId={projectId} />
      )}

      {activeTab === 'site-initiation' && extraFeatures?.siteInitiationTracker && (
        <SiteInitiationTrackerTab projectId={projectId} />
      )}

      {activeTab === 'repository' && extraFeatures?.repository && (
        <RepositoryTab projectId={projectId} />
      )}
      
      {activeTab === 'doc-printing' && extraFeatures?.docPrinting && (
        <DocPrintingTab projectId={projectId} />
      )}
    </>
  );
};
