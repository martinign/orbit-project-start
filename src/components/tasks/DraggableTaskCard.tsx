
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { TaskCardHeader } from './TaskCardHeader';
import { TaskActions } from './TaskActions';
import { TaskMetadata } from './TaskMetadata';
import { TaskHoverContent } from './TaskHoverContent';
import { useTeamMemberName } from '@/hooks/useTeamMembers';

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
  is_private?: boolean;
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
  const { memberName: assignedToName } = useTeamMemberName(task.assigned_to);

  // Determine the background color based on task properties
  const getBackgroundColor = () => {
    if (task.is_private) {
      return 'bg-[#F1F0FB]'; // Light purple background for private tasks
    }
    if (task.is_gantt_task) {
      return 'bg-[#F2FCE2]'; // Keep existing green background for Gantt tasks
    }
    return ''; // Default background
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Card
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`shadow-sm cursor-pointer hover:shadow-md transition-shadow w-full overflow-hidden ${getBackgroundColor()}`}
              onClick={toggleCardExpand}
            >
              <CardContent className={`p-3 ${isCardExpanded ? '' : 'py-2'}`}>
                {isCardExpanded ? (
                  // Expanded view - show full card content
                  <div className="flex justify-between items-start w-full">
                    <TaskCardHeader
                      title={task.title}
                      hasSubtasks={subtasksCount > 0}
                      isExpanded={isExpanded}
                      toggleExpand={toggleExpand}
                      isPrivate={task.is_private}
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
                ) : (
                  // Collapsed view - show only a single line with title
                  <div className="flex justify-between items-center w-full overflow-hidden whitespace-nowrap">
                    <div className="flex items-center">
                      {task.is_private && (
                        <span className="mr-1 text-purple-500" title="Private task">
                          🔒
                        </span>
                      )}
                      <span className="font-medium truncate max-w-[200px]">
                        {task.title}
                      </span>
                      {subtasksCount > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({subtasksCount})
                        </span>
                      )}
                    </div>
                    
                    {updateCount > 0 && (
                      <span className="ml-auto mr-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {updateCount}
                      </span>
                    )}
                  </div>
                )}

                {isCardExpanded && (
                  <TaskMetadata
                    assignedToName={assignedToName}
                    subtasksCount={subtasksCount}
                    updateCount={updateCount}
                    isPrivate={task.is_private}
                  />
                )}
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
              isPrivate={task.is_private}
            />
          </HoverCardContent>
        </HoverCard>
      )}
    </Draggable>
  );
};
