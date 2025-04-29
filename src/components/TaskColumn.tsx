
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import TaskCard from './TaskCard';
import { useCollapsibleTaskColumns } from '@/hooks/useCollapsibleTaskColumns';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id: string;
  assigned_to?: string;
}

interface ColumnConfig {
  id: string;
  title: string;
  status: string;
  color: string;
  badgeColor: string;
}

interface TaskColumnProps {
  column: ColumnConfig;
  tasks: Task[];
  handleEditTask: (task: Task) => void;
  handleDeleteConfirm: (task: Task) => void;
  handleTaskUpdates: (task: Task) => void;
  handleShowUpdates: (task: Task) => void;
  handleAddSubtask: (task: Task) => void;
  handleCreateTask: (status: string) => void;
  projectId: string;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  column,
  tasks,
  handleEditTask,
  handleDeleteConfirm,
  handleTaskUpdates,
  handleShowUpdates,
  handleAddSubtask,
  handleCreateTask,
  projectId
}) => {
  const { isColumnCollapsed, toggleColumnCollapsed } = useCollapsibleTaskColumns(projectId);
  const isCollapsed = isColumnCollapsed(column.id);

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleColumnCollapsed(column.id);
  };

  return (
    <div className="flex flex-col h-full group relative bg-gray-50 rounded-md shadow-sm">
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
                handleCreateTask(column.status);
              }}
              title={`Add task to ${column.title}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={handleToggleCollapse}
              title={isCollapsed ? 'Show tasks' : 'Hide tasks'}
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
      
      {!isCollapsed && (
        <Droppable droppableId={column.id}>
          {(provided) => (
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

export default TaskColumn;
