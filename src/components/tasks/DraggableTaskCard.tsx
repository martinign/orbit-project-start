
import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { TaskCardHeader } from './TaskCardHeader';
import { TaskActions } from './TaskActions';
import { TaskMetadata } from './TaskMetadata';
import { TaskHoverContent } from './TaskHoverContent';
import { useTeamMemberName } from '@/hooks/useTeamMembers';
import { useTaskUpdates } from '@/hooks/useTaskUpdates';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id: string;
  assigned_to?: string;
  is_gantt_task?: boolean;
  user_id?: string;
  created_at?: string;
  workday_code_id?: string;
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
}) => {
  const { memberName: assignedToName } = useTeamMemberName(task.assigned_to);
  const { updateCount } = useTaskUpdates(task.id);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Card
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`shadow-sm cursor-pointer hover:shadow-md transition-shadow w-full overflow-hidden ${
                task.is_gantt_task ? 'bg-[#F2FCE2]' : ''
              }`}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start w-full">
                  <TaskCardHeader
                    title={task.title}
                    hasSubtasks={subtasksCount > 0}
                    isExpanded={isExpanded}
                    toggleExpand={toggleExpand}
                  />
                  
                  <TaskActions
                    task={task}
                    updateCount={updateCount}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    onAddSubtask={onAddSubtask}
                    onShowUpdates={onShowUpdates}
                  />
                </div>

                <TaskMetadata
                  assignedToName={assignedToName}
                  subtasksCount={subtasksCount}
                  updateCount={updateCount}
                />
              </CardContent>
            </Card>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <TaskHoverContent
              title={task.title}
              description={task.description}
              priority={task.priority}
              dueDate={task.due_date}
              assignedToName={assignedToName}
              createdAt={task.created_at}
              userId={task.user_id}
              workdayCodeId={task.workday_code_id}
            />
          </HoverCardContent>
        </HoverCard>
      )}
    </Draggable>
  );
};
