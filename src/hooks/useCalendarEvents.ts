import { useState, useEffect } from 'react';
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
  created_at: string;
}

interface TeamMember {
  id: string;
  full_name: string;
}

export const useCalendarEvents = (projectId: string) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  // Add a state to track real-time updates
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const { toast } = useToast();
  const { hasEditAccess, createEvent, deleteEvent, updateEvent } = useProjectEvents(projectId);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Query for events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['project_events', projectId, lastUpdate],
    queryFn: async () => {
      console.log(`Fetching events for project ${projectId}, update: ${lastUpdate}`);
      const { data, error } = await supabase
        .from('project_events')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      
      // Sort events by creation date (newest first)
      return (data as Event[]).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });

  // Setup real-time subscription for events
  useEffect(() => {
    console.log(`Setting up real-time subscription for project ${projectId} events`);
    
    const channel = supabase.channel(`calendar_events_${projectId}_${Date.now()}`)
      .on('postgres_changes', {
        event: '*', // Listen for all events: INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'project_events',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        console.log('Project events changed, refreshing data:', payload);
        
        // Force a refresh by updating the lastUpdate state
        setLastUpdate(Date.now());
        
        // Clear any cached queries and force refetch
        queryClient.removeQueries({ queryKey: ['project_events', projectId] });
        queryClient.invalidateQueries({ queryKey: ['project_events', projectId] });
        queryClient.invalidateQueries({ queryKey: ['project_events_count', projectId] });
        queryClient.invalidateQueries({ queryKey: ['new_items_count', projectId] });
        queryClient.invalidateQueries({ queryKey: ['new_events_count'] });
      })
      .subscribe((status) => {
        console.log(`Subscription status for project ${projectId} events: ${status}`);
      });

    // Cleanup function
    return () => {
      console.log(`Removing real-time subscription for project ${projectId} events`);
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

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

  // Modified to only select the date, not open the dialog
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };
  
  // New function to create an event (to be used by the button in EventsList)
  const handleCreateEvent = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create events.",
        variant: "destructive",
      });
      return;
    }
    
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
        setLastUpdate(Date.now()); // Force UI update
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

    try {
      if (editingEvent) {
        await updateEvent.mutateAsync({
          id: editingEvent.id,
          title: data.title,
          description: data.description,
          project_id: projectId,
          event_date: data.event_date?.toISOString(),
        });
      } else {
        // For new events, use the selected date if it exists
        await createEvent.mutateAsync({
          title: data.title,
          description: data.description,
          project_id: projectId,
          event_date: data.event_date?.toISOString() || selectedDate?.toISOString(),
        });
      }
      setIsEventDialogOpen(false);
      setEditingEvent(null);
      
      // Force UI update after mutation
      setLastUpdate(Date.now());
    } catch (error) {
      console.error("Event submission error:", error);
      toast({
        title: 'Error',
        description: 'Failed to save the event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    editingEvent,
    setEditingEvent,
    isEventDialogOpen,
    setIsEventDialogOpen,
    events,
    teamMembers,
    eventsLoading,
    hasEditAccess,
    handleDateSelect,
    handleCreateEvent, 
    handleEditEvent,
    handleDeleteEvent,
    handleEventSubmit,
    user,
    lastUpdate
  };
};
