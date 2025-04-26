import React, { useMemo, useState } from 'react';
import { eachDayOfInterval, format } from 'date-fns';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TasksList } from './TasksList';
import { TimelineHeader } from './TimelineHeader';
import { TaskGrid } from './TaskGrid';
import { GanttTask } from '@/types/gantt';
import { useGanttColumnWidth } from '@/hooks/useGanttColumnWidth';

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

    // Group dates by month
    const months = dates.reduce((acc, date) => {
      const monthKey = format(date, 'MMM yyyy');
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(date);
      return acc;
    }, {} as Record<string, Date[]>);

    return { dates, months };
  }, [startDate, endDate]);

  const visibleDates = useMemo(() => {
    return timelineData.dates.filter(date => {
      const monthKey = format(date, 'MMM yyyy');
      return !collapsedMonths.has(monthKey);
    });
  }, [timelineData.dates, collapsedMonths]);

  const columnWidth = useGanttColumnWidth({
    visibleDatesCount: visibleDates.length,
  });

  const contentWidth = visibleDates.length * columnWidth;

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

  return (
    <div className="h-[600px] flex">
      {/* Fixed width task list column */}
      <div className="w-[200px] flex-none">
        <TasksList 
          tasks={tasks}
          onEditTask={onEditTask}
        />
      </div>

      {/* Responsive width scrollable timeline container */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[600px]">
          <div style={{ minWidth: contentWidth }}>
            <TimelineHeader
              months={timelineData.months}
              visibleDates={visibleDates}
              collapsedMonths={collapsedMonths}
              columnWidth={columnWidth}
              onToggleMonth={toggleMonth}
            />

            <TaskGrid
              tasks={tasks}
              startDate={startDate}
              endDate={endDate}
              contentWidth={contentWidth}
              columnWidth={columnWidth}
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
