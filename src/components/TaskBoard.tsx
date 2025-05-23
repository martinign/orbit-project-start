
import React, { useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { TooltipProvider } from '@/components/ui/tooltip';
import TaskBoardColumn from './tasks/TaskBoardColumn';
import { TaskDialogs } from './tasks/TaskDialogs';
import { useTaskBoard } from '@/hooks/useTaskBoard';
import { useTaskDragAndDrop } from '@/hooks/useTaskDragAndDrop';
import { columnsConfig, ARCHIVE_DROPPABLE_ID } from './tasks/columns-config';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCollapsibleTaskColumns } from '@/hooks/useCollapsibleTaskColumns';
import { useProjectTaskUpdates } from '@/hooks/useProjectTaskUpdates';
import { Archive, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id: string;
  is_archived?: boolean;
}

interface TaskBoardProps {
  tasks: Task[];
  projectId: string;
  onRefetch: () => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, projectId, onRefetch }) => {
  const queryClient = useQueryClient();
  const { isColumnCollapsed, toggleColumnCollapsed, isCardExpanded, toggleCardExpanded } = useCollapsibleTaskColumns(projectId);
  const { updateCounts, markTaskUpdatesAsViewed } = useProjectTaskUpdates(projectId);
  const [showArchiveZone, setShowArchiveZone] = useState(false);
  
  const {
    selectedTask,
    isDialogOpen,
    isDeleteConfirmOpen,
    isUpdateDialogOpen,
    isUpdatesDisplayOpen,
    isSubtaskDialogOpen,
    isCreateTaskDialogOpen,
    selectedStatus,
    isDeleting,
    isRefetching,
    setIsDialogOpen,
    setIsDeleteConfirmOpen,
    setIsUpdateDialogOpen,
    setIsUpdatesDisplayOpen,
    setIsSubtaskDialogOpen,
    setIsCreateTaskDialogOpen,
    handleEditTask,
    handleDeleteConfirm,
    handleTaskUpdates,
    handleShowUpdates,
    handleAddSubtask,
    handleCreateTask,
    deleteTask,
    handleCloseDialogs,
  } = useTaskBoard(onRefetch);

  const { handleDragEnd } = useTaskDragAndDrop(onRefetch);

  useEffect(() => {
    const channel = supabase.channel('taskboard-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_tasks'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["new_tasks_count"] });
        if (onRefetch) onRefetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, onRefetch]);

  // Handle when a user views task updates - mark them as viewed
  const handleViewTaskUpdates = (task: Task) => {
    handleShowUpdates(task);
    markTaskUpdatesAsViewed(task.id);
  };

  // Filter tasks to show only non-archived in regular columns
  // and only archived in archive column
  const getTasksForColumn = (status: string, isArchiveColumn: boolean = false) => {
    if (isArchiveColumn) {
      return tasks.filter(task => 
        task.is_archived === true
      );
    }
    return tasks.filter(task => 
      task.status.toLowerCase() === status.toLowerCase() && 
      task.is_archived !== true
    );
  };

  // Toggle archive drop zone visibility
  const toggleArchiveZone = () => {
    setShowArchiveZone(!showArchiveZone);
  };

  return (
    <div className="h-full">
      <TooltipProvider>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 ${(isDeleting || isRefetching) ? 'opacity-70 pointer-events-none' : ''}`}>
            {columnsConfig.map((column) => (
              <TaskBoardColumn
                key={column.id}
                column={column}
                projectId={projectId}
                tasks={getTasksForColumn(column.status, column.isArchive)}
                handleEditTask={handleEditTask}
                handleDeleteConfirm={handleDeleteConfirm}
                handleTaskUpdates={handleTaskUpdates}
                handleShowUpdates={handleViewTaskUpdates}
                handleAddSubtask={handleAddSubtask}
                handleCreateTask={handleCreateTask}
                isColumnCollapsed={isColumnCollapsed}
                toggleColumnCollapsed={toggleColumnCollapsed}
                taskUpdateCounts={updateCounts}
                disabled={isDeleting || isRefetching}
              />
            ))}
          </div>

          {/* Archive drop zone toggle button */}
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={toggleArchiveZone}
            >
              <Archive className="h-4 w-4" />
              {showArchiveZone ? "Hide Archive Zone" : "Show Archive Zone"}
              {showArchiveZone ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Archive drop zone */}
          {showArchiveZone && (
            <Droppable droppableId={ARCHIVE_DROPPABLE_ID} direction="horizontal">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`mt-4 p-4 h-24 border-2 border-dashed rounded-lg flex items-center justify-center
                    ${snapshot.isDraggingOver ? 'bg-purple-100 border-purple-500' : 'bg-gray-50 border-gray-300'}`}
                >
                  <div className="flex flex-col items-center">
                    <Archive className={`h-8 w-8 ${snapshot.isDraggingOver ? 'text-purple-500' : 'text-gray-400'}`} />
                    <p className={`mt-2 text-sm ${snapshot.isDraggingOver ? 'text-purple-700' : 'text-gray-500'}`}>
                      {snapshot.isDraggingOver ? "Drop to archive" : "Drag tasks here to archive"}
                    </p>
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </DragDropContext>
      </TooltipProvider>

      <TaskDialogs
        selectedTask={selectedTask}
        projectId={projectId}
        isDialogOpen={isDialogOpen}
        isDeleteConfirmOpen={isDeleteConfirmOpen}
        isUpdateDialogOpen={isUpdateDialogOpen}
        isUpdatesDisplayOpen={isUpdatesDisplayOpen}
        isSubtaskDialogOpen={isSubtaskDialogOpen}
        isCreateTaskDialogOpen={isCreateTaskDialogOpen}
        isDeleting={isDeleting}
        setIsDialogOpen={setIsDialogOpen}
        setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
        setIsUpdateDialogOpen={setIsUpdateDialogOpen}
        setIsUpdatesDisplayOpen={setIsUpdatesDisplayOpen}
        setIsSubtaskDialogOpen={setIsSubtaskDialogOpen}
        setIsCreateTaskDialogOpen={setIsCreateTaskDialogOpen}
        onRefetch={onRefetch}
        deleteTask={deleteTask}
        selectedStatus={selectedStatus}
      />
    </div>
  );
};

export default TaskBoard;
