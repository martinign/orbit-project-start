
import React, { useState } from 'react';
import { useSubtasks } from '@/hooks/useSubtasks';
import { TaskCardContainer, useTaskCardContext } from './tasks/TaskCardContainer';
import { DraggableTaskCard } from './tasks/DraggableTaskCard';
import { SubtaskList } from './tasks/SubtaskList';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id: string;
  assigned_to?: string;
  is_gantt_task?: boolean;
  user_id?: string;
  created_at?: string;
  workday_code_id?: string;
}

interface TaskCardProps {
  task: Task;
  index: number;
  handleEditTask: (task: Task) => void;
  handleDeleteConfirm: (task: Task) => void;
  handleTaskUpdates: (task: Task) => void;
  handleShowUpdates: (task: Task) => void;
  handleAddSubtask: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  handleEditTask,
  handleDeleteConfirm,
  handleTaskUpdates,
  handleShowUpdates,
  handleAddSubtask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { subtasks } = useSubtasks(task.id);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mb-0">
      <TaskCardContainer 
        task={task}
        index={index}
        handleEditTask={handleEditTask}
        handleDeleteConfirm={handleDeleteConfirm}
        handleTaskUpdates={handleTaskUpdates}
        handleShowUpdates={handleShowUpdates}
        handleAddSubtask={handleAddSubtask}
      >
        <DraggableTaskCard
          task={task}
          index={index}
          subtasksCount={subtasks.length}
          isExpanded={isExpanded}
          toggleExpand={toggleExpand}
          onEdit={handleEditTask}
          onDelete={handleDeleteConfirm}
          onUpdate={handleTaskUpdates}
          onAddSubtask={handleAddSubtask}
          onShowUpdates={handleShowUpdates}
        />
        
        {isExpanded && subtasks.length > 0 && <SubtaskList subtasks={subtasks} />}
      </TaskCardContainer>
    </div>
  );
};

export default TaskCard;
