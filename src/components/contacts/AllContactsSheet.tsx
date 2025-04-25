
import React from 'react';
import { Contact } from '@/types/contact';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PaginatedTable } from '@/components/common/PaginatedTable';
import ContactsTable from './ContactsTable';

interface AllContactsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  projectId?: string | null;
  onEdit: (e: React.MouseEvent, contact: Contact) => void;
  onDelete: (e: React.MouseEvent, contact: Contact) => void;
}

export function AllContactsSheet({
  isOpen,
  onClose,
  contacts,
  projectId,
  onEdit,
  onDelete
}: AllContactsSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-[900px]">
        <SheetHeader>
          <SheetTitle>All Contacts ({contacts.length})</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <PaginatedTable
            data={contacts}
            pageSize={10}
            renderTable={(paginatedContacts) => (
              <ContactsTable
                contacts={paginatedContacts}
                projectId={projectId}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
