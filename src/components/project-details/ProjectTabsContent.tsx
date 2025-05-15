
import React from 'react';
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
import { ExtraFeaturesState } from '@/hooks/useExtraFeatures';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Placeholder components for new tabs
const BillOfMaterialsTab: React.FC<{projectId: string}> = ({ projectId }) => (
  <div className="p-6">
    <h2 className="text-2xl font-semibold mb-4">TP34-Bill of Materials</h2>
    <p className="text-gray-600">This feature is coming soon. You'll be able to manage bill of materials for this project here.</p>
  </div>
);

const DesignSheetTab: React.FC<{projectId: string}> = ({ projectId }) => (
  <div className="p-6">
    <h2 className="text-2xl font-semibold mb-4">Design Sheet</h2>
    <p className="text-gray-600">This feature is coming soon. You'll be able to manage design sheets for this project here.</p>
  </div>
);

const VacationTrackerTab: React.FC<{projectId: string}> = ({ projectId }) => (
  <div className="p-6">
    <h2 className="text-2xl font-semibold mb-4">Vacation Tracker</h2>
    <p className="text-gray-600">This feature is coming soon. You'll be able to track team vacations for this project here.</p>
  </div>
);

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
  extraFeatures = {
    importantLinks: false,
    siteInitiationTracker: false,
    docPrinting: false,
    billOfMaterials: false,
    designSheet: false,
    workdayScheduled: false,
    vacationTracker: false
  }
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

  // Ensure extraFeatures is never undefined
  const safeFeatures = extraFeatures || {
    importantLinks: false,
    siteInitiationTracker: false,
    docPrinting: false,
    billOfMaterials: false,
    designSheet: false,
    workdayScheduled: false,
    vacationTracker: false
  };

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
      {activeTab === 'important-links' && safeFeatures.importantLinks && (
        <ImportantLinksTab projectId={projectId} />
      )}

      {activeTab === 'site-initiation' && safeFeatures.siteInitiationTracker && (
        <SiteInitiationTrackerTab projectId={projectId} />
      )}
      
      {activeTab === 'doc-printing' && safeFeatures.docPrinting && (
        <DocPrintingTab projectId={projectId} />
      )}
      
      {/* New tabs for Bill of Materials and Design Sheet */}
      {activeTab === 'bill-of-materials' && safeFeatures.billOfMaterials && (
        <BillOfMaterialsTab projectId={projectId} />
      )}
      
      {activeTab === 'design-sheet' && safeFeatures.designSheet && (
        <DesignSheetTab projectId={projectId} />
      )}

      {/* New tab for Workday Schedule */}
      {activeTab === 'workday-schedule' && safeFeatures.workdayScheduled && (
        <WorkdayScheduleTab projectId={projectId} />
      )}
      
      {/* New tab for Vacation Tracker */}
      {activeTab === 'vacation-tracker' && safeFeatures.vacationTracker && (
        <VacationTrackerTab projectId={projectId} />
      )}
    </>
  );
};
