
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectNote {
  id: string;
  project_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useProjectNotes(projectId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Check if the current user has project access (is a project member)
  const { data: hasProjectAccess } = useQuery({
    queryKey: ["project_access", projectId],
    queryFn: async () => {
      if (!projectId) return false;
      
      const { data, error } = await supabase
        .rpc('has_project_access', { project_id: projectId });
      
      if (error) {
        console.error("Error checking project access:", error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!projectId,
  });

  // Query to fetch project notes
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["project_notes", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_notes")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching project notes:", error);
        throw error;
      }
      
      console.info("Notes count from query:", data?.length);
      return data as ProjectNote[];
    },
    enabled: !!projectId,
  });

  // Mutation to create a note
  const createNote = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("project_notes")
        .insert({
          title,
          content,
          project_id: projectId,
          user_id: user.id
        })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_notes", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project_notes_count", projectId] });
      queryClient.invalidateQueries({ queryKey: ["new_items_count", projectId] });
      toast({
        title: "Note created",
        description: "Your note has been created successfully.",
      });
    },
    onError: (error) => {
      console.error("Error creating note:", error);
      toast({
        title: "Error",
        description: "Failed to create note. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to update a note
  const updateNote = useMutation({
    mutationFn: async (note: Pick<ProjectNote, "id" | "title" | "content">) => {
      const { data, error } = await supabase
        .from("project_notes")
        .update({
          title: note.title,
          content: note.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", note.id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_notes", projectId] });
      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating note:", error);
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a note
  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      const { data, error } = await supabase
        .from("project_notes")
        .delete()
        .eq("id", noteId)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_notes", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project_notes_count", projectId] });
      queryClient.invalidateQueries({ queryKey: ["new_items_count", projectId] });
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    notes,
    isLoading: isLoading || loading,
    hasProjectAccess,
    createNote,
    updateNote,
    deleteNote,
  };
}
