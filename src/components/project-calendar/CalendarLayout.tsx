
import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { EventsList } from './EventsList';

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
  const eventsByDate = events.reduce((acc: { [key: string]: any[] }, event) => {
    if (event.event_date) {
      const date = new Date(event.event_date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
    }
    return acc;
  }, {});
  
  // Get events for the selected date
  const selectedDateKey = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
  const selectedDateEvents = selectedDateKey ? (eventsByDate[selectedDateKey] || []) : [];

  // Filter selected date events by search query
  const filteredSelectedDateEvents = selectedDateEvents.filter(event => {
    if (!searchQuery) return true;
    
    return (
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  // Create the event count indicator for calendar days
  const eventCounts = Object.keys(eventsByDate).reduce((acc: { [key: string]: number }, date) => {
    acc[date] = eventsByDate[date].length;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-3 p-6">
        <Calendar 
          mode="single" 
          selected={selectedDate} 
          onSelect={onSelectDate} 
          className="w-full"
          modifiers={{
            hasEvent: Object.keys(eventsByDate).map(d => new Date(d)),
            today: new Date(),
          }}
          modifiersStyles={{
            hasEvent: {
              fontWeight: "bold"
            },
            today: {
              backgroundColor: "#E5E7EB", // Lighter gray
              color: "black",
              fontWeight: "bold"
            }
          }}
          components={{
            DayContent: ({ date }) => {
              const dateKey = date.toISOString().split('T')[0];
              const count = eventCounts[dateKey] || 0;
              return (
                <div className="relative flex items-center justify-center w-full h-full">
                  <span>{format(date, 'd')}</span>
                  {count > 0 && (
                    <span className="absolute bottom-1 text-xs font-medium text-blue-500">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </div>
              );
            }
          }}
        />
      </Card>
      
      <div className="lg:col-span-2">
        <EventsList
          events={filteredSelectedDateEvents}
          date={selectedDate}
          isLoading={eventsLoading}
          onDeleteEvent={onDeleteEvent}
          onEditEvent={onEditEvent}
          hasEditAccess={hasEditAccess}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
