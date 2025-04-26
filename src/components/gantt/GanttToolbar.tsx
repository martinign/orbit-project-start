
import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

export const GanttToolbar: React.FC = () => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      <div className="text-sm text-muted-foreground">
        Daily View
      </div>
    </div>
  );
};
