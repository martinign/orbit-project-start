
import React, { useState } from 'react';
import { EventCard } from './EventCard';
import { Card } from '@/components/ui/card';

interface EventsGridProps {
  events: any[];
  isLoading: boolean;
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: any) => void;
  hasEditAccess?: boolean | undefined;
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
  // Filter events based on search query if provided
  const filteredEvents = searchQuery ? 
    events.filter(event => 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : 
    events;
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-3 animate-pulse h-20">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <Card className="p-4 text-center">
        {searchQuery ? 
          <p className="text-muted-foreground">No events match your search</p> : 
          <p className="text-muted-foreground">No events scheduled for this period</p>
        }
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {filteredEvents.map((event) => (
        <EventCard 
          key={`${event.id}-${lastUpdate}`} 
          event={event} 
          onDelete={onDeleteEvent} 
          onEdit={onEditEvent}
          isAuthenticated={isAuthenticated}
          isOwner={event.user_id === currentUserId}
          hasEditAccess={hasEditAccess}
        />
      ))}
    </div>
  );
}
