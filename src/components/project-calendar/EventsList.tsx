
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Search, Edit2, Trash2, Plus, CalendarX, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EventsListProps {
  events: any[];
  date: Date | undefined;
  isLoading: boolean;
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: any) => void;
  onCreateEvent: () => void;
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
  onCreateEvent,
  hasEditAccess,
  isAuthenticated,
  currentUserId,
  searchQuery
}: EventsListProps) {
  // Format the date for display
  const formattedDate = date ? format(date, 'EEEE, MMMM d, yyyy') : 'Select a date';

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="border-b">
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
        <CardHeader className="border-b">
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
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b py-3 flex-shrink-0">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            {formattedDate}
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm font-normal bg-gray-100 px-2 py-1 rounded">
              {events.length} {events.length === 1 ? 'event' : 'events'}
            </div>
            {isAuthenticated && (
              <Button 
                onClick={onCreateEvent}
                className="bg-blue-500 hover:bg-blue-600 text-white h-8 px-2"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Event
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      {events.length === 0 ? (
        <CardContent className="flex-grow">
          <div className="flex flex-col justify-center items-center h-60 text-center">
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
                  <p className="text-sm text-muted-foreground">Click the "New Event" button to add an event</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Sign in to add events</p>
                )}
              </>
            )}
          </div>
        </CardContent>
      ) : (
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-[calc(100%-2rem)] max-h-[400px]">
            {events.map((event, index) => {
              // Check if the current user is the creator of the event
              const isOwner = currentUserId === event.user_id;
              // User can edit or delete if they have edit access or they are the owner of the event
              const canModify = hasEditAccess || isOwner;
              
              // Extract or generate event time
              const eventTime = event.event_time || "All day";
              
              // Get creator info using the hook
              const EventCreator = () => {
                const { data: userProfile } = useUserProfile(event.user_id);
                return (
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {userProfile?.displayName || 'Unknown User'}
                    </span>
                  </div>
                );
              };

              return (
                <div key={`${event.id}-${index}`} className="group">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <Clock className="h-4 w-4 text-blue-500 mr-1.5" />
                                <span className="text-sm text-gray-500">{eventTime}</span>
                              </div>
                              <h3 className="font-medium text-base">{event.title}</h3>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                              )}
                              <EventCreator />
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
                      </TooltipTrigger>
                      <TooltipContent side="right" className="w-80 p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-lg">{event.title}</h4>
                          {event.description && (
                            <p className="text-sm">{event.description}</p>
                          )}
                          <div className="pt-2 border-t space-y-2">
                            {/* Created by information */}
                            <EventCreator />
                            
                            {/* Created date information */}
                            {event.created_at && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                <span className="text-sm text-gray-500">
                                  Created: {format(new Date(event.created_at), 'PPP')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {index < events.length - 1 && <Separator />}
                </div>
              );
            })}
          </ScrollArea>
        </div>
      )}
    </Card>
  );
}
