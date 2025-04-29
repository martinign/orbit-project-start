
import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import ContactsList from '@/components/ContactsList';
import ContactForm from '@/components/ContactForm';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface ContactsTabProps {
  projectId: string;
  contactSearchQuery: string;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({
  projectId,
  contactSearchQuery,
}) => {
  const [isCreateContactOpen, setIsCreateContactOpen] = useState(false);
  const queryClient = useQueryClient();

  // Use the reusable realtime subscription hook
  useRealtimeSubscription({
    table: 'project_contacts',
    event: '*', // Listen for all events: INSERT, UPDATE, DELETE
    filter: 'project_id',
    filterValue: projectId,
    onRecordChange: (payload) => {
      console.log('Contact change detected:', payload);
      // Invalidate the contacts queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['project_contacts_count', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_contacts', projectId] });
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div>
          <CardTitle>Project Contacts</CardTitle>
          <CardDescription>View and manage project contacts</CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search contacts..."
              value={contactSearchQuery}
              className="pl-8 w-[200px]"
              onChange={(e) => {
                // The parent component handles the state
                const event = new CustomEvent('contactSearchQueryChange', {
                  detail: e.target.value
                });
                window.dispatchEvent(event);
              }}
            />
          </div>
          <Button 
            onClick={() => setIsCreateContactOpen(true)} 
            className="bg-blue-500 hover:bg-blue-600 text-white"
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
              // Invalidate queries to refresh contact list and statistics
              queryClient.invalidateQueries({ queryKey: ['project_contacts', projectId] });
              queryClient.invalidateQueries({ queryKey: ['project_contacts_count', projectId] });
            }} 
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};
