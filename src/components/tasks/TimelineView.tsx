// src/components/tasks/timeline/TimelineView.tsx

import React, { useState, useEffect } from 'react';
import {
  format,
  isToday,
  eachDayOfInterval,
  addMonths,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { TaskDetailsDialog } from './timeline/TaskDetailsDialog';
import { TimelineTaskList } from './timeline/TimelineTaskList';
import { TimelineTaskBar } from './timeline/TimelineTaskBar';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { GripVertical } from 'lucide-react';
import { useTextWidth } from '@/hooks/useTextWidth';
import { toast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

interface TimelineViewProps {
  tasks: Task[];
  isLoading: boolean;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  isLoading,
}) => {
  const [days, setDays] = useState<Date[]>([]);
  const [months, setMonths] = useState<{ month: string; days: number }[]>(
    []
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Measure longest title for the left panel
  const titles = tasks.map((t) => t.title);
  const maxTitleW = useTextWidth(titles);

  // Build days + months once tasks arrive
  useEffect(() => {
    if (!tasks.length) return;
    try {
      const today = new Date();
      const createdDates = tasks
        .map((t) => (t.created_at ? new Date(t.created_at) : null))
        .filter((d): d is Date => !!d);

      const earliest = createdDates.length
        ? new Date(Math.min(...createdDates.map((d) => d.getTime())))
        : today;

      // Range: 1 month before earliest → 2 months after today
      const start = startOfMonth(addMonths(earliest, -1));
      const end = endOfMonth(addMonths(today, 2));
      const all = eachDayOfInterval({ start, end });
      setDays(all);

      const cnts: Record<string, number> = {};
      all.forEach((d) => {
        const key = format(d, 'MMM yyyy');
        cnts[key] = (cnts[key] || 0) + 1;
      });
      setMonths(
        Object.entries(cnts).map(([month, cnt]) => ({
          month,
          days: cnt,
        }))
      );
    } catch (err) {
      console.error(err);
      toast({
        title: 'Timeline Error',
        description: 'Failed to generate timeline.',
        variant: 'destructive',
      });
    }
  }, [tasks]);

  if (isLoading)
    return <div className="text-center py-6">Loading tasks…</div>;
  if (!tasks.length)
    return <div className="text-center py-6">No tasks found.</div>;
  if (!days.length)
    return <div className="text-center py-6">Building timeline…</div>;

  // FIXED pixels per day for legibility
  const DAY_WIDTH = 30; // adjust as needed
  const chartWidth = days.length * DAY_WIDTH; // total px width
  const today = new Date();

  return (
    <div className="border rounded-md h-full overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left: Task list (pinned) */}
        <ResizablePanel
          defaultSize={15}
          minSize={10}
          maxSize={30}
          className="min-w-0"
        >
          <TimelineTaskList
            tasks={tasks}
            width={maxTitleW + 32}
          />
        </ResizablePanel>

        <ResizableHandle withHandle>
          <GripVertical className="h-4 w-4 text-gray-400" />
        </ResizableHandle>

        {/* Right: Timeline (scrollable) */}
        <ResizablePanel
          defaultSize={85}
          className="min-w-0 overflow-hidden"
        >
          <div className="flex flex-col h-full">
            <ScrollArea orientation="horizontal" className="flex-1">
              {/* Wide inner wrapper forces overflow */}
              <div
                className="relative"
                style={{ width: chartWidth }}
              >
                {/* Sticky Header: Months */}
                <div className="sticky top-0 bg-background z-10">
                  <div className="flex h-10 border-b">
                    {months.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-center border-r text-sm font-medium"
                        style={{ width: m.days * DAY_WIDTH }}
                      >
                        {m.month}
                      </div>
                    ))}
                  </div>
                  {/* Days Row */}
                  <div className="flex h-10 border-b">
                    {days.map((d, i) => (
                      <div
                        key={i}
                        className={`flex-none flex items-center justify-center border-r ${
                          isToday(d) ? 'bg-blue-100 font-bold' : ''
                        }`}
                        style={{ width: DAY_WIDTH }}
                      >
                        <span className="text-xs">
                          {format(d, 'd')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Bars */}
                <div className="relative divide-y">
                  {tasks.map((task) => {
                    const startDate = task.created_at
                      ? new Date(task.created_at)
                      : today;
                    const endDate = task.updated_at
                      ? new Date(task.updated_at)
                      : today;
                    const completed =
                      task.status === 'completed';

                    // offset in days from start
                    const offsetDays = Math.max(
                      0,
                      Math.floor(
                        (startDate.getTime() -
                          days[0].getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    );
                    // duration in days
                    const rawDur = Math.ceil(
                      ((completed
                        ? endDate
                        : today
                      ).getTime() -
                        startDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    const durationDays = Math.max(1, rawDur);

                    return (
                      <div
                        key={task.id}
                        className="h-[36px] relative"
                      >
                        <TimelineTaskBar
                          task={task}
                          style={{
                            left:
                              offsetDays * DAY_WIDTH,
                            width:
                              durationDays * DAY_WIDTH,
                          }}
                          onClick={() =>
                            setSelectedTask(task)
                          }
                          durationDays={durationDays}
                          isCompleted={completed}
                        />
                      </div>
                    );
                  })}

                  {/* Today Indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-blue-500 z-20"
                    style={{
                      left:
                        days.findIndex((d) =>
                          isToday(d)
                        ) * DAY_WIDTH,
                    }}
                  />
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={() =>
          setSelectedTask(null)
        }
      />
    </div>
  );
};
