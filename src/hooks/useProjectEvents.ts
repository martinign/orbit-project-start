
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface ProjectEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  created_at: string;
  user_id: string;
  project_id: string;
  projects?: {
    project_number: string;
    Sponsor: string;
  };
}

interface EventInput {
  title: string;
  description?: string;
  event_date?: string;
  project_id: string;
}

export function useProjectEvents(projectId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Add real-time subscription for project events
  useEffect(() => {
    const channel = supabase.channel(`events_hook_${projectId}`)
      .on('postgres_changes', {
        event: '*', // Listen for all events: INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'project_events',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        // Log the payload for debugging
        console.log(`Project events changed for ${projectId}:`, payload);
        
        // Invalidate and refetch when any change happens
        queryClient.invalidateQueries({ queryKey: ["project_events", projectId] });
        queryClient.invalidateQueries({ queryKey: ["project_events_count", projectId] });
        queryClient.invalidateQueries({ queryKey: ["new_events_count"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard_events"] });
        queryClient.invalidateQueries({ queryKey: ["new_items_count", projectId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  // Add an explicit check for events access
  const { data: eventsAccessible, isLoading: checkingAccess } = useQuery({
    queryKey: ["project_events_access", projectId],
    queryFn: async () => {
      // Test if we can actually query the events table
      const { data, error } = await supabase
        .from('project_events')
        .select('id')
        .eq('project_id', projectId)
        .limit(1);
      
      if (error) {
        console.error("Access check for project events failed:", error);
        return false;
      }
      
      return true;
    },
  });

  // Query to check if the current user has edit access to the project
  const { data: hasEditAccess, isLoading: checkingEditAccess } = useQuery({
    queryKey: ["project_edit_access", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('has_project_edit_access', { project_id: projectId });
      
      if (error) {
        console.error("Error checking project edit access:", error);
        return false;
      }
      return !!data;
    },
  });

  // Mutation to create an event
  const createEvent = useMutation({
    mutationFn: async (event: EventInput) => {
      if (!user) throw new Error("User not authenticated");

      // The RLS policy will ensure the user has edit access
      const { data, error } = await supabase
        .from('project_events')
        .insert({
          ...event,
          user_id: user.id
        })
        .select();

      if (error) {
        console.error("Error creating event:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_events", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project_events_count", projectId] });
      queryClient.invalidateQueries({ queryKey: ["new_events_count"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_events"] });
      queryClient.invalidateQueries({ queryKey: ["new_items_count", projectId] });
      toast({
        title: "Event created",
        description: "The event has been created successfully.",
      });
    },
    onError: (error) => {
      console.error("Create event error:", error);
      toast({
        title: "Error",
        description: "Failed to create the event. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to update an event
  const updateEvent = useMutation({
    mutationFn: async ({ id, ...event }: EventInput & { id: string }) => {
      // The RLS policy will ensure the user has edit access
      const { data, error } = await supabase
        .from('project_events')
        .update(event)
        .eq('id', id)
        .select();

      if (error) {
        console.error("Error updating event:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_events", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project_events_count", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_events"] });
      toast({
        title: "Event updated",
        description: "The event has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Update event error:", error);
      toast({
        title: "Error",
        description: "Failed to update the event. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to delete an event
  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      // The RLS policy will ensure the user has edit access
      const { data, error } = await supabase
        .from('project_events')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error("Error deleting event:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      // Important: invalidate ALL relevant queries when an event is deleted
      queryClient.invalidateQueries({ queryKey: ["project_events", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project_events_count", projectId] });
      queryClient.invalidateQueries({ queryKey: ["new_events_count"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_events"] });
      queryClient.invalidateQueries({ queryKey: ["new_items_count", projectId] });
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Delete event error:", error);
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    hasEditAccess,
    eventsAccessible,
    isLoading: checkingAccess || checkingEditAccess,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
