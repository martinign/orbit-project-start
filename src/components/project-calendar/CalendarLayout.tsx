
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
  onCreateEvent: () => void;
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
  onCreateEvent,
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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
      <Card className="lg:col-span-3 p-4 h-full">
        <div className="calendar-container w-full h-full">
          <Calendar 
            mode="single" 
            selected={selectedDate} 
            onSelect={onSelectDate} 
            className="w-full h-full"
            modifiers={{
              hasEvent: Object.keys(eventsByDate).map(d => new Date(d)),
              today: new Date(),
              selected: selectedDate ? [selectedDate] : []
            }}
            modifiersStyles={{
              hasEvent: {
                fontWeight: "bold"
              },
              today: {
                backgroundColor: "#E5E7EB", // Lighter gray
                color: "black",
                fontWeight: "bold"
              },
              selected: {
                backgroundColor: "transparent", // Remove background
                color: "black", // Keep text black
                fontWeight: "bold",
                border: "2px solid #3B82F6" // Blue-500 border
              }
            }}
            classNames={{
              months: "flex flex-col space-y-4 w-full",
              month: "space-y-4 w-full",
              caption: "flex justify-center pt-2 relative items-center text-lg font-semibold",
              caption_label: "text-base font-medium",
              table: "w-full border-collapse",
              head_row: "flex w-full",
              head_cell: "text-muted-foreground rounded-md w-full py-2 font-medium text-sm",
              row: "flex w-full mt-2",
              cell: "relative h-14 w-full text-center text-sm p-0 rounded-md focus-within:relative focus-within:z-20",
              day: "h-14 w-full p-0 font-normal text-base aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_selected: "border-blue-500 border-2 text-black hover:bg-blue-50 hover:text-black focus:bg-blue-50 focus:text-black",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_hidden: "invisible"
            }}
            components={{
              DayContent: ({ date }) => {
                const dateKey = date.toISOString().split('T')[0];
                const count = eventCounts[dateKey] || 0;
                return (
                  <div className="relative flex flex-col items-center justify-center w-full h-full p-2">
                    {count > 0 && (
                      <span className="absolute top-0.5 right-1 text-xs font-medium bg-blue-500 text-white px-1 py-0.5 rounded-full min-w-[18px] flex items-center justify-center">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                    <span className="text-lg mt-2">{format(date, 'd')}</span>
                  </div>
                );
              }
            }}
          />
        </div>
      </Card>
      
      <div className="lg:col-span-2 h-full">
        <EventsList
          events={filteredSelectedDateEvents}
          date={selectedDate}
          isLoading={eventsLoading}
          onDeleteEvent={onDeleteEvent}
          onEditEvent={onEditEvent}
          onCreateEvent={onCreateEvent}
          hasEditAccess={hasEditAccess}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
