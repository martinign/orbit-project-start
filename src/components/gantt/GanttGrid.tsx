
import React, { useMemo, useState } from 'react';
import { eachDayOfInterval, format } from 'date-fns';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TasksList } from './TasksList';
import { TimelineHeader } from './TimelineHeader';
import { TaskGrid } from './TaskGrid';
import { GanttTask } from '@/types/gantt';

interface GanttGridProps {
  tasks: GanttTask[];
  startDate: Date;
  endDate: Date;
  projectId: string;
  onEditTask?: (task: GanttTask) => void;
}

export const GanttGrid: React.FC<GanttGridProps> = ({ 
  tasks, 
  startDate, 
  endDate, 
  projectId,
  onEditTask
}) => {
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

  const timelineData = useMemo(() => {
    const dates = eachDayOfInterval({ start: startDate, end: endDate });
    const columnWidth = 80; // Fixed width for day columns

    // Group dates by month
    const months = dates.reduce((acc, date) => {
      const monthKey = format(date, 'MMM yyyy');
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(date);
      return acc;
    }, {} as Record<string, Date[]>);

    return { dates, columnWidth, months };
  }, [startDate, endDate]);

  const toggleMonth = (monthKey: string) => {
    setCollapsedMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey);
      } else {
        newSet.add(monthKey);
      }
      return newSet;
    });
  };

  const visibleDates = useMemo(() => {
    return timelineData.dates.filter(date => {
      const monthKey = format(date, 'MMM yyyy');
      return !collapsedMonths.has(monthKey);
    });
  }, [timelineData.dates, collapsedMonths]);

  const tasksWithDependencies = useMemo(() => {
    return tasks.map(task => ({
      ...task,
      dependencyObjects: tasks.filter(t => 
        task.dependencies && Array.isArray(task.dependencies) && 
        task.dependencies.includes(t.id)
      )
    }));
  }, [tasks]);

  const contentWidth = visibleDates.length * timelineData.columnWidth;

  return (
    <div className="h-[600px] flex">
      <TasksList 
        tasks={tasksWithDependencies}
        onEditTask={onEditTask}
      />

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[600px]">
          <div style={{ width: contentWidth }} className="relative">
            <TimelineHeader
              months={timelineData.months}
              visibleDates={visibleDates}
              collapsedMonths={collapsedMonths}
              columnWidth={timelineData.columnWidth}
              onToggleMonth={toggleMonth}
            />

            <TaskGrid
              tasks={tasksWithDependencies}
              startDate={startDate}
              endDate={endDate}
              contentWidth={contentWidth}
              columnWidth={timelineData.columnWidth}
              onEditTask={onEditTask}
              collapsedMonths={collapsedMonths}
              projectId={projectId}
            />
          </div>
          <ScrollBar 
            orientation="horizontal" 
            className="h-2 !block select-none rounded-none border-none bg-gray-100 transition-colors hover:bg-gray-200" 
            thumbnailClassName="bg-gray-400 hover:bg-gray-500 transition-colors rounded-none !h-full"
          />
        </ScrollArea>
      </div>
    </div>
  );
};
