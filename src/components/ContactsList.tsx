import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Mail, Phone, Building, MapPin, User, Plus } from "lucide-react";
import ContactForm from "./ContactForm";

interface Contact {
  id: string;
  full_name: string;
  email: string;
  telephone?: string;
  company?: string;
  role?: string;
  location?: string;
  project_id: string;
  projects?: {
    project_number: string;
    Sponsor: string;
  };
}

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

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditContactOpen(true);
  };

  const handleDeleteContact = (contact: Contact) => {
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

  if (isLoading) {
    return <div className="text-center py-6">Loading contacts...</div>;
  }

  if (!filteredContacts || filteredContacts.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <p className="text-muted-foreground">
          {searchQuery ? "No contacts match your search criteria" : "No contacts found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {viewMode === "table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                {!projectId && <TableHead>Project</TableHead>}
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.full_name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.telephone || "-"}</TableCell>
                  <TableCell>{contact.company || "-"}</TableCell>
                  <TableCell>{contact.role || "-"}</TableCell>
                  {!projectId && (
                    <TableCell>
                      {contact.projects ? 
                        `${contact.projects.project_number} - ${contact.projects.Sponsor}` : 
                        "-"}
                    </TableCell>
                  )}
                  <TableCell>{contact.location || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditContact(contact)}
                        title="Edit contact"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteContact(contact)}
                        title="Delete contact"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="overflow-hidden h-[320px] flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg truncate">{contact.full_name}</CardTitle>
                {contact.role && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {contact.role}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pb-2 flex-grow">
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{contact.email}</span>
                  </p>
                  
                  {contact.telephone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {contact.telephone}
                    </p>
                  )}
                  
                  {contact.company && (
                    <p className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {contact.company}
                    </p>
                  )}
                  
                  {contact.location && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {contact.location}
                    </p>
                  )}
                  
                  {!projectId && contact.projects && (
                    <p className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full inline-block mt-1">
                      {contact.projects.project_number} - {contact.projects.Sponsor}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t p-2 mt-auto">
                <div className="flex gap-1 ml-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditContact(contact)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteContact(contact)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditContactOpen} onOpenChange={setIsEditContactOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information
            </DialogDescription>
          </DialogHeader>
          <ContactForm 
            contact={selectedContact}
            onSuccess={() => {
              setIsEditContactOpen(false);
              queryClient.invalidateQueries({ queryKey: ["project_contacts"] });
              toast({
                title: "Success",
                description: "Contact updated successfully.",
              });
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact
              "{selectedContact?.full_name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContactsList;
