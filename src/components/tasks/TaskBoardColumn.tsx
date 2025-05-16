
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
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
  projectId: string;
  tasks: Task[];
  handleEditTask: (task: Task) => void;
  handleDeleteConfirm: (task: Task) => void;
  handleTaskUpdates: (task: Task) => void;
  handleShowUpdates: (task: Task) => void;
  handleAddSubtask: (task: Task) => void;
  handleCreateTask: (status: string) => void;
  isColumnCollapsed: (columnId: string) => boolean;
  toggleColumnCollapsed: (columnId: string) => void;
  taskUpdateCounts: Record<string, number>;
  disabled?: boolean;
}

const TaskBoardColumn: React.FC<TaskBoardColumnProps> = ({
  column,
  projectId,
  tasks,
  handleEditTask,
  handleDeleteConfirm,
  handleTaskUpdates,
  handleShowUpdates,
  handleAddSubtask,
  handleCreateTask,
  isColumnCollapsed,
  toggleColumnCollapsed,
  taskUpdateCounts,
  disabled = false
}) => {
  const isCollapsed = isColumnCollapsed(column.id);
  
  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      toggleColumnCollapsed(column.id);
    }
  };
  
  // Change threshold from 2 to 5
  const displayedTasks = isCollapsed && tasks.length > 5 
    ? tasks.slice(0, 5) 
    : tasks;

  return (
    <div className={`flex flex-col h-full group relative bg-gray-50 rounded-md shadow-sm ${disabled ? 'opacity-70 pointer-events-none' : ''}`}>
      <div className={`p-3 rounded-t-md ${column.color} border-b-2`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium truncate">{column.title}</h3>
            <Badge className={column.badgeColor}>
              {tasks.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                  handleCreateTask(column.status);
                }
              }}
              title={`Add task to ${column.title}`}
              disabled={disabled}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={handleToggleCollapse}
              title={isCollapsed ? 'Show all tasks' : 'Show preview'}
              disabled={disabled}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <Droppable droppableId={column.id} isDropDisabled={disabled}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-2 min-h-[200px] h-full overflow-y-auto ${snapshot.isDraggingOver ? 'bg-gray-100' : ''}`}
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
                
                {isCollapsed && tasks.length > 5 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-xs mt-2 text-gray-500 hover:text-gray-800"
                    onClick={handleToggleCollapse}
                    disabled={disabled}
                  >
                    {tasks.length - 5} more task{tasks.length - 5 !== 1 ? 's' : ''}
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
