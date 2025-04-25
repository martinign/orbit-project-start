import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import TaskCard from '../TaskCard';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id: string;
}

interface ColumnConfig {
  id: string;
  title: string;
  status: string;
  color: string;
  badgeColor: string;
}

interface TaskBoardColumnProps {
  column: ColumnConfig;
  tasks: Task[];
  handleEditTask: (task: Task) => void;
  handleDeleteConfirm: (task: Task) => void;
  handleTaskUpdates: (task: Task) => void;
  handleAddSubtask: (task: Task) => void;
  handleCreateTask: (status: string) => void;
}

const TaskBoardColumn: React.FC<TaskBoardColumnProps> = ({
  column,
  tasks,
  handleEditTask,
  handleDeleteConfirm,
  handleTaskUpdates,
  handleAddSubtask,
  handleCreateTask,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const visibleTasks = isCollapsed ? tasks.slice(0, 2) : tasks;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex flex-col h-full group relative bg-gray-50 rounded-md shadow-sm">
      <div className={`p-3 rounded-t-md ${column.color} border-b-2`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium truncate">{column.title}</h3>
            <span className="text-sm text-muted-foreground">
              {isCollapsed && tasks.length > 2 ? `2 of ${tasks.length}` : tasks.length}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={() => handleCreateTask(column.status)}
                    title={`Add task to ${column.title}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add task</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {tasks.length > 2 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={toggleCollapse}
                      title={isCollapsed ? 'Show all tasks' : 'Show less tasks'}
                    >
                      {isCollapsed ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isCollapsed ? 'Show all tasks' : 'Show less tasks'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
      
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="p-2 min-h-[200px] h-full overflow-y-auto"
          >
            <div className="space-y-2">
              {visibleTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  handleEditTask={handleEditTask}
                  handleDeleteConfirm={handleDeleteConfirm}
                  handleTaskUpdates={handleTaskUpdates}
                  handleAddSubtask={handleAddSubtask}
                />
              ))}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskBoardColumn;
