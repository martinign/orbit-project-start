
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
      <div className="whitespace-pre-wrap text-gray-700 text-sm">
        {content.substring(0, 100)}...
      </div>
    );
  }
  
  return (
    <div className="whitespace-pre-wrap text-gray-700 text-sm">
      {content}
    </div>
  );
};
