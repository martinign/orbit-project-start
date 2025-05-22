
import React, { useState } from 'react';
import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTaskDragAndDrop } from '@/hooks/useTaskDragAndDrop';
import { Droppable } from '@hello-pangea/dnd';

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
    <Droppable droppableId="archive-drop-target">
      {(provided) => (
        <div 
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <Button 
            variant="outline"
            className={`relative ${isDropTarget ? 'bg-blue-100 border-blue-500' : ''}`}
            onClick={onShowArchivedTasks}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Archive className="mr-1 h-4 w-4" />
            Archives
            {provided.placeholder}
          </Button>
        </div>
      )}
    </Droppable>
  );
};
