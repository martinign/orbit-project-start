
import React from 'react';
import { TasksTab } from './tabs/TasksTab';
import { NotesTab } from './tabs/NotesTab';
import { CalendarTab } from './tabs/CalendarTab';
import { ContactsTab } from './tabs/ContactsTab';
import { TeamMembersTab } from './tabs/TeamMembersTab';
import { InvitesTab } from './tabs/InvitesTab';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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

  const handleRefetch = async () => {
    try {
      await refetchTasks();
    } catch (error) {
      console.error('Error refetching tasks:', error);
    }
  };

  const renderSearchBar = (value: string, onChange: (value: string) => void, placeholder: string) => (
    <div className="mb-4 relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 w-full max-w-xs"
      />
    </div>
  );

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
        <>
          {renderSearchBar(contactSearchQuery, setContactSearchQuery, "Search contacts by name...")}
          <ContactsTab
            projectId={projectId}
            contactSearchQuery={contactSearchQuery}
          />
        </>
      )}

      {activeTab === 'team' && (
        <>
          {renderSearchBar(teamSearchQuery, setTeamSearchQuery, "Search team members by name...")}
          <TeamMembersTab 
            projectId={projectId}
            searchQuery={teamSearchQuery}
          />
        </>
      )}

      {activeTab === 'invites' && (
        <InvitesTab projectId={projectId} />
      )}
    </>
  );
};
