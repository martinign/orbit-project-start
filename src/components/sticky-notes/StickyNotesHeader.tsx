
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface StickyNotesHeaderProps {
  onCreateNote: () => void;
}

export const StickyNotesHeader: React.FC<StickyNotesHeaderProps> = ({ 
  onCreateNote 
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold">Sticky Notes</h1>
        <p className="text-gray-500 mt-1">
          Create and organize your thoughts, reminders, and ideas
        </p>
      </div>
      
      <Button 
        onClick={onCreateNote} 
        className="mt-4 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Note
      </Button>
    </div>
  );
};
