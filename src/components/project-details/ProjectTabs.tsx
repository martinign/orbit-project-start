
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TasksList from '@/components/TasksList';
import TaskTimelineView from '@/components/TaskTimelineView';
import ProjectNotes from '@/components/ProjectNotes';
import { ProjectCalendar } from '@/components/project-calendar/ProjectCalendar';
import ContactsList from '@/components/ContactsList';
import TeamMembersList from '@/components/TeamMembersList';
import ProjectInvitationsList from '@/components/project-invitations/ProjectInvitationsList';

interface ProjectTabsProps {
  projectId: string;
  activeTab: string;
  onTabChange: (value: string) => void;
}

const ProjectTabs = ({ projectId, activeTab, onTabChange }: ProjectTabsProps) => {
  return (
    <Tabs defaultValue="tasks" value={activeTab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="contacts">Contacts</TabsTrigger>
        <TabsTrigger value="team">Team Members</TabsTrigger>
        <TabsTrigger value="invites">Invited Members</TabsTrigger>
      </TabsList>

      <TabsContent value="tasks">
        <TasksList projectId={projectId} />
      </TabsContent>

      <TabsContent value="timeline">
        <Card>
          <CardHeader>
            <CardTitle>Task Timeline</CardTitle>
            <CardDescription>View tasks on a timeline with completion metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskTimelineView projectId={projectId} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notes">
        <Card>
          <CardHeader>
            <CardTitle>Project Notes</CardTitle>
            <CardDescription>View and manage project notes</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectNotes projectId={projectId} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="calendar">
        <Card>
          <CardHeader>
            <CardTitle>Project Calendar</CardTitle>
            <CardDescription>View and manage project events</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectCalendar projectId={projectId} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contacts">
        <Card>
          <CardHeader>
            <CardTitle>Project Contacts</CardTitle>
            <CardDescription>View and manage project contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactsList projectId={projectId} searchQuery="" viewMode="table" />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="team">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>View and manage project team members</CardDescription>
          </CardHeader>
          <CardContent>
            <TeamMembersList projectId={projectId} searchQuery="" viewMode="table" />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="invites">
        <Card>
          <CardHeader>
            <CardTitle>Project Invitations</CardTitle>
            <CardDescription>View and manage project invitations</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectInvitationsList projectId={projectId} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProjectTabs;
