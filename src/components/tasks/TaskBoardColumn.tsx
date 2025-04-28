
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TaskCard from '../TaskCard';
import { ColumnConfig } from './columns-config';

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

interface TaskBoardColumnProps {
  column: ColumnConfig;
  tasks: Task[];
  handleEditTask: (task: Task) => void;
  handleDeleteConfirm: (task: Task) => void;
  handleTaskUpdates: (task: Task) => void;
  handleAddSubtask: (task: Task) => void;
  handleCreateTask: (status: string) => void;
  handleShowUpdates?: (task: Task) => void; // Add this prop
}

const TaskBoardColumn: React.FC<TaskBoardColumnProps> = ({
  column,
  tasks,
  handleEditTask,
  handleDeleteConfirm,
  handleTaskUpdates,
  handleAddSubtask,
  handleCreateTask,
  handleShowUpdates, // Add this prop
}) => {
  return (
    <div className="flex flex-col">
      <div className={`mb-2 p-2 rounded-t-md ${column.headerBgClass}`}>
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm">{column.title}</span>
          <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      <Droppable droppableId={column.status}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 bg-gray-50 p-2 min-h-[300px] rounded-b-md overflow-y-auto"
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
                handleShowUpdates={handleShowUpdates} // Pass the show updates handler
              />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && (
              <div className="flex justify-center items-center h-full min-h-[100px]">
                <Button
                  variant="ghost" 
                  className="border border-dashed border-gray-300 w-full py-6 text-gray-500 hover:bg-gray-100"
                  onClick={() => handleCreateTask(column.status)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskBoardColumn;
