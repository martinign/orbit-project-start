
import { Droppable } from '@hello-pangea/dnd';
import { Archive } from 'lucide-react';
import { ARCHIVE_DROPPABLE_ID } from './columns-config';

export const CompactArchiveDropZone = () => {
  return (
    <div className="mb-4 flex justify-center">
      <Droppable droppableId={ARCHIVE_DROPPABLE_ID} direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              px-4 py-2 rounded-full border-2 border-dashed transition-all duration-200 flex items-center gap-2
              ${snapshot.isDraggingOver 
                ? 'bg-purple-100 border-purple-500 shadow-md scale-105' 
                : 'bg-gray-50 border-gray-300 hover:border-purple-300'
              }
            `}
          >
            <Archive 
              className={`h-4 w-4 ${
                snapshot.isDraggingOver ? 'text-purple-600' : 'text-gray-500'
              }`} 
            />
            <span 
              className={`text-sm font-medium ${
                snapshot.isDraggingOver ? 'text-purple-700' : 'text-gray-600'
              }`}
            >
              {snapshot.isDraggingOver ? "Drop to Archive" : "Archive Zone"}
            </span>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
