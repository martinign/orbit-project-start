
import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import TaskCard from './TaskCard';

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
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex flex-col h-full group relative bg-gray-50 rounded-md shadow-sm">
      <Collapsible
        open={isExpanded}
        onOpenChange={setIsExpanded}
        className="h-full flex flex-col"
      >
        <div className={`p-3 rounded-t-md ${column.color} border-b-2`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium truncate">{column.title}</h3>
              <Badge className={column.badgeColor}>
                {tasks.length}
              </Badge>
            </div>
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => handleCreateTask(column.status)}
                title={`Add task to ${column.title}`}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => e.stopPropagation()}
                  title={isExpanded ? 'Collapse section' : 'Expand section'}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </div>
        
        <CollapsibleContent className="flex-grow overflow-hidden">
          <Droppable droppableId={column.id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="p-2 min-h-[200px] h-full overflow-y-auto"
              >
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
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default TaskColumn;
