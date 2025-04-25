import React from "react";
import { Button } from "@/components/ui/button";
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
  return <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            {!projectId}
            
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map(contact => <TableRow key={contact.id}>
              <TableCell className="font-medium">{contact.full_name}</TableCell>
              <TableCell className="font-medium">{contact.last_name || "-"}</TableCell>            
              <TableCell>{contact.email}</TableCell>
              <TableCell>{contact.telephone || "-"}</TableCell>
              <TableCell>{contact.company || "-"}</TableCell>
              <TableCell>{contact.role || "-"}</TableCell>
              {!projectId}
              
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
            </TableRow>)}
        </TableBody>
      </Table>
    </div>;
};

export default ContactsTable;
