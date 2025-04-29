
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  handleShowUpdates: (task: Task) => void;
  handleAddSubtask: (task: Task) => void;
  handleCreateTask: (status: string) => void;
  projectId: string;
  isColumnCollapsed: (columnId: string) => boolean;
  toggleColumnCollapsed: (columnId: string) => void;
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
  toggleColumnCollapsed
}) => {
  const isCollapsed = isColumnCollapsed(column.id);
  
  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleColumnCollapsed(column.id);
  };
  
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
                    title={isCollapsed ? 'Show tasks' : 'Hide tasks'}
                  >
                    {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isCollapsed ? 'Show tasks' : 'Hide tasks'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      {!isCollapsed && (
        <Droppable droppableId={column.id}>
          {provided => (
            <div 
              ref={provided.innerRef} 
              {...provided.droppableProps} 
              className="p-2 min-h-[200px] h-full overflow-y-auto"
            >
              {tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task, index) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      index={index} 
                      handleEditTask={handleEditTask} 
                      handleDeleteConfirm={handleDeleteConfirm} 
                      handleTaskUpdates={handleTaskUpdates}
                      handleShowUpdates={handleShowUpdates}
                      handleAddSubtask={handleAddSubtask} 
                    />
                  ))}
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
      )}
    </div>
  );
};

export default TaskBoardColumn;
