
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProjectEvents } from '@/hooks/useProjectEvents';

interface Event {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  event_date: string | null;
}

interface TeamMember {
  id: string;
  full_name: string;
}

export const useCalendarEvents = (projectId: string) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const { toast } = useToast();
  const { hasEditAccess, createEvent, deleteEvent, updateEvent } = useProjectEvents(projectId);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Query for events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['project_events', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_events')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      return data as Event[];
    },
  });

  // Query for team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['project_team_members', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_team_members')
        .select('id, full_name')
        .eq('project_id', projectId);

      if (error) throw error;
      return data as TeamMember[];
    },
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create events.",
        variant: "destructive",
      });
      return;
    }

    setSelectedDate(date);
    setEditingEvent(null);
    setIsEventDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    // Check if the current user is the creator of the event
    if (user?.id !== event.user_id) {
      toast({
        title: "Permission denied",
        description: "You can only edit events that you created.",
        variant: "destructive",
      });
      return;
    }
    
    setEditingEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleDeleteEvent = (id: string) => {
    // Find the event to check ownership
    const eventToDelete = events.find(event => event.id === id);
    
    // Check if the current user is the creator of the event
    if (eventToDelete && user?.id !== eventToDelete.user_id) {
      toast({
        title: "Permission denied",
        description: "You can only delete events that you created.",
        variant: "destructive",
      });
      return;
    }
    
    deleteEvent.mutate(id, {
      onSuccess: () => {
        // Re-invalidate these queries specifically to ensure UI refresh
        queryClient.invalidateQueries({ queryKey: ['new_items_count', projectId] });
        queryClient.invalidateQueries({ queryKey: ['new_events_count'] });
      }
    });
  };

  const handleEventSubmit = async (data: {
    title: string;
    description: string;
    event_date?: Date;
  }) => {
    if (!data.title) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (editingEvent) {
      await updateEvent.mutateAsync({
        id: editingEvent.id,
        title: data.title,
        description: data.description,
        project_id: projectId,
        event_date: data.event_date?.toISOString(),
      });
    } else {
      await createEvent.mutateAsync({
        title: data.title,
        description: data.description,
        project_id: projectId,
        event_date: selectedDate?.toISOString(),
      });
    }
    setIsEventDialogOpen(false);
    setEditingEvent(null);
  };

  const filteredEvents = events.filter(event => {
    if (!selectedUserId) return true;
    return event.user_id === selectedUserId;
  });

  return {
    selectedDate,
    setSelectedDate,
    selectedUserId,
    setSelectedUserId,
    editingEvent,
    isEventDialogOpen,
    setIsEventDialogOpen,
    events: filteredEvents,
    teamMembers,
    eventsLoading,
    hasEditAccess,
    handleDateSelect,
    handleEditEvent,
    handleDeleteEvent,
    handleEventSubmit,
    user
  };
};
