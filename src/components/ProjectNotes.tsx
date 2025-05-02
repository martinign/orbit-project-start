
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotesList from './project-notes/NotesList';
import CreateNoteDialog from './project-notes/CreateNoteDialog';
import EditNoteDialog from './project-notes/EditNoteDialog';
import DeleteNoteDialog from './project-notes/DeleteNoteDialog';
import NotesEmptyState from './project-notes/NotesEmptyState';
import { useProjectNotes } from '@/hooks/useProjectNotes';
import { useNoteOperations } from '@/hooks/useNoteOperations';
import { useAuth } from '@/contexts/AuthContext';

export default function ProjectNotes({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const { notes, isLoading, hasProjectAccess } = useProjectNotes(projectId);
  const {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedNote,
    setSelectedNote,
    title,
    setTitle,
    content,
    setContent,
    saveNewNote,
    updateNote,
    deleteNote,
  } = useNoteOperations(projectId);

  const handleCreateNote = () => {
    setTitle('');
    setContent('');
    setIsCreateDialogOpen(true);
  };

  const handleEditNote = (note: any) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirmation = (note: any) => {
    setSelectedNote(note);
    // Fix: Remove the boolean parameter as it's not expected
    setIsDeleteDialogOpen(true);
  };

  const handleSaveNote = (data: { title: string; content: string }) => {
    saveNewNote(data);
  };

  const handleUpdateNote = (data: { title: string; content: string }) => {
    if (selectedNote) {
      updateNote({
        id: selectedNote.id,
        title: data.title,
        content: data.content
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Project Notes</h3>
        {/* Always show Create Note button for authenticated users */}
        {user && (
          <Button 
            onClick={handleCreateNote} 
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Note
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">Loading notes...</div>
      ) : notes.length > 0 ? (
        <NotesList 
          notes={notes} 
          onEditNote={handleEditNote} 
          onDeleteConfirmation={handleDeleteConfirmation}
          hasEditAccess={!!hasProjectAccess}
        />
      ) : (
        <NotesEmptyState onCreateNote={user ? handleCreateNote : undefined} />
      )}

      {/* Dialog components */}
      <CreateNoteDialog 
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={handleSaveNote}
        initialData={{ title, content }}
      />
      
      <EditNoteDialog 
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={handleUpdateNote}
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
      />

      <DeleteNoteDialog 
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={deleteNote}
        selectedNote={selectedNote}
      />
    </div>
  );
}
