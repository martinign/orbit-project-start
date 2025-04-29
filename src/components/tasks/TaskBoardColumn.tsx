
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TaskCard from '../TaskCard';

interface Task {
  id: string;
  title: string;
}

interface Column {
  id: string;
  title: string;
  status: string;
  color: string;
  icon: React.ReactNode;
}

interface TaskBoardColumnProps {
  column: Column;
  tasks: Task[];
  handleEditTask: (task: Task) => void;
  handleDeleteConfirm: (task: Task) => void;
  handleTaskUpdates: (task: Task) => void;
  handleAddSubtask: (task: Task) => void;
  handleCreateTask: (status: string) => void;
  handleShowUpdates?: (task: Task) => void;
}

const TaskBoardColumn: React.FC<TaskBoardColumnProps> = ({
  column,
  tasks,
  handleEditTask,
  handleDeleteConfirm,
  handleTaskUpdates,
  handleAddSubtask,
  handleCreateTask,
  handleShowUpdates
}) => {
  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-md p-2">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className={`${column.color} h-4 w-4 rounded-full`}></div>
          <h3 className="font-medium text-sm">
            {column.title} ({tasks.length})
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCreateTask(column.status)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-grow overflow-y-auto"
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={() => handleEditTask(task)}
                onDelete={() => handleDeleteConfirm(task)}
                onUpdate={() => handleTaskUpdates(task)}
                onAddSubtask={() => handleAddSubtask(task)}
                onShowUpdates={handleShowUpdates ? () => handleShowUpdates(task) : undefined}
              />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && (
              <div className="text-center p-4 text-sm text-muted-foreground">
                No tasks
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskBoardColumn;
