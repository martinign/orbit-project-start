
import React from 'react';
import { CalendarLayout } from './CalendarLayout';
import { EventDialog } from './EventDialog';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

interface ProjectCalendarProps {
  projectId: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ProjectCalendar: React.FC<ProjectCalendarProps> = ({ 
  projectId,
  searchQuery,
  setSearchQuery
}) => {
  const {
    selectedDate,
    setSelectedDate,
    editingEvent,
    setEditingEvent,
    isEventDialogOpen,
    setIsEventDialogOpen,
    events,
    eventsLoading,
    hasEditAccess,
    handleDateSelect,
    handleCreateEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleEventSubmit,
    user,
    lastUpdate
  } = useCalendarEvents(projectId);

  // Filter events based on search query
  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true;
    return (
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <CalendarLayout 
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
          events={filteredEvents}
          hasEditAccess={hasEditAccess}
          eventsLoading={eventsLoading}
          onDeleteEvent={handleDeleteEvent}
          onEditEvent={handleEditEvent}
          onCreateEvent={handleCreateEvent}
          isAuthenticated={!!user}
          currentUserId={user?.id}
          lastUpdate={lastUpdate}
          searchQuery={searchQuery}
        />
      </div>

      <EventDialog
        open={isEventDialogOpen}
        onClose={() => setIsEventDialogOpen(false)}
        onSubmit={handleEventSubmit}
        defaultValues={editingEvent ? {
          title: editingEvent.title,
          description: editingEvent.description || '',
          event_date: editingEvent.event_date ? new Date(editingEvent.event_date) : undefined
        } : undefined}
        mode={editingEvent ? 'edit' : 'create'}
        selectedDate={selectedDate}
      />
    </div>
  );
};
