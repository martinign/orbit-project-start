
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ContactsList from '@/components/ContactsList';
import ContactForm from '@/components/ContactForm';

interface ContactsTabProps {
  projectId: string;
  contactSearchQuery: string;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({
  projectId,
  contactSearchQuery,
}) => {
  const [isCreateContactOpen, setIsCreateContactOpen] = useState(false);

  return (
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
    </Card>
  );
};
