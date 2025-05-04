
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Edit2Icon, Trash2Icon } from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    event_date?: string;
    user_id: string;
  };
  onDelete: () => void;
  onEdit: () => void;
  hasEditAccess?: boolean;
  currentUserId?: string;
}

export function EventCard({
  event,
  onDelete,
  onEdit,
  hasEditAccess = false,
  currentUserId,
}: EventCardProps) {
  // Check if the current user is the creator of the event
  const isOwner = currentUserId === event.user_id;
  // User can edit or delete if they have edit access or they are the owner of the event
  const canModify = hasEditAccess || isOwner;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{event.title}</h3>
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
            {event.description}
          </p>
        )}
        {event.event_date && (
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>{format(new Date(event.event_date), 'PPP')}</span>
          </div>
        )}
      </CardContent>
      {canModify && (
        <CardFooter className="p-2 pt-0 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onEdit}
          >
            <Edit2Icon className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onDelete}
          >
            <Trash2Icon className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
