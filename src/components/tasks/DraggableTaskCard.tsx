
import React from 'react';
import { Card } from '@/components/ui/card';
import { Draggable } from '@hello-pangea/dnd';
import { TaskCardHeader } from './TaskCardHeader';
import { TaskHoverContent } from './TaskHoverContent';
import { TaskMetadata } from './TaskMetadata';
import TaskAttachment from './TaskAttachment';

interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: string;
  due_date?: string;
  is_private?: boolean;
  file_name?: string | null;
  file_path?: string | null;
  file_type?: string | null;
  file_size?: number | null;
}

interface DraggableTaskCardProps {
  task: Task;
  index: number;
  subtasksCount: number;
  isExpanded: boolean;
  toggleExpand: (e: React.MouseEvent) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onAddSubtask: (task: Task) => void;
  onShowUpdates: (task: Task) => void;
  updateCount?: number;
}

export const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  index,
  subtasksCount,
  isExpanded,
  toggleExpand,
  onEdit,
  onDelete,
  onUpdate,
  onAddSubtask,
  onShowUpdates,
  updateCount = 0,
}) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card className={`p-3 mb-3 shadow-sm hover:shadow-md transition-shadow ${
            task.is_private ? 'border-l-2 border-l-amber-500' : ''
            } ${snapshot.isDragging ? 'shadow-md' : ''}`}
          >
            <TaskCardHeader
              task={task}
              subtasksCount={subtasksCount}
              isExpanded={isExpanded}
              toggleExpand={toggleExpand}
              updateCount={updateCount}
            />
            
            <div className="text-sm mb-2 text-muted-foreground line-clamp-2">
              {task.description || 'No description'}
            </div>
            
            <TaskMetadata
              dueDate={task.due_date}
              assignedTo={task.assigned_to}
            />
            
            {/* Display file attachment if present */}
            {task.file_name && (
              <TaskAttachment 
                fileName={task.file_name}
                filePath={task.file_path}
                fileType={task.file_type}
                fileSize={task.file_size}
              />
            )}
            
            <TaskHoverContent
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onAddSubtask={onAddSubtask} 
              onShowUpdates={onShowUpdates}
              updateCount={updateCount}
            />
          </Card>
        </div>
      )}
    </Draggable>
  );
};
