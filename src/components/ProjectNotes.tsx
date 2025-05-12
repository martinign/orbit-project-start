
import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';

interface ProjectNotesProps {
  projectId: string;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export default function ProjectNotes({ projectId, searchQuery: externalSearchQuery, setSearchQuery: setExternalSearchQuery }: ProjectNotesProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
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

  // Use internal state if external search query is not provided
  const finalSearchQuery = externalSearchQuery !== undefined ? externalSearchQuery : searchQuery;
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (setExternalSearchQuery) {
      setExternalSearchQuery(newValue);
    } else {
      setSearchQuery(newValue);
    }
  };

  // Filter notes based on search query only (removed privacy filter)
  const filteredNotes = notes.filter(note => {
    // Filter by search query
    return finalSearchQuery === '' || 
      note.title.toLowerCase().includes(finalSearchQuery.toLowerCase()) ||
      (note.content && note.content.toLowerCase().includes(finalSearchQuery.toLowerCase()));
  });

  const handleCreateNote = () => {
    setTitle('');
    setContent('');
    setIsPrivate(false); // Keep this for compatibility, but it won't be used in UI
    setIsCreateDialogOpen(true);
  };

  const handleEditNote = (note: any) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setIsPrivate(note.is_private); // Keep this for compatibility
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirmation = (note: any) => {
    setSelectedNote(note);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveNote = (data: { title: string; content: string; file?: File | null }) => {
    saveNewNote(data);
  };

  const handleUpdateNote = (data?: { file?: File | null }) => {
    updateNote(data);
  };

  return (
    <div className="space-y-6">
      {/* Controls card - contains create button and search (removed privacy toggle) */}
      {user && (
        <Card className="mb-6">
          <CardContent className="flex justify-between items-center py-4">
            {/* Left side - Create Note button */}
            <Button 
              onClick={handleCreateNote} 
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Note
            </Button>
            
            {/* Right side - Search only (removed Private Notes toggle) */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search notes..."
                className="pl-8 h-9 text-sm w-64"
                value={finalSearchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Notes content */}
      {isLoading ? (
        <div className="flex justify-center py-10">Loading notes...</div>
      ) : filteredNotes.length > 0 ? (
        <NotesList 
          notes={filteredNotes} 
          onEditNote={handleEditNote} 
          onDeleteConfirmation={handleDeleteConfirmation}
          hasEditAccess={!!hasProjectAccess}
        />
      ) : notes.length > 0 && filteredNotes.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground">No notes match your search criteria</p>
        </div>
      ) : (
        <NotesEmptyState onCreateNote={user ? handleCreateNote : null} />
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
        fileDetails={selectedNote ? {
          fileName: selectedNote.file_name,
          filePath: selectedNote.file_path,
          fileType: selectedNote.file_type,
          fileSize: selectedNote.file_size
        } : undefined}
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
