
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
  const { notes, isLoading, hasEditAccess } = useProjectNotes(projectId);
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
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Project Notes</h3>
        {hasEditAccess && (
          <Button 
            onClick={handleCreateNote} 
            className="bg-blue-500 hover:bg-blue-600"
            disabled={!user}
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
          hasEditAccess={!!hasEditAccess}
        />
      ) : (
        <NotesEmptyState onCreateNote={hasEditAccess ? handleCreateNote : undefined} />
      )}

      {/* Dialog components */}
      <CreateNoteDialog 
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={saveNewNote}
        initialData={{ title, content }}
      />
      
      <EditNoteDialog 
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={updateNote}
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
      />

      <DeleteNoteDialog 
        open={isDeleteDialogOpen}
        onClose={setIsDeleteDialogOpen}
        onDelete={deleteNote}
        selectedNote={selectedNote}
      />
    </div>
  );
}
