
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ContactForm from "@/components/ContactForm";
import { Contact } from "@/types/contact";

interface EditContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onSuccess: () => void;
}

const EditContactDialog: React.FC<EditContactDialogProps> = ({
  isOpen,
  onClose,
  contact,
  onSuccess,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Update contact information
          </DialogDescription>
        </DialogHeader>
        {contact && (
          <ContactForm
            contact={contact}
            onSuccess={() => {
              onSuccess();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditContactDialog;
