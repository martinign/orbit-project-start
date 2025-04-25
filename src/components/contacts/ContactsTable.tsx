
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { Contact } from "@/types/contact";

interface ContactsTableProps {
  contacts: Contact[];
  projectId?: string | null;
  onEdit: (e: React.MouseEvent, contact: Contact) => void;
  onDelete: (e: React.MouseEvent, contact: Contact) => void;
}

const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  projectId,
  onEdit,
  onDelete
}) => {
  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow className="sticky top-0 z-20 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <TableHead className="h-11 px-4 text-left align-middle font-medium text-muted-foreground">First Name</TableHead>
              <TableHead className="h-11 px-4 text-left align-middle font-medium text-muted-foreground">Last Name</TableHead>
              <TableHead className="h-11 px-4 text-left align-middle font-medium text-muted-foreground">Email</TableHead>
              <TableHead className="h-11 px-4 text-left align-middle font-medium text-muted-foreground">Phone</TableHead>
              <TableHead className="h-11 px-4 text-left align-middle font-medium text-muted-foreground">Company</TableHead>
              <TableHead className="h-11 px-4 text-left align-middle font-medium text-muted-foreground">Role</TableHead>
              {!projectId && <TableHead className="h-11 px-4 text-left align-middle font-medium text-muted-foreground">Project</TableHead>}
              <TableHead className="h-11 px-4 text-right align-middle font-medium text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map(contact => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.full_name}</TableCell>
                <TableCell className="font-medium">{contact.last_name || "-"}</TableCell>            
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.telephone || "-"}</TableCell>
                <TableCell>{contact.company || "-"}</TableCell>
                <TableCell>{contact.role || "-"}</TableCell>
                {!projectId && <TableCell>{contact.projects?.project_number} - {contact.projects?.Sponsor}</TableCell>}
                
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={e => onEdit(e, contact)} aria-label="Edit contact">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={e => onDelete(e, contact)} aria-label="Delete contact">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default ContactsTable;
