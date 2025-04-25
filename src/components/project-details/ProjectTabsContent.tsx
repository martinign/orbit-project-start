
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import TaskBoard from '../TaskBoard';
import ProjectNotes from '../ProjectNotes';
import ContactsList from '../ContactsList';
import TeamMembersList from '../TeamMembersList';
import TaskDialog from '../TaskDialog';
import ContactForm from '../ContactForm';
import TeamMemberForm from '../TeamMemberForm';
import TaskTimelineView from '../TaskTimelineView';
import { ProjectCalendar } from '../project-calendar/ProjectCalendar';
import ProjectInvitationsList from '../project-invitations/ProjectInvitationsList';

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
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isCreateContactOpen, setIsCreateContactOpen] = useState(false);
  const [isCreateTeamMemberOpen, setIsCreateTeamMemberOpen] = useState(false);

  return (
    <>
      {activeTab === 'tasks' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Project Tasks</CardTitle>
              <CardDescription>Manage tasks for this project</CardDescription>
            </div>
            <div>
              <Button 
                onClick={() => setIsTaskDialogOpen(true)} 
                className="bg-blue-500 hover:bg-blue-600"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="text-center py-6">Loading tasks...</div>
            ) : tasks && tasks.length > 0 ? (
              <TaskBoard 
                tasks={tasks} 
                projectId={projectId} 
                onRefetch={refetchTasks} 
              />
            ) : (
              <div className="text-center p-8 border rounded-lg">
                <p className="text-muted-foreground mb-4">No tasks found for this project</p>
                <Button 
                  onClick={() => setIsTaskDialogOpen(true)} 
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" /> Create Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'timeline' && (
        <Card>
          <CardHeader>
            <CardTitle>Task Timeline</CardTitle>
            <CardDescription>View tasks on a timeline with completion metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskTimelineView projectId={projectId} />
          </CardContent>
        </Card>
      )}

      {activeTab === 'notes' && (
        <Card>
          <CardHeader>
            <CardTitle>Project Notes</CardTitle>
            <CardDescription>View and manage project notes</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectNotes projectId={projectId} />
          </CardContent>
        </Card>
      )}

      {activeTab === 'calendar' && (
        <Card>
          <CardHeader>
            <CardTitle>Project Calendar</CardTitle>
            <CardDescription>View and manage project events</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectCalendar projectId={projectId} />
          </CardContent>
        </Card>
      )}

      {activeTab === 'contacts' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Project Contacts</CardTitle>
              <CardDescription>View and manage project contacts</CardDescription>
            </div>
            <div>
              <Button 
                onClick={() => setIsCreateContactOpen(true)} 
                className="bg-blue-500 hover:bg-blue-600"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Contact
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ContactsList 
              projectId={projectId} 
              searchQuery={contactSearchQuery} 
              viewMode="table" 
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'team' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>View and manage project team members</CardDescription>
            </div>
            <div>
              <Button 
                className="bg-blue-500 hover:bg-blue-600"
                size="sm"
                onClick={() => setIsCreateTeamMemberOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TeamMembersList 
              projectId={projectId} 
              searchQuery="" 
              viewMode="table" 
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'invites' && (
        <Card>
          <CardHeader>
            <CardTitle>Project Invitations</CardTitle>
            <CardDescription>View and manage project invitations</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectInvitationsList projectId={projectId} />
          </CardContent>
        </Card>
      )}

      <TaskDialog
        open={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        mode="create"
        projectId={projectId}
        onSuccess={() => {
          refetchTasks();
          setIsTaskDialogOpen(false);
        }}
      />

      <Dialog open={isCreateContactOpen} onOpenChange={setIsCreateContactOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Contact</DialogTitle>
            <DialogDescription>Add a new contact to this project</DialogDescription>
          </DialogHeader>
          <ContactForm 
            projectId={projectId}
            onSuccess={() => {
              setIsCreateContactOpen(false);
            }} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateTeamMemberOpen} onOpenChange={setIsCreateTeamMemberOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Add a new team member to this project</DialogDescription>
          </DialogHeader>
          <TeamMemberForm 
            projectId={projectId}
            onSuccess={() => {
              setIsCreateTeamMemberOpen(false);
            }} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
