
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

const ProjectNotes = ({ projectId }: ProjectNotesProps) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ProjectNote | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Fetch project notes
  const fetchNotes = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_notes')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching project notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project notes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription for notes updates
  useEffect(() => {
    if (!projectId) return;

    fetchNotes();

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
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (error) {
      return dateString;
    }
  };

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

  // Save a new note
  const saveNewNote = async () => {
    if (!projectId) return;
    
    try {
      const { error } = await supabase
        .from('project_notes')
        .insert({
          project_id: projectId,
          title,
          content,
          user_id: supabase.auth.getUser().then(res => res.data.user?.id) || '',
        });
        
      if (error) throw error;
      
      setIsCreateDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Note created successfully',
      });
      fetchNotes();
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
      fetchNotes();
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
      fetchNotes();
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
        <div className="grid gap-6">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{note.title}</CardTitle>
                    <CardDescription>
                      {formatDate(note.created_at)}
                      {note.created_at !== note.updated_at && 
                        ` • Updated ${formatDate(note.updated_at)}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditNote(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteConfirmation(note)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {note.content ? (
                    <div className="whitespace-pre-wrap">{note.content}</div>
                  ) : (
                    <p className="text-muted-foreground italic">No content</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No notes found for this project</p>
            <Button onClick={handleCreateNote} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="mr-2 h-4 w-4" />
              Create First Note
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Note Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Note</DialogTitle>
            <DialogDescription>
              Add a new note to this project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-1">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={saveNewNote} 
              disabled={!title.trim()} 
              className="bg-blue-500 hover:bg-blue-600"
            >
              Create Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Update the note details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
              />
            </div>
            <div>
              <label htmlFor="edit-content" className="block text-sm font-medium mb-1">
                Content
              </label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={updateNote} 
              disabled={!title.trim()} 
              className="bg-blue-500 hover:bg-blue-600"
            >
              Update Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note
              "{selectedNote?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteNote}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectNotes;
