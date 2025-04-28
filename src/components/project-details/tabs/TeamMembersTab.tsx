
import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import TeamMembersList from '@/components/TeamMembersList';
import TeamMemberForm from '@/components/TeamMemberForm';

interface TeamMembersTabProps {
  projectId: string;
  searchQuery?: string;
}

export const TeamMembersTab: React.FC<TeamMembersTabProps> = ({ 
  projectId,
  searchQuery = "",
}) => {
  const [isCreateTeamMemberOpen, setIsCreateTeamMemberOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>View and manage project team members</CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search team members..."
              value={searchQuery}
              className="pl-8 w-[200px]"
              onChange={(e) => {
                // The parent component handles the state
                const event = new CustomEvent('searchQueryChange', {
                  detail: e.target.value
                });
                window.dispatchEvent(event);
              }}
            />
          </div>
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
          searchQuery={searchQuery} 
          viewMode="table" 
        />
      </CardContent>

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
    </Card>
  );
};
