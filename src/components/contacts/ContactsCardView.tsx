
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Edit, Trash2, Mail, Phone, Building, MapPin, User } from "lucide-react";
import { Contact } from "@/types/contact";
import { format, isAfter, subDays } from "date-fns";

interface ContactsCardViewProps {
  contacts: Contact[];
  projectId?: string | null;
  onEdit: (e: React.MouseEvent, contact: Contact) => void;
  onDelete: (e: React.MouseEvent, contact: Contact) => void;
}

const ContactsCardView: React.FC<ContactsCardViewProps> = ({
  contacts,
  projectId,
  onEdit,
  onDelete
}) => {
  // Check if the contact was created within the last day
  const isNew = (createdAt: string): boolean => {
    try {
      const yesterday = subDays(new Date(), 1);
      return isAfter(new Date(createdAt), yesterday);
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {contacts.map((contact) => (
        <Card key={contact.id} className="overflow-hidden h-[320px] flex flex-col relative">
          {isNew(contact.created_at) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="success" 
                    className="absolute top-2 right-2 animate-in fade-in"
                  >
                    New
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Added {format(new Date(contact.created_at), 'MMM dd, pp')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-lg truncate">
              {`${contact.full_name}${contact.last_name ? ' ' + contact.last_name : ''}`}
            </CardTitle>
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
                onClick={(e) => onEdit(e, contact)}
                aria-label="Edit contact"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => onDelete(e, contact)}
                aria-label="Delete contact"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ContactsCardView;
