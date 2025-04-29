
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
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["project_events", projectId] });
        queryClient.invalidateQueries({ queryKey: ["project_events_count", projectId] });
        queryClient.invalidateQueries({ queryKey: ["new_events_count"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard_events"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  const { data: hasEditAccess } = useQuery({
    queryKey: ["project_edit_access", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('has_project_edit_access', { project_id: projectId });
      
      if (error) throw error;
      return !!data;
    },
  });

  const createEvent = useMutation({
    mutationFn: async (event: EventInput) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('project_events')
        .insert({
          ...event,
          user_id: user.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_events", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project_events_count", projectId] });
      queryClient.invalidateQueries({ queryKey: ["new_events_count"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_events"] });
      toast({
        title: "Event created",
        description: "The event has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create the event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...event }: EventInput & { id: string }) => {
      const { error } = await supabase
        .from('project_events')
        .update(event)
        .eq('id', id);

      if (error) throw error;
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update the event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('project_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_events", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project_events_count", projectId] });
      queryClient.invalidateQueries({ queryKey: ["new_events_count"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_events"] });
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    hasEditAccess,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
