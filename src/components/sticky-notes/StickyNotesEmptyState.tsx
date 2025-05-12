
import React from "react";
import { Button } from "@/components/ui/button";
import { StickyNote } from "lucide-react";

interface StickyNotesEmptyStateProps {
  onCreateNote: () => void;
}

export const StickyNotesEmptyState: React.FC<StickyNotesEmptyStateProps> = ({
  onCreateNote
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg border-gray-300 bg-white">
      <div className="text-center mb-8">
        <StickyNote className="mx-auto h-16 w-16 text-indigo-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No sticky notes yet</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Create your first sticky note to keep track of reminders, ideas, or anything you want to remember.
        </p>
      </div>
      <Button 
        onClick={onCreateNote}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        Create Your First Note
      </Button>
    </div>
  );
};
