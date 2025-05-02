
import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EventDialog } from './EventDialog';
import { CalendarHeader } from './CalendarHeader';
import { CalendarLayout } from './CalendarLayout';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

interface ProjectCalendarProps {
  projectId: string;
}

export function ProjectCalendar({ projectId }: ProjectCalendarProps) {
  const queryClient = useQueryClient();
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
    user
  } = useCalendarEvents(projectId);
  
  // Add a useEffect for real-time subscriptions
  useEffect(() => {
    // Create a channel for project events changes
    const channel = supabase.channel(`project_events_${projectId}`)
      .on('postgres_changes', {
        event: '*', // Listen for all events: INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'project_events',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        // Invalidate and refetch when any change happens
        console.log('Project events changed, refreshing data:', payload);
        queryClient.invalidateQueries({ queryKey: ['project_events', projectId] });
        queryClient.invalidateQueries({ queryKey: ['project_events_count', projectId] });
        queryClient.invalidateQueries({ queryKey: ['new_items_count', projectId] });
        queryClient.invalidateQueries({ queryKey: ['new_events_count'] });
      })
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

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
