
import React, { useState, useMemo } from 'react';
import { addDays, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Card } from "@/components/ui/card";
import { GanttToolbar } from './GanttToolbar';
import { GanttGrid } from './GanttGrid';

interface GanttChartProps {
  tasks: any[];
}

export const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');

  const { startDate, endDate } = useMemo(() => {
    // Find the earliest start date from tasks
    const firstDate = tasks.reduce((earliest, task) => {
      if (!task.start_date) return earliest;
      const taskDate = new Date(task.start_date);
      return taskDate < earliest ? taskDate : earliest;
    }, new Date());

    // Calculate the latest end date based on task durations
    const lastDate = tasks.reduce((latest, task) => {
      if (!task.start_date || !task.duration_days) return latest;
      const taskEnd = addDays(new Date(task.start_date), task.duration_days);
      return taskEnd > latest ? taskEnd : latest;
    }, addDays(new Date(), 30));

    // Extend the range to show some context
    const start = startOfMonth(firstDate);
    const end = endOfMonth(addMonths(lastDate, 1));

    return { startDate: start, endDate: end };
  }, [tasks]);

  return (
    <Card>
      <div className="p-4">
        <GanttToolbar view={view} onViewChange={setView} />
        <div className="overflow-x-auto">
          <GanttGrid
            tasks={tasks}
            startDate={startDate}
            endDate={endDate}
            view={view}
          />
        </div>
      </div>
    </Card>
  );
};
