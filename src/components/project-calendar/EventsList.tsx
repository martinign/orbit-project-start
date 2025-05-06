
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Search, Edit2, Trash2, Plus, CalendarX } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface EventsListProps {
  events: any[];
  date: Date | undefined;
  isLoading: boolean;
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: any) => void;
  hasEditAccess: boolean | undefined;
  isAuthenticated: boolean;
  currentUserId: string | undefined;
  searchQuery?: string;
}

export function EventsList({
  events,
  date,
  isLoading,
  onDeleteEvent,
  onEditEvent,
  hasEditAccess,
  isAuthenticated,
  currentUserId,
  searchQuery
}: EventsListProps) {
  // Format the date for display
  const formattedDate = date ? format(date, 'MMMM d, yyyy') : 'Select a date';

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Loading events...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p>Loading events...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!date) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col justify-center items-center h-40">
            <Calendar className="h-12 w-12 text-muted-foreground opacity-30 mb-2" />
            <p className="text-muted-foreground">Select a date to view events</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            {formattedDate}
          </div>
          <div className="text-sm font-normal">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-40 text-center">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 text-muted-foreground opacity-30 mb-2" />
                <p className="font-medium">No events match your search</p>
                <p className="text-sm text-muted-foreground">Try a different search term</p>
              </>
            ) : (
              <>
                <CalendarX className="h-12 w-12 text-muted-foreground opacity-30 mb-2" />
                <p className="font-medium">No events for this day</p>
                {isAuthenticated ? (
                  <p className="text-sm text-muted-foreground">Click the calendar to add an event</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Sign in to add events</p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => {
              // Check if the current user is the creator of the event
              const isOwner = currentUserId === event.user_id;
              // User can edit or delete if they have edit access or they are the owner of the event
              const canModify = hasEditAccess || isOwner;

              return (
                <div key={`${event.id}-${index}`} className="group">
                  {index > 0 && <Separator className="my-3" />}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
                    </div>
                    {canModify && (
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onEditEvent(event)}
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => onDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
