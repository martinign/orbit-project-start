
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListTodo, CalendarDays, Users, FileText, UserRound, Mail, Link, Flag, Archive, Printer } from 'lucide-react';
import { ExtraFeaturesState } from '@/hooks/useExtraFeatures';

interface ProjectContentTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
  extraFeatures?: ExtraFeaturesState;
}

export const ProjectContentTabs: React.FC<ProjectContentTabsProps> = ({
  activeTab,
  onTabChange,
  children,
  extraFeatures
}) => {
  return (
    <Tabs defaultValue="tasks" value={activeTab} onValueChange={onTabChange}>
      <div className="overflow-x-auto pb-2">
        <TabsList className="w-full max-w-fit">
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

          {extraFeatures?.importantLinks && (
            <TabsTrigger value="important-links" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">Important Links</span>
              <span className="sm:hidden">Links</span>
            </TabsTrigger>
          )}

          {extraFeatures?.siteInitiationTracker && (
            <TabsTrigger value="site-initiation" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              <span className="hidden sm:inline">Site Initiation</span>
              <span className="sm:hidden">Site</span>
            </TabsTrigger>
          )}

          {extraFeatures?.repository && (
            <TabsTrigger value="repository" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              <span className="hidden sm:inline">Repository</span>
              <span className="sm:hidden">Repo</span>
            </TabsTrigger>
          )}
          
          {extraFeatures?.docPrinting && (
            <TabsTrigger value="doc-printing" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Doc Printing</span>
              <span className="sm:hidden">Print</span>
            </TabsTrigger>
          )}
        </TabsList>
      </div>
      {children}
    </Tabs>
  );
};
