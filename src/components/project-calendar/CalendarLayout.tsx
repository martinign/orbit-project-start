
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
  lastUpdate?: number; // Add lastUpdate prop
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
  currentUserId,
  lastUpdate
}: CalendarLayoutProps) {
  // Using lastUpdate in a React.useMemo to force re-evaluation when it changes
  const memoizedEvents = React.useMemo(() => events, [events, lastUpdate]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
      <CalendarCard
        selectedDate={selectedDate}
        onSelect={onSelectDate}
        hasEditAccess={hasEditAccess}
        events={memoizedEvents}
        isAuthenticated={isAuthenticated}
      />
      
      <EventsGrid
        events={memoizedEvents}
        selectedDate={selectedDate}
        hasEditAccess={hasEditAccess}
        onDelete={onDeleteEvent}
        onEdit={onEditEvent}
        isLoading={eventsLoading}
        currentUserId={currentUserId}
        key={`events-grid-${lastUpdate}`} // Use key to force re-render
      />
    </div>
  );
}
