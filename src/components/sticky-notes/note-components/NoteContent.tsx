
import React from "react";
import { StickyNote } from "@/hooks/useStickyNotes";

interface NoteContentProps {
  content: string | null;
  isHovered: boolean;
}

export const NoteContent: React.FC<NoteContentProps> = ({ content, isHovered }) => {
  if (!content) return null;
  
  const isContentLong = content && content.length > 100;

  if (isContentLong && !isHovered) {
    return (
      <div className="whitespace-pre-wrap text-gray-700 text-sm transition-all duration-300">
        {content.substring(0, 100)}...
      </div>
    );
  }
  
  return (
    <div 
      className={`whitespace-pre-wrap text-gray-700 text-sm ${isContentLong && isHovered ? 'animate-fade-in' : ''}`}
      style={{
        transition: 'all 0.3s ease',
      }}
    >
      {content}
    </div>
  );
};
