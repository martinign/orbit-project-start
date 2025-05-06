
import React, { useState } from 'react';
import { Lock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NotesList from './project-notes/NotesList';
import CreateNoteDialog from './project-notes/CreateNoteDialog';
import EditNoteDialog from './project-notes/EditNoteDialog';
import DeleteNoteDialog from './project-notes/DeleteNoteDialog';
import NotesEmptyState from './project-notes/NotesEmptyState';
import { useProjectNotes } from '@/hooks/useProjectNotes';
import { useNoteOperations } from '@/hooks/useNoteOperations';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectNotesProps {
  projectId: string;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export default function ProjectNotes({ projectId, searchQuery = '', setSearchQuery }: ProjectNotesProps) {
  const { user } = useAuth();
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);
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
    isPrivate,
    setIsPrivate,
    saveNewNote,
    updateNote,
    deleteNote,
  } = useNoteOperations(projectId);

  // Filter notes based on search query and privacy setting
  const filteredNotes = notes.filter(note => {
    // First filter by search query
    const matchesSearch = 
      searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Then filter by privacy setting if needed
    if (showPrivateOnly) {
      return matchesSearch && note.is_private && note.user_id === user?.id;
    }
    
    return matchesSearch;
  });

  const handleSaveNote = (data: { title: string; content: string }) => {
    saveNewNote(data);
  };

  return (
    <div className="space-y-6">
      {/* Search functionality handled in parent component (NotesTab) */}
      
      {isLoading ? (
        <div className="flex justify-center py-10">Loading notes...</div>
      ) : filteredNotes.length > 0 ? (
        <>
          {user && (
            <div className="flex justify-end">
              <Button 
                onClick={() => setShowPrivateOnly(!showPrivateOnly)}
                variant={showPrivateOnly ? "default" : "outline"}
                className={showPrivateOnly ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
              >
                <Lock className="mr-2 h-4 w-4" />
                {showPrivateOnly ? 'Show All Notes' : 'Private Notes Only'}
              </Button>
            </div>
          )}
          <NotesList 
            notes={filteredNotes} 
            onEditNote={(note) => {
              setSelectedNote(note);
              setTitle(note.title);
              setContent(note.content || '');
              setIsPrivate(note.is_private);
              setIsEditDialogOpen(true);
            }} 
            onDeleteConfirmation={(note) => {
              setSelectedNote(note);
              setIsDeleteDialogOpen(true);
            }}
            hasEditAccess={!!hasProjectAccess}
          />
        </>
      ) : notes.length > 0 && filteredNotes.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground">No notes match your search criteria</p>
        </div>
      ) : (
        <NotesEmptyState onCreateNote={user ? () => setIsCreateDialogOpen(true) : undefined} />
      )}

      {/* Dialog components */}
      <CreateNoteDialog 
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={handleSaveNote}
        initialData={{ title, content }}
        isPrivate={isPrivate}
        setIsPrivate={setIsPrivate}
      />
      
      <EditNoteDialog 
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={() => updateNote()}
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        isPrivate={isPrivate}
        setIsPrivate={setIsPrivate}
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
