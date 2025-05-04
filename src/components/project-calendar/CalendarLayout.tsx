
import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { EventsGrid } from './EventsGrid';

interface CalendarLayoutProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  events: any[];
  hasEditAccess: boolean | undefined;
  eventsLoading: boolean;
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: any) => void;
  isAuthenticated: boolean;
  currentUserId: string | undefined;
  lastUpdate: number;
  searchQuery?: string;
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
  lastUpdate,
  searchQuery = ''
}: CalendarLayoutProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      <Card className="p-3 md:col-span-2">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          className="w-full"
        />
      </Card>
      
      <div className="md:col-span-5">
        <EventsGrid
          events={events}
          isLoading={eventsLoading}
          onDeleteEvent={onDeleteEvent}
          onEditEvent={onEditEvent}
          hasEditAccess={hasEditAccess}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
          lastUpdate={lastUpdate}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
