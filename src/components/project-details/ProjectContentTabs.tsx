
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartGantt, ListTodo, CalendarDays, Users, FileText, UserRound, Mail } from 'lucide-react';

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
      <TabsList className="grid grid-cols-7 max-w-3xl">
        <TabsTrigger value="tasks" className="flex items-center gap-2">
          <ListTodo className="h-4 w-4" />
          Tasks
        </TabsTrigger>
        
        <TabsTrigger value="gantt" className="flex items-center gap-2">
          <ChartGantt className="h-4 w-4" />
          Gantt Chart
        </TabsTrigger>
        
        <TabsTrigger value="notes" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Notes
        </TabsTrigger>
        
        <TabsTrigger value="calendar" className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Calendar
        </TabsTrigger>
        
        <TabsTrigger value="contacts" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Contacts
        </TabsTrigger>
        
        <TabsTrigger value="team" className="flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          Team
        </TabsTrigger>
        
        <TabsTrigger value="invites" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Invites
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};
