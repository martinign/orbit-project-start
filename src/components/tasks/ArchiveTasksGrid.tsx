
import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from '@/components/TaskCard';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id: string;
  is_archived?: boolean;
  assigned_to?: string;
  is_gantt_task?: boolean;
  is_private?: boolean;
  user_id?: string;
  created_at?: string;
  workday_code_id?: string;
}

interface ArchiveTasksGridProps {
  tasks: Task[];
  projectId: string;
  handleEditTask: (task: Task) => void;
  handleDeleteConfirm: (task: Task) => void;
  handleTaskUpdates: (task: Task) => void;
  handleShowUpdates: (task: Task) => void;
  handleAddSubtask: (task: Task) => void;
  taskUpdateCounts: Record<string, number>;
  disabled: boolean;
}

export const ArchiveTasksGrid: React.FC<ArchiveTasksGridProps> = ({
  tasks,
  projectId,
  handleEditTask,
  handleDeleteConfirm,
  handleTaskUpdates,
  handleShowUpdates,
  handleAddSubtask,
  taskUpdateCounts,
  disabled
}) => {
  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          📦 Archived Tasks
          <span className="text-sm font-normal text-gray-500">
            ({tasks.length})
          </span>
        </h3>
      </div>

      <Droppable droppableId="archived" direction="vertical">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              grid gap-4 auto-rows-max
              grid-cols-1 
              md:grid-cols-2 
              lg:grid-cols-3 
              xl:grid-cols-4
              2xl:grid-cols-5
              min-h-[200px] 
              p-4 
              rounded-lg 
              border-2 
              border-dashed 
              transition-colors
              ${snapshot.isDraggingOver 
                ? 'bg-purple-50 border-purple-300' 
                : 'bg-gray-50 border-gray-200'
              }
              ${disabled ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            {tasks.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500 text-lg mb-2">No archived tasks</p>
                <p className="text-gray-400 text-sm">
                  Tasks moved to archive will appear here
                </p>
              </div>
            ) : (
              tasks.map((task, index) => (
                <div key={task.id} className="h-fit">
                  <TaskCard
                    task={task}
                    index={index}
                    handleEditTask={handleEditTask}
                    handleDeleteConfirm={handleDeleteConfirm}
                    handleTaskUpdates={handleTaskUpdates}
                    handleShowUpdates={handleShowUpdates}
                    handleAddSubtask={handleAddSubtask}
                    updateCount={taskUpdateCounts[task.id] || 0}
                  />
                </div>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
