
import React from 'react';
import { EventDialog } from './EventDialog';
import { CalendarHeader } from './CalendarHeader';
import { CalendarLayout } from './CalendarLayout';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

interface ProjectCalendarProps {
  projectId: string;
}

export function ProjectCalendar({ projectId }: ProjectCalendarProps) {
  const {
    selectedDate,
    selectedUserId,
    setSelectedUserId,
    editingEvent,
    setEditingEvent, // Make sure we use the setter function
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
    lastUpdate // Include the lastUpdate for forcing re-renders
  } = useCalendarEvents(projectId);
  
  // We've moved the real-time subscription to the useCalendarEvents hook
  // to avoid duplicate subscriptions and ensure consistent state management

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
        events={events}
        hasEditAccess={hasEditAccess}
        eventsLoading={eventsLoading}
        onDeleteEvent={handleDeleteEvent}
        onEditEvent={handleEditEvent}
        isAuthenticated={!!user}
        currentUserId={user?.id}
        lastUpdate={lastUpdate} // Pass down to force re-renders
      />

      <EventDialog
        open={isEventDialogOpen}
        onClose={() => {
          setIsEventDialogOpen(false);
          setEditingEvent(null); // Use the setter function instead of direct assignment
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
