
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface StickyNotesHeaderProps {
  onCreateNote: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const StickyNotesHeader: React.FC<StickyNotesHeaderProps> = ({ 
  onCreateNote,
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold">Sticky Notes</h1>
        <p className="text-gray-500 mt-1">
          Create and organize your thoughts, reminders, and ideas
        </p>
      </div>
      
      <div className="flex items-center gap-3 mt-4 md:mt-0 w-full md:w-auto">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search notes..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={onCreateNote} 
          className="whitespace-nowrap bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>
    </div>
  );
};
