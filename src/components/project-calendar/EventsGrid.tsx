
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EventCard } from './EventCard';
import { Calendar, Search } from 'lucide-react';

interface EventsGridProps {
  events: any[];
  isLoading: boolean;
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: any) => void;
  hasEditAccess: boolean | undefined;
  isAuthenticated: boolean;
  currentUserId: string | undefined;
  lastUpdate: number;
  searchQuery?: string;
}

export function EventsGrid({
  events,
  isLoading,
  onDeleteEvent,
  onEditEvent,
  hasEditAccess,
  isAuthenticated,
  currentUserId,
  lastUpdate,
  searchQuery = ''
}: EventsGridProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-40">
          <p>Loading events...</p>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center h-40 text-center">
          {searchQuery ? (
            <>
              <Search className="h-12 w-12 text-muted-foreground opacity-20 mb-2" />
              <p className="font-medium">No events match your search</p>
              <p className="text-muted-foreground text-sm">Try a different search term</p>
            </>
          ) : (
            <>
              <Calendar className="h-12 w-12 text-muted-foreground opacity-20 mb-2" />
              <p className="font-medium">No events scheduled</p>
              <p className="text-muted-foreground text-sm">
                {isAuthenticated
                  ? 'Click on a date to add an event'
                  : 'Sign in to add events'}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {events.map((event) => (
        <EventCard
          key={`${event.id}-${lastUpdate}`}
          event={event}
          onDelete={() => onDeleteEvent(event.id)}
          onEdit={() => onEditEvent(event)}
          hasEditAccess={hasEditAccess}
          // Removing the isOwner prop that's causing the TypeScript error
        />
      ))}
    </div>
  );
}
