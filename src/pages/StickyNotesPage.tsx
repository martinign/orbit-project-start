
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { StickyNotesHeader } from "@/components/sticky-notes/StickyNotesHeader";
import { StickyNotesGrid } from "@/components/sticky-notes/StickyNotesGrid";
import { StickyNoteDialog } from "@/components/sticky-notes/StickyNoteDialog";
import { useStickyNotes } from "@/hooks/useStickyNotes";
import { StickyNotesEmptyState } from "@/components/sticky-notes/StickyNotesEmptyState";
import { useEnableRealtime } from "@/hooks/sticky-notes/useEnableRealtime";

const StickyNotesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { notes, isLoading, error, refresh } = useStickyNotes();
  
  // This is just for development - ensures realtime is configured correctly
  useEnableRealtime();
  
  const handleOpenCreateDialog = () => {
    setEditingNote(null);
    setIsCreateDialogOpen(true);
  };
  
  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setIsCreateDialogOpen(true);
  };

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim() || !notes) return notes;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return notes.filter(
      note => 
        note.title.toLowerCase().includes(lowercaseQuery) || 
        (note.content && note.content.toLowerCase().includes(lowercaseQuery))
    );
  }, [notes, searchQuery]);

  if (error) {
    toast({
      title: "Error loading sticky notes",
      description: "There was a problem loading your sticky notes. Please try again.",
      variant: "destructive",
    });
  }

  return (
    <div className="container-fluid w-full px-4 sm:px-6">
      <StickyNotesHeader 
        onCreateNote={handleOpenCreateDialog}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : notes && notes.length > 0 ? (
          <StickyNotesGrid 
            notes={filteredNotes} 
            onEditNote={handleEditNote}
          />
        ) : (
          <StickyNotesEmptyState onCreateNote={handleOpenCreateDialog} />
        )}
      </div>
      
      <StickyNoteDialog
        open={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          // Force refresh when closing dialog
          refresh();
        }}
        note={editingNote}
      />
    </div>
  );
};

export default StickyNotesPage;
