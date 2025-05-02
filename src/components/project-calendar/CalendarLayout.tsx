
import React from 'react';
import { CalendarCard } from './CalendarCard';
import { EventsGrid } from './EventsGrid';

interface Event {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  event_date: string | null;
}

interface CalendarLayoutProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  events: Event[];
  hasEditAccess: boolean;
  eventsLoading: boolean;
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: Event) => void;
  isAuthenticated: boolean;
  currentUserId?: string;
}

export function CalendarLayout({
  selectedDate,
  onSelectDate,
  events,
  hasEditAccess,
  eventsLoading,
  onDeleteEvent,
  onEditEvent,
  isAuthenticated,
  currentUserId
}: CalendarLayoutProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
      <CalendarCard
        selectedDate={selectedDate}
        onSelect={onSelectDate}
        hasEditAccess={hasEditAccess}
        events={events}
        isAuthenticated={isAuthenticated}
      />
      
      <EventsGrid
        events={events}
        selectedDate={selectedDate}
        hasEditAccess={hasEditAccess}
        onDelete={onDeleteEvent}
        onEdit={onEditEvent}
        isLoading={eventsLoading}
        currentUserId={currentUserId}
      />
    </div>
  );
}
