
import React from 'react';
import { EventDialog } from './EventDialog';
import { CalendarHeader } from './CalendarHeader';
import { CalendarLayout } from './CalendarLayout';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

interface ProjectCalendarProps {
  projectId: string;
  searchQuery?: string;
}

export function ProjectCalendar({ projectId, searchQuery = '' }: ProjectCalendarProps) {
  const {
    selectedDate,
    selectedUserId,
    setSelectedUserId,
    editingEvent,
    setEditingEvent,
    isEventDialogOpen,
    setIsEventDialogOpen,
    events,
    teamMembers,
    eventsLoading,
    hasEditAccess,
    handleDateSelect,
    handleEditEvent,
    handleDeleteEvent,
    handleEventSubmit,
    user,
    lastUpdate
  } = useCalendarEvents(projectId);
  
  // Filter events based on search query
  const filteredEvents = events.filter(event => 
    searchQuery === '' || 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <CalendarHeader 
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        teamMembers={teamMembers}
      />

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
      />

      <EventDialog
        open={isEventDialogOpen}
        onClose={() => {
          setIsEventDialogOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleEventSubmit}
        mode={editingEvent ? 'edit' : 'create'}
        defaultValues={editingEvent ? {
          title: editingEvent.title,
          description: editingEvent.description || '',
          event_date: editingEvent.event_date ? new Date(editingEvent.event_date) : undefined,
        } : {
          title: '',
          description: '',
          event_date: selectedDate
        }}
      />
    </div>
  );
}
