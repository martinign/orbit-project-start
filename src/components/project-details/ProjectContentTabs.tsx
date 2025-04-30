
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListTodo, CalendarDays, Users, FileText, UserRound, Mail } from 'lucide-react';

interface ProjectContentTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

export const ProjectContentTabs: React.FC<ProjectContentTabsProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  return (
    <Tabs defaultValue="tasks" value={activeTab} onValueChange={onTabChange}>
      <div className="overflow-x-auto pb-2">
        <TabsList className="grid grid-cols-6 md:grid-cols-6 sm:grid-cols-4 xs:grid-cols-2 w-full max-w-3xl">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            <span className="hidden sm:inline">Tasks</span>
            <span className="sm:hidden">Tasks</span>
          </TabsTrigger>
          
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Notes</span>
            <span className="sm:hidden">Notes</span>
          </TabsTrigger>
          
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
            <span className="sm:hidden">Cal</span>
          </TabsTrigger>
          
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Contacts</span>
            <span className="sm:hidden">Contacts</span>
          </TabsTrigger>
          
          <TabsTrigger value="team" className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
            <span className="sm:hidden">Team</span>
          </TabsTrigger>
          
          <TabsTrigger value="invites" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Invites</span>
            <span className="sm:hidden">Invites</span>
          </TabsTrigger>
        </TabsList>
      </div>
      {children}
    </Tabs>
  );
};
