
import React, { useState } from 'react';
import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
          className="inline-block"
        >
          <Button 
            variant="outline"
            className={`relative ${isDropTarget ? 'bg-blue-100 border-blue-500' : ''} bg-blue-500 hover:bg-blue-600 text-white`}
            onClick={onShowArchivedTasks}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Archive className="mr-1 h-4 w-4" />
            Archives
          </Button>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
