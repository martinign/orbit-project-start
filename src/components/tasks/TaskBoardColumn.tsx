
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TaskCard from '../TaskCard';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id: string;
  is_private?: boolean;
}

interface ColumnConfig {
  id: string;
  title: string;
  status: string;
  color: string;
  badgeColor: string;
}

interface UpdateCounts {
  [taskId: string]: number;
}

interface TaskBoardColumnProps {
  column: ColumnConfig;
  tasks: Task[];
  handleEditTask: (task: Task) => void;
  handleDeleteConfirm: (task: Task) => void;
  handleTaskUpdates: (task: Task) => void;
  handleShowUpdates: (task: Task) => void;
  handleAddSubtask: (task: Task) => void;
  handleCreateTask: (status: string) => void;
  projectId: string;
  isColumnCollapsed: (columnId: string) => boolean;
  toggleColumnCollapsed: (columnId: string) => void;
  taskUpdateCounts?: UpdateCounts;
}

const TaskBoardColumn: React.FC<TaskBoardColumnProps> = ({
  column,
  tasks,
  handleEditTask,
  handleDeleteConfirm,
  handleTaskUpdates,
  handleShowUpdates,
  handleAddSubtask,
  handleCreateTask,
  projectId,
  isColumnCollapsed,
  toggleColumnCollapsed,
  taskUpdateCounts = {}
}) => {
  const isCollapsed = isColumnCollapsed(column.id);
  
  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleColumnCollapsed(column.id);
  };

  // Determine which tasks to display
  const displayedTasks = isCollapsed && tasks.length > 2 
    ? tasks.slice(0, 2)  // Show only first 2 tasks when collapsed
    : tasks;
  
  return (
    <div className="flex flex-col h-full group relative bg-gray-50 rounded-md shadow-sm">
      <div className={`p-3 rounded-t-md ${column.color} border-b-2`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{column.title}</h3>
            <span className="font-bold text-base text-black">
              ({tasks.length})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateTask(column.status);
                    }} 
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

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                    onClick={handleToggleCollapse}
                    title={isCollapsed ? 'Show all tasks' : 'Show preview'}
                  >
                    {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isCollapsed ? 'Show all tasks' : 'Show preview'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      <Droppable droppableId={column.id}>
        {provided => (
          <div 
            ref={provided.innerRef} 
            {...provided.droppableProps} 
            className="p-2 min-h-[200px] h-full overflow-y-auto"
          >
            {displayedTasks.length > 0 ? (
              <div className="space-y-2">
                {displayedTasks.map((task, index) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    index={index} 
                    handleEditTask={handleEditTask} 
                    handleDeleteConfirm={handleDeleteConfirm} 
                    handleTaskUpdates={handleTaskUpdates}
                    handleShowUpdates={handleShowUpdates}
                    handleAddSubtask={handleAddSubtask}
                    updateCount={taskUpdateCounts[task.id] || 0}
                  />
                ))}
                
                {/* Show count of hidden tasks when collapsed */}
                {isCollapsed && tasks.length > 2 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-xs mt-2 text-gray-500 hover:text-gray-800"
                    onClick={handleToggleCollapse}
                  >
                    {tasks.length - 2} more task{tasks.length - 2 !== 1 ? 's' : ''}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No tasks in this column
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskBoardColumn;
