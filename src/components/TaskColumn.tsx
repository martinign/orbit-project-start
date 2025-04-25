import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import TaskCard from './TaskCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  handleAddSubtask: (task: Task) => void;
  handleCreateTask: (status: string) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  column,
  tasks,
  handleEditTask,
  handleDeleteConfirm,
  handleTaskUpdates,
  handleAddSubtask,
  handleCreateTask,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex flex-col h-full group">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className={`p-3 rounded-t-md ${column.color} border-b-2`}>
          <div className="flex justify-between items-center">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80">
              <div>
                <h3 className="font-medium">{column.title}</h3>
                <Badge className={column.badgeColor}>
                  {tasks.length}
                </Badge>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1" />
              )}
            </CollapsibleTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => handleCreateTask(column.status)}
              title={`Add task to ${column.title}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CollapsibleContent>
          <Droppable droppableId={column.id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-gray-50 rounded-b-md p-2 flex-grow min-h-[50px] transition-all duration-200"
              >
                {tasks.map((task, index) => (
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
