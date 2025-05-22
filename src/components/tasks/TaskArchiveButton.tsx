
import React, { useState } from 'react';
import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTaskDragAndDrop } from '@/hooks/useTaskDragAndDrop';

interface TaskArchiveButtonProps {
  onShowArchivedTasks: () => void;
}

export const TaskArchiveButton: React.FC<TaskArchiveButtonProps> = ({
  onShowArchivedTasks
}) => {
  const [isDropTarget, setIsDropTarget] = useState(false);
  
  // Handle drop events for the archive button
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(true);
  };

  const handleDragLeave = () => {
    setIsDropTarget(false);
  };

  return (
    <Button 
      variant="outline"
      className={`relative ${isDropTarget ? 'bg-blue-100 border-blue-500' : ''}`}
      onClick={onShowArchivedTasks}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      data-archive-drop-target="true"
    >
      <Archive className="mr-1 h-4 w-4" />
      Archives
    </Button>
  );
};
