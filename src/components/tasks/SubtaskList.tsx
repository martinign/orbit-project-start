
import React from 'react';
import { SubtaskItem } from './SubtaskItem';
import { useTaskCardContext } from './TaskCardContainer';

interface SubtaskListProps {
  subtasks: Array<any>;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({ subtasks }) => {
  const { handleEditSubtask, handleDeleteSubtaskConfirm } = useTaskCardContext();
  
  if (subtasks.length === 0) {
    return null;
  }

  return (
    <div className="ml-7 pl-2 border-l-2 border-gray-300 mt-2 mb-2">
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <SubtaskItem
            key={subtask.id}
            subtask={subtask}
            onEdit={handleEditSubtask}
            onDelete={handleDeleteSubtaskConfirm}
          />
        ))}
      </div>
    </div>
  );
};
