
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
  // Process event dates for highlighting in the calendar
  const eventDates = events
    .filter(event => event.event_date)
    .reduce((acc: { [key: string]: boolean }, event) => {
      if (event.event_date) {
        const date = new Date(event.event_date).toISOString().split('T')[0];
        acc[date] = true;
      }
      return acc;
    }, {});

  return <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      <Card className="p-3 md:col-span-2 py-[20px] px-[48px]">
        <Calendar 
          mode="single" 
          selected={selectedDate} 
          onSelect={onSelectDate} 
          className="w-full"
          modifiers={{
            hasEvent: Object.keys(eventDates).map(d => new Date(d))
          }}
          modifiersStyles={{
            hasEvent: {
              backgroundColor: "#0FA0CE", // Bright blue for event dates
              color: "white",
              fontWeight: "bold"
            }
          }}
        />
      </Card>
      
      <div className="md:col-span-5">
        <EventsGrid events={events} isLoading={eventsLoading} onDeleteEvent={onDeleteEvent} onEditEvent={onEditEvent} hasEditAccess={hasEditAccess} isAuthenticated={isAuthenticated} currentUserId={currentUserId} lastUpdate={lastUpdate} searchQuery={searchQuery} />
      </div>
    </div>;
}
