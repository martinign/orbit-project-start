import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartGantt } from 'lucide-react';
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
  return <Tabs defaultValue="tasks" value={activeTab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="gantt" className="flex items-center gap-2">
          
          Gantt Chart
        </TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="contacts">Contacts</TabsTrigger>
        <TabsTrigger value="team">Team Members</TabsTrigger>
        <TabsTrigger value="invites">Invited Members</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>;
};