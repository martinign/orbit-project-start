
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from 'lucide-react';

interface GanttToolbarProps {
  view: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
}

export const GanttToolbar: React.FC<GanttToolbarProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center rounded-md border p-1">
        <Button
          variant={view === 'day' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('day')}
        >
          Day
        </Button>
        <Button
          variant={view === 'week' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('week')}
        >
          Week
        </Button>
        <Button
          variant={view === 'month' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('month')}
        >
          Month
        </Button>
      </div>
    </div>
  );
};
