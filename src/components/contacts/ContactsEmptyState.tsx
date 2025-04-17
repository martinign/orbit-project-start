
import React from "react";

interface ContactsEmptyStateProps {
  searchQuery?: string;
}

const ContactsEmptyState: React.FC<ContactsEmptyStateProps> = ({
  searchQuery,
}) => {
  return (
    <div className="text-center p-8 border rounded-lg">
      <p className="text-muted-foreground">
        {searchQuery ? "No contacts match your search criteria" : "No contacts found"}
      </p>
    </div>
  );
};

export default ContactsEmptyState;
