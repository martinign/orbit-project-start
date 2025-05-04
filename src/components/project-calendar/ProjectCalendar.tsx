
import React from 'react';
import { CalendarHeader } from './CalendarHeader';
import { CalendarLayout } from './CalendarLayout';
import { EventDialog } from './EventDialog';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { EventsGrid } from './EventsGrid';

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
    selectedUserId,
    setSelectedUserId,
    editingEvent,
    setEditingEvent,
    isEventDialogOpen,
    setIsEventDialogOpen,
    showingDateEvents,
    setShowingDateEvents,
    selectedDateEvents,
    events,
    teamMembers,
    eventsLoading,
    hasEditAccess,
    handleDateSelect,
    handleCreateNewEvent,
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

  const filteredSelectedDateEvents = selectedDateEvents.filter(event => {
    if (!searchQuery) return true;
    return (
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <CalendarHeader 
          selectedUserId={selectedUserId} 
          setSelectedUserId={setSelectedUserId}
          teamMembers={teamMembers}
        />
      </div>
      
      <CalendarLayout 
        selectedDate={selectedDate}
        onSelectDate={handleDateSelect}
        events={filteredEvents}
        hasEditAccess={hasEditAccess}
        eventsLoading={eventsLoading}
        onDeleteEvent={handleDeleteEvent}
        onEditEvent={handleEditEvent}
        isAuthenticated={!!user}
        currentUserId={user?.id}
        lastUpdate={lastUpdate}
        searchQuery={searchQuery}
        showingDateEvents={showingDateEvents}
        selectedDateEvents={filteredSelectedDateEvents}
        onCreateEvent={handleCreateNewEvent}
      />

      <EventDialog
        open={isEventDialogOpen}
        onClose={() => {
          setIsEventDialogOpen(false);
          // Don't reset showingDateEvents when closing dialog
        }}
        onSubmit={handleEventSubmit}
        defaultValues={editingEvent ? {
          title: editingEvent.title,
          description: editingEvent.description || '',
          event_date: editingEvent.event_date ? new Date(editingEvent.event_date) : undefined
        } : {
          event_date: selectedDate
        }}
        mode={editingEvent ? 'edit' : 'create'}
      />
    </div>
  );
};
