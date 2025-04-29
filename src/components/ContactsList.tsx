
import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types/contact";
import ContactsTable from "./contacts/ContactsTable";
import ContactsCardView from "./contacts/ContactsCardView";
import ContactsEmptyState from "./contacts/ContactsEmptyState";
import DeleteContactDialog from "./contacts/DeleteContactDialog";
import EditContactDialog from "./contacts/EditContactDialog";
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface ContactsListProps {
  projectId?: string | null;
  searchQuery?: string;
  viewMode?: "table" | "card";
}

const ContactsList: React.FC<ContactsListProps> = ({ 
  projectId, 
  searchQuery = "", 
  viewMode = "table" 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["project_contacts", projectId],
    queryFn: async () => {
      let query = supabase
        .from("project_contacts")
        .select("*, projects(project_number, Sponsor)")
        .order("created_at", { ascending: false });
      
      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Contact[] || [];
    },
  });

  useEffect(() => {
    if (contacts && contacts.length > 0) {
      if (!searchQuery.trim()) {
        setFilteredContacts(contacts);
        return;
      }
      
      const query = searchQuery.toLowerCase().trim();
      const filtered = contacts.filter((contact) => 
        contact.full_name?.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.telephone?.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query) ||
        contact.role?.toLowerCase().includes(query) ||
        contact.location?.toLowerCase().includes(query) ||
        contact.projects?.project_number?.toLowerCase().includes(query) ||
        contact.projects?.Sponsor?.toLowerCase().includes(query)
      );
      
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts([]);
    }
  }, [searchQuery, contacts]);

  // Use the improved realtime subscription hook with debouncing to prevent UI freezes
  useRealtimeSubscription({
    table: 'project_contacts',
    event: '*', // Listen for all events: INSERT, UPDATE, DELETE
    filter: projectId ? 'project_id' : undefined,
    filterValue: projectId || undefined,
    onRecordChange: (payload) => {
      console.log("Contact change detected:", payload);
      // Debounce query invalidation
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['project_contacts'] });
        
        // Also invalidate the contact count for the project stats
        if (projectId) {
          queryClient.invalidateQueries({ queryKey: ['project_contacts_count', projectId] });
        }
      }, 100);
    }
  });

  const handleEditContact = (e: React.MouseEvent, contact: Contact) => {
    e.stopPropagation(); // Prevent event bubbling
    setSelectedContact(contact);
    setIsEditContactOpen(true);
  };

  const handleDeleteContact = (e: React.MouseEvent, contact: Contact) => {
    e.stopPropagation(); // Prevent event bubbling
    setSelectedContact(contact);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedContact) return;
    
    try {
      const { error } = await supabase
        .from("project_contacts")
        .delete()
        .eq("id", selectedContact.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete the contact. Please try again.",
          variant: "destructive",
        });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["project_contacts"] });

      toast({
        title: "Success",
        description: "Contact deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCloseEditDialog = () => {
    setIsEditContactOpen(false);
    // Small delay to ensure state is updated correctly
    setTimeout(() => setSelectedContact(null), 100);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    // Small delay to ensure state is updated correctly
    setTimeout(() => setSelectedContact(null), 100);
  };

  if (isLoading) {
    return <div className="text-center py-6">Loading contacts...</div>;
  }

  if (!filteredContacts || filteredContacts.length === 0) {
    return <ContactsEmptyState searchQuery={searchQuery} />;
  }

  return (
    <div className="space-y-4">
      {viewMode === "table" ? (
        <ContactsTable 
          contacts={filteredContacts}
          projectId={projectId}
          onEdit={handleEditContact}
          onDelete={handleDeleteContact}
        />
      ) : (
        <ContactsCardView 
          contacts={filteredContacts}
          projectId={projectId}
          onEdit={handleEditContact}
          onDelete={handleDeleteContact}
        />
      )}

      <EditContactDialog 
        isOpen={isEditContactOpen}
        onClose={handleCloseEditDialog}
        contact={selectedContact}
        onSuccess={() => {
          handleCloseEditDialog();
          queryClient.invalidateQueries({ queryKey: ["project_contacts"] });
          toast({
            title: "Success",
            description: "Contact updated successfully.",
          });
        }}
      />

      <DeleteContactDialog 
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        contact={selectedContact}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ContactsList;
