import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import the smaller component files
import NotesList from './project-notes/NotesList';
import NoteItem from './project-notes/NoteItem';
import CreateNoteDialog from './project-notes/CreateNoteDialog';
import EditNoteDialog from './project-notes/EditNoteDialog';
import DeleteNoteDialog from './project-notes/DeleteNoteDialog';
import NotesEmptyState from './project-notes/NotesEmptyState';

type ProjectNote = {
  id: string;
  project_id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
};

type ProjectNotesProps = {
  projectId: string | undefined;
};

export default function ProjectNotes({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ProjectNote | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  // Add real-time subscription
  useRealtimeSubscription({
    table: 'project_notes',
    filter: 'project_id',
    filterValue: projectId,
    onRecordChange: () => {
      queryClient.invalidateQueries({ queryKey: ['project_notes', projectId] });
    }
  });

  const { toast } = useToast();

  const { data: notesData, isLoading: notesLoading } = useQuery({
    queryKey: ['project_notes', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('project_notes')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching project notes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project notes',
          variant: 'destructive',
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    enabled: !!projectId,
  });

  useEffect(() => {
    if (notesData) {
      setNotes(notesData);
    }
  }, [notesData]);

  // Set up real-time subscription for notes updates
  useEffect(() => {
    if (!projectId) return;

    // Set up realtime subscription
    const channel = supabase
      .channel('project_notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_notes',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['project_notes', projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  // Handle opening the create note dialog
  const handleCreateNote = () => {
    setTitle('');
    setContent('');
    setIsCreateDialogOpen(true);
  };

  // Handle opening the edit note dialog
  const handleEditNote = (note: ProjectNote) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setIsEditDialogOpen(true);
  };

  // Handle opening the delete note dialog
  const handleDeleteConfirmation = (note: ProjectNote) => {
    setSelectedNote(note);
    setIsDeleteDialogOpen(true);
  };

  const handleAddNote = async (note: any) => {
    // Optimistically add the new note
    queryClient.setQueryData(['project_notes', projectId], (old: any[] = []) => {
      return [{ ...note, id: 'temp-' + Date.now() }, ...old];
    });

    try {
      const { error } = await supabase
        .from('project_notes')
        .insert([note]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Note added successfully',
      });
    } catch (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['project_notes', projectId] });
      console.error('Error adding note:', error);
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    }
  };

  // Save a new note
  const saveNewNote = async () => {
    if (!projectId || !userId) {
      toast({
        title: 'Error',
        description: 'User ID or Project ID not available',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('project_notes')
        .insert({
          project_id: projectId,
          title,
          content,
          user_id: userId,
        });
        
      if (error) throw error;
      
      setIsCreateDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Note created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['project_notes', projectId] });
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to create note',
        variant: 'destructive',
      });
    }
  };

  // Update an existing note
  const updateNote = async () => {
    if (!selectedNote) return;
    
    try {
      const { error } = await supabase
        .from('project_notes')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedNote.id);
        
      if (error) throw error;
      
      setIsEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Note updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['project_notes', projectId] });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to update note',
        variant: 'destructive',
      });
    }
  };

  // Delete a note
  const deleteNote = async () => {
    if (!selectedNote) return;
    
    try {
      const { error } = await supabase
        .from('project_notes')
        .delete()
        .eq('id', selectedNote.id);
        
      if (error) throw error;
      
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Note deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['project_notes', projectId] });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Project Notes</h3>
        <Button onClick={handleCreateNote} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="mr-2 h-4 w-4" />
          Create Note
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">Loading notes...</div>
      ) : notes.length > 0 ? (
        <NotesList 
          notes={notes} 
          onEditNote={handleEditNote} 
          onDeleteConfirmation={handleDeleteConfirmation} 
        />
      ) : (
        <NotesEmptyState onCreateNote={handleCreateNote} />
      )}

      {/* Create Note Dialog */}
      <CreateNoteDialog 
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={saveNewNote}
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        isUserIdAvailable={!!userId}
      />

      {/* Edit Note Dialog */}
      <EditNoteDialog 
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={updateNote}
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteNoteDialog 
        open={isDeleteDialogOpen}
        onClose={setIsDeleteDialogOpen}
        onDelete={deleteNote}
        selectedNote={selectedNote}
      />
    </div>
  );
};
