
import { Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { TaskCardHeader } from "./TaskCardHeader";
import { TaskActions } from "./TaskActions";
import { TaskMetadata } from "./TaskMetadata";
import { TaskHoverContent } from "./TaskHoverContent";
import { Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  project_id: string;
  is_private?: boolean;
  is_archived?: boolean;
  description?: string;
  due_date?: string;
  assigned_to?: string;
  created_at?: string;
  user_id?: string;
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
  updateCount: number;
  isCardExpanded: boolean;
  toggleCardExpand: () => void;
}

export const DraggableTaskCard = ({
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
  updateCount,
  isCardExpanded,
  toggleCardExpand
}: DraggableTaskCardProps) => {
  const { id, title, priority, is_private, is_archived } = task;

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "p-2 mb-2 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border-l-4",
            {
              "border-blue-500": priority === "high",
              "border-yellow-500": priority === "medium",
              "border-green-500": priority === "low",
              "border-purple-500": is_archived,
              "opacity-70": is_archived,
            }
          )}
          onClick={toggleCardExpand}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <TaskCardHeader
                title={title}
                hasSubtasks={subtasksCount > 0}
                isExpanded={isExpanded}
                toggleExpand={toggleExpand}
                isPrivate={is_private}
              />
              
              {/* Archive indicator */}
              {is_archived && (
                <Badge variant="outline" className="flex items-center gap-1 mt-1 bg-purple-50 text-purple-700 border-purple-300">
                  <Archive className="h-3 w-3" />
                  Archived
                </Badge>
              )}

              {/* Private indicator */}
              {is_private && (
                <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-300">
                  Private
                </Badge>
              )}
              
              <TaskMetadata 
                subtasksCount={subtasksCount}
                updateCount={updateCount}
                isPrivate={is_private}
              />
            </div>

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

          {isCardExpanded && (
            <TaskHoverContent 
              title={task.title}
              description={task.description}
              priority={task.priority}
              dueDate={task.due_date}
              createdAt={task.created_at}
              userId={task.user_id}
              workdayCodeId={task.workday_code_id}
              isPrivate={task.is_private}
            />
          )}
        </div>
      )}
    </Draggable>
  );
};
