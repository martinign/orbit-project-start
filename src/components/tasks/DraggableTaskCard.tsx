
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { TaskMetadata } from './TaskMetadata';
import { TaskCardHeader } from './TaskCardHeader';
import { TaskActions } from './TaskActions';
import { TaskHoverContent } from './TaskHoverContent';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id: string;
  assigned_to?: string;
  is_private?: boolean;
  is_archived?: boolean;
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
  isCardExpanded: boolean;
  toggleCardExpand: () => void;
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
  isCardExpanded,
  toggleCardExpand,
}) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "bg-white border rounded-md p-3 mb-2 group hover:shadow-sm transition-all",
            snapshot.isDragging && "shadow-lg",
            task.is_private && "bg-gray-50",
            task.is_archived && "opacity-70"
          )}
        >
          <div className="flex justify-between">
            <TaskCardHeader 
              title={task.title} 
              hasSubtasks={subtasksCount > 0} 
              isExpanded={isExpanded}
              toggleExpand={toggleExpand}
              isPrivate={task.is_private}
            />
            <TaskActions 
              task={task}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task)}
              onUpdate={() => onUpdate(task)}
              onAddSubtask={() => onAddSubtask(task)}
              onShowUpdates={() => onShowUpdates(task)}
              updateCount={updateCount}
            />
          </div>
          
          <TaskMetadata task={task} />
          
          {isCardExpanded && task.description && (
            <TaskHoverContent 
              description={task.description} 
              toggleCardExpand={toggleCardExpand}
            />
          )}
        </div>
      )}
    </Draggable>
  );
};
