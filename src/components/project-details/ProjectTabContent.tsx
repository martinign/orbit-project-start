
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';
import TaskBoard from '../TaskBoard';
import TaskDialog from '../TaskDialog';
import ContactsList from '../ContactsList';
import TeamMembersList from '../TeamMembersList';
import ProjectNotes from '../ProjectNotes';
import ProjectInvitationsList from '../project-invitations/ProjectInvitationsList';
import ContactForm from '../ContactForm';

interface ProjectTabContentProps {
  activeTab: string;
  projectId: string;
  tasks: any[];
  tasksLoading: boolean;
  onRefetchTasks: () => void;
  onRefetchContacts: () => void;
}

const ProjectTabContent = ({ 
  activeTab, 
  projectId, 
  tasks, 
  tasksLoading,
  onRefetchTasks,
  onRefetchContacts
}: ProjectTabContentProps) => {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [isCreateContactOpen, setIsCreateContactOpen] = useState(false);

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
                onRefetch={onRefetchTasks} 
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
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search contacts..."
                  className="pl-8"
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                />
                {contactSearchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10"
                    onClick={() => setContactSearchQuery('')}
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
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
          onRefetchTasks();
          setIsTaskDialogOpen(false);
        }}
      />

      <Dialog open={isCreateContactOpen} onOpenChange={setIsCreateContactOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to this project
            </DialogDescription>
          </DialogHeader>
          <ContactForm 
            projectId={projectId}
            onSuccess={() => {
              setIsCreateContactOpen(false);
              onRefetchContacts();
            }} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectTabContent;
